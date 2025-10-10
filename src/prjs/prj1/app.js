import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../../libs/utils.js";


//------------------------------------------------------------------------------
// CGI - Project 1
// Bruno Ramos 52886
// Lipy Cardoso 63542
// Script for rendering various parametric curves with WebGL2
//--------------------------------------------------------------------------------


//=== Global Variables ==========================================================

// WebGL context, program, buffers
let canvas;
let gl;
let program;
let vao;
let aBuffer;

// Number of sample points for curve rendering
let samplePointsN = 60000;

// Current curve family selection
let curveFamilyValue = 0;

// Current user-selected coefficient index (0, 1, or 2)
let selectedCoefIndex = 0; 

// Animation direction control: 1 for increasing, -1 for decreasing
let animDirection = 1;

// View parameters for panning and zooming - default values
let panxValue = 0.0;
let panyValue = 0.0;
let zoomValue = 1.0;

// t parameter limits for curve rendering
let tMin = 0.0;
let tMax = 6.283185; // 2*PI

// Step sizes for coefficient and t user adjustments
const COEF_STEP = 0.1;
const T_STEP = 0.1;

// Animation speed factor
let animSpeed = 0.5;

// DVD-logo-style animation velocities for curve family 0
let dvdVelocityX = 0.01;
let dvdVelocityY = 0.007;

// Flag to toggle between line and point rendering - default to line
let drawPoints = false;

// Mouse interaction flag 
let isClicked = false;

// Color mode flag - true for single color, false for gradient
let singleColor = true;

// Coefficient Auto-Animation toggle flag
let autoAnimate = false;

// Mouse starting positions for panning 
let mouse_startX, mouse_startY;

// Uniform locations in shaders 
let u_curveFamily, u_samplePoints, u_a, u_b, u_c, u_tMin, u_tMax, u_panx, u_pany, u_zoom;
let u_singleColor, u_startingColor, u_endingColor, u_colorModeFlag;

// Initial coefficients for curve families 
let coefficients = [1.0, 0.0, 1.0];


// === Functions =================================================================

// Update DVD-logo-style animation position and handle boundary collisions
function updateDVDAnimation() {
    // Only animate when on curve family 0
    if (curveFamilyValue !== 0) {
        return;
    }

    // Update position based on velocity
    panxValue += dvdVelocityX;
    panyValue += dvdVelocityY;

    // Define margin to avoid sticking to edges
    const MARGIN = 0.5; 

    // Calculate aspect ratio
    const aspect = canvas.width / canvas.height;

    // Check boundaries for X axis
    if (panxValue + MARGIN >= aspect || panxValue - MARGIN <= -aspect) {
        dvdVelocityX = -dvdVelocityX;
        panxValue = Math.max(-aspect + MARGIN, Math.min(aspect - MARGIN, panxValue));
        changeBounceColor();
    }

    // Check boundaries for Y axis (stays at 1.0)
    if (panyValue + MARGIN >= 1.0 || panyValue - MARGIN <= -1.0) {
        dvdVelocityY = -dvdVelocityY;
        panyValue = Math.max(-1.0 + MARGIN, Math.min(1.0 - MARGIN, panyValue));
        changeBounceColor();
    }
}

// Change color randomly on bounce (Old DVD style!)
function changeBounceColor() {
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();

    singleColor = true;
    u_singleColor = gl.getUniformLocation(program, "u_singleColor");
    gl.useProgram(program);
    gl.uniform4f(u_singleColor, r, g, b, 1.0);
}

// Update animation speed from slider input
function updateAnimSpeed() {
    const slider = document.getElementById("animSlider");
    const sliderValue = document.getElementById("sliderValue");
    animSpeed = parseFloat(slider.value) * 0.005;
    sliderValue.textContent = slider.value;
}

// Toggle auto-animation state for coefficients
function toggleAutoAnimation() {
    autoAnimate = !autoAnimate;
}

// Toggle interface panel visibility
function togglePanelVisibility(infoPanel) {
    if (infoPanel.style.display === 'none') {
        infoPanel.style.display = 'block';
    } else {
        infoPanel.style.display = 'none';
    }
}

// Change single curve color
function changeCurveColor(r, g, b, a) {

    singleColor = true; // Switch to single color mode

    // Get color from color picker 
    let color = document.getElementById("color-picker").value;

    // Convert hex color to normalized RGB
    r = parseInt(color.slice(1, 3), 16) / 255;
    g = parseInt(color.slice(3, 5), 16) / 255;
    b = parseInt(color.slice(5, 7), 16) / 255;
    a = 1.0; // Opaque

    // Set uniform value in shader
    u_singleColor = gl.getUniformLocation(program, "u_singleColor");

    // Apply color
    gl.useProgram(program);
    gl.uniform4f(u_singleColor, r, g, b, a);
}

// Handle single color change button update
const colorButton = document.getElementById("apply-color-button");
colorButton.addEventListener("click", () => {
    changeCurveColor();
});

// Change gradient curve colors
function changeGradientCurveColor() {

    singleColor = false; // Switch to gradient mode

    // Get colors from color pickers
    let startingColorValue = document.getElementById("startingColorValue").value;
    let endingColorValue = document.getElementById("endingColorValue").value;

    // Convert hex colors to normalized RGB
    let r1 = parseInt(startingColorValue.slice(1, 3), 16) / 255;
    let g1 = parseInt(startingColorValue.slice(3, 5), 16) / 255;
    let b1 = parseInt(startingColorValue.slice(5, 7), 16) / 255;
    let a1 = 1.0; // Opaque

    let r2 = parseInt(endingColorValue.slice(1, 3), 16) / 255;
    let g2 = parseInt(endingColorValue.slice(3, 5), 16) / 255;
    let b2 = parseInt(endingColorValue.slice(5, 7), 16) / 255;
    let a2 = 1.0; // Opaque

    // Set uniform values in shader
    u_startingColor = gl.getUniformLocation(program, "u_startingColor");
    u_endingColor = gl.getUniformLocation(program, "u_endingColor");

    // Apply colors
    gl.useProgram(program);
    gl.uniform4f(u_startingColor, r1, g1, b1, a1);
    gl.uniform4f(u_endingColor, r2, g2, b2, a2);
}

// Handle gradient color change button update
const gradientButton = document.getElementById("apply-gradient-button");
gradientButton.addEventListener("click", () => {
    changeGradientCurveColor();
});

// Update information panel with current parameters
function updateInfoPanel() {
    const curveEl = document.getElementById('curve-number');
    const tMinEl = document.getElementById('t-min');
    const tMaxEl = document.getElementById('t-max');
    const coefsEl = document.getElementById('coefs');
    const sampleEl = document.getElementById('sample-size');

    // Update text content
    curveEl.textContent = curveFamilyValue;
    tMinEl.textContent = tMin.toFixed(2);
    tMaxEl.textContent = tMax.toFixed(2);
    sampleEl.textContent = samplePointsN;

    // Format coefficients with highlighting for selected one
    let coefsText = '[';
    for (let i = 0; i < coefficients.length; i++) {
        if (i === selectedCoefIndex) {
            coefsText += `**${coefficients[i].toFixed(2)}**`;
        } else {
            coefsText += coefficients[i].toFixed(2);
        }
        if (i < coefficients.length - 1) {
            coefsText += ', ';
        }
    }
    coefsText += ']';
    coefsEl.textContent = coefsText;
}

// Coefficient selection functions
function selectNextCoefficient() {
    selectedCoefIndex = (selectedCoefIndex + 1) % coefficients.length;
}

function selectPreviousCoefficient() {
    selectedCoefIndex = (selectedCoefIndex - 1 + coefficients.length) % coefficients.length;
}

// Coefficient modification functions
function increaseSelectedCoefficient(step = COEF_STEP) {
    coefficients[selectedCoefIndex] += step;
}

function decreaseSelectedCoefficient(step = COEF_STEP) {
    coefficients[selectedCoefIndex] -= step;
}

// t parameter modification functions
function increaseT() {
    tMax += T_STEP;
}

function decreaseT() {
    tMax -= T_STEP;
    if (tMax < tMin)
         tMax = tMin; // Prevent tMax from going below tMin
}


// Update number of sample points and reinitialize buffer
function updateSamplePoints(step) {
    if (step == 0) {
        // Reset Sample points to default
        samplePointsN = 60000;
    }
    else {
        // Clamp the value between 0 and 60000
        samplePointsN = Math.max(0, Math.min(60000, samplePointsN + step));
    }

    // Populate an array with unsigned int values ranging from 0 to number of sample points
    let a_position_array = new Uint32Array(samplePointsN);
    for (let i = 0; i < samplePointsN; i++) {
        a_position_array[i] = i;
    }
    
    // Delete old buffer if it exists
    if (aBuffer) {
        gl.deleteBuffer(aBuffer);
    }

    // Create new attribute buffer, bind it and read array data into it
    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, a_position_array, gl.STATIC_DRAW);

    // Reconfigure VAO
    gl.bindVertexArray(vao);

    const a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribIPointer(a_position, 1, gl.UNSIGNED_INT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);
    gl.bindVertexArray(null);

}

// Handle canvas resizing
function resize(target) {
    // Get the size of the window
    const width = target.innerWidth;
    const height = target.innerHeight;

    // Resize the canvas to fill the window
    canvas.width = width;
    canvas.height = height;

    // Set the WebGL viewport to match the new canvas size
    gl.viewport(0, 0, width, height);

    // Update aspect ratio uniform in shader
    const u_aspect = gl.getUniformLocation(program, "u_aspect");
    gl.useProgram(program);
    gl.uniform1f(u_aspect, canvas.width / canvas.height);
}


// Setup function to initialize WebGL context, shaders, buffers, and event handlers
function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas, { alpha: true, preserveDrawingBuffer: false });

    // Create WebGL programs
    program = buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    resize(window);

    // Populate an array with unsigned int values ranging from 0 to number of default initial sample points
    let a_position_array = new Uint32Array(samplePointsN);
    for (let i = 0; i < samplePointsN; i++) {
        a_position_array[i] = i;
    }

    // Create attribute buffer, bind it and read array data into it
    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, a_position_array, gl.STATIC_DRAW);

    // Create and bind vertex array object
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Refer to a_position in variable in vertex shader and inject 
    const a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribIPointer(a_position, 1, gl.UNSIGNED_INT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);

    // Setup location for uniforms in shaders
    u_curveFamily = gl.getUniformLocation(program, "u_curveFamily");
    u_samplePoints = gl.getUniformLocation(program, "u_samplePoints");
    u_panx = gl.getUniformLocation(program, "u_panx");
    u_pany = gl.getUniformLocation(program, "u_pany");
    u_zoom = gl.getUniformLocation(program, "u_zoom");
    u_a = gl.getUniformLocation(program, "u_a");
    u_b = gl.getUniformLocation(program, "u_b");
    u_c = gl.getUniformLocation(program, "u_c");
    u_tMin = gl.getUniformLocation(program, "u_tMin");
    u_tMax = gl.getUniformLocation(program, "u_tMax");

    // Initial update of info panel
    updateInfoPanel();

    // Initial color setup
    changeCurveColor(1.0, 0.0, 0.0, 1.0); // Red
    
    // Handle resize events 
    window.addEventListener("resize", (event) => {
        resize(event.target);
    });

    // Handle keyboard events
    window.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "1":
                curveFamilyValue = 1;
                break;
            case "2":
                curveFamilyValue = 2;
                break;
            case "3":
                curveFamilyValue = 3;
                break;
            case "4":
                curveFamilyValue = 4;
                break;
            case "5":
                curveFamilyValue = 5;
                break;
            case "6":
                curveFamilyValue = 6;
                break;
            case "r":
                zoomValue = 1.0;
                panxValue = 0.0;
                panyValue = 0.0;    
                updateSamplePoints(0);
                tMin = 0.0;
                switch (curveFamilyValue) {
                    case 0:
                        coefficients = [1.0, 1.0, 0.0];
                        tMax = 6.283185; // 2*PI
                        break;
                    case 1:
                        coefficients = [1.0, 1.0, 0.0];
                        tMax = 6.283185; // 2*PI
                        break;
                    case 2:
                        coefficients = [1.0, 17.0, 0.0];
                        tMax = 6.283185; // 2*PI
                        break;
                    case 3:
                        coefficients = [1.0, 8.6, 0.0];
                        tMax = 6.283185 * 5; // 10*PI
                        break;
                    case 4:
                        coefficients = [7.6, 5.1, 0.0];
                        tMax = 10; // 10
                        break;
                    case 5:
                        coefficients = [1.0, 4.0, 0.0];
                        tMax = 10; // 10
                        break;
                    case 6:
                        coefficients = [4.0, 1.0, 0.0];
                        tMax = 6.283185; // 2*PI
                        break;
                }
                break;
            case "p":
                drawPoints = !drawPoints;
                break;
            case "h":
                let panel1 = this.document.getElementById("overlay2");
                let panel2 = this.document.getElementById("overlay3");
                let panel3 = this.document.getElementById("overlay4");
                let panel4 = this.document.getElementById("overlay5");
                togglePanelVisibility(panel1);
                togglePanelVisibility(panel2);
                togglePanelVisibility(panel3);
                togglePanelVisibility(panel4);
                break;
            case " ":
                toggleAutoAnimation();
                break;
            case "ArrowLeft":
                selectPreviousCoefficient();
                break;
            case "ArrowRight":
                selectNextCoefficient();
                break;
            case "ArrowUp":
                if (autoAnimate) {
                    autoAnimate = false;
                }
                else {
                    increaseSelectedCoefficient();
                }
                animDirection = 1;
                break;
            case "ArrowDown":
                if (autoAnimate) {
                    autoAnimate = false;
                }
                else {
                    decreaseSelectedCoefficient();
                }
                animDirection = -1;
                break;
            case "PageUp":
                increaseT();
                break;
            case "PageDown":
                decreaseT();
                break;
            case "+":
                updateSamplePoints(500);
                break;
            case "-":
                updateSamplePoints(-500);
                break;
        }
        updateInfoPanel();
    });

    // Handle mouse events for panning and zooming
    canvas.addEventListener("mousedown", function (event) {
        console.log("Mouse down", event);
        isClicked = true;
        mouse_startX = event.clientX;
        mouse_startY = event.clientY;

    });

    // On mouse move, if clicked, update pan values
    canvas.addEventListener("mousemove", function (event) {
        console.log("Mouse move", event);
        if (isClicked) {
            let deltaX = event.clientX - mouse_startX;
            let deltaY = event.clientY - mouse_startY;
            // Update pan values based on mouse movement and current zoom level
            // Invert y axis movement for intuitive panning
            // Scale movement by canvas dimensions to maintain consistent panning speed
            // Convert pixel movement to normalized device coordinates in clip space
            panxValue += (2 * deltaX / canvas.width) * (1/zoomValue) * (canvas.width / canvas.height);  // Aspect ratio correction
            panyValue -= (2 * deltaY / canvas.height) * (1/zoomValue);
            mouse_startX = event.clientX;
            mouse_startY = event.clientY;
        }
    });

    // On mouse up stop panning
    canvas.addEventListener("mouseup", function (event) {
        console.log("Mouse up", event);
        isClicked = false;
    });

    // Handle mouse wheel for zooming
    canvas.addEventListener("wheel", function (event) {
        console.log("Mouse wheel", event);
        if (event.deltaY < 0) {
            // Zoom in
            zoomValue *= 1.1;
        }
        else {
            // Zoom out
            zoomValue *= 0.9;
        }
    });

    // Initialize DVD animation velocities with random values
    dvdVelocityX = (Math.random() - 0.5) * 0.015;
    dvdVelocityY = (Math.random() - 0.5) * 0.015;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

// Animation loop
function animate(timestamp) {
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update DVD animation if on curve family 0
    updateDVDAnimation();

    // Update animation speed from slider
    updateAnimSpeed();

    // If auto-animation is enabled, modify the selected coefficient
    if (autoAnimate) {
        coefficients[selectedCoefIndex] += animDirection * animSpeed;
        updateInfoPanel(); 
    }

    // Check color mode and set uniform
    u_colorModeFlag = gl.getUniformLocation(program, "u_colorModeFlag");
    gl.useProgram(program);
    if (singleColor) {
        gl.uniform1i(u_colorModeFlag, 1); // true
    }
    else {
        gl.uniform1i(u_colorModeFlag, 0); // false
    }

    gl.useProgram(program);

    // Update uniform values
    gl.uniform1i(u_curveFamily, curveFamilyValue);
    gl.uniform1f(u_samplePoints, samplePointsN);
    gl.uniform1f(u_panx, panxValue);
    gl.uniform1f(u_pany, panyValue);
    gl.uniform1f(u_zoom, zoomValue);
    gl.uniform1f(u_a, coefficients[0]);
    gl.uniform1f(u_b, coefficients[1]);
    gl.uniform1f(u_c, coefficients[2]);
    gl.uniform1f(u_tMin, tMin);
    gl.uniform1f(u_tMax, tMax);

    // Bind vao
    gl.bindVertexArray(vao);

    // Drawing code
    if (drawPoints) {
        gl.drawArrays(gl.POINTS, 0, samplePointsN);
    }
    else {
        gl.drawArrays(gl.LINE_STRIP, 0, samplePointsN);
    }

    gl.bindVertexArray(null);
}


loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(shaders => setup(shaders));