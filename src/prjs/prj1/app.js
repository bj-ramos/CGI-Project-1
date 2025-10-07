import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../../libs/utils.js";

let canvas;
let gl;
let program;

// Create vao
let vao;

// Variable buffer to be accessed in any call 
let aBuffer;

// Modifier to control incremental or decremental steps in the number of sample points inside a_pos_array
let samplePointsN = 60000;

// Flag for drawing points or lines
let drawPoints = false;

// Flag for mouse click and drag
let isClicked = false;

// Values for uniforms 
let curveFamilyValue = 0;

// Values for panning and zooming
let panxValue = 0.0;
let panyValue = 0.0;
let zoomValue = 1.0;

// Values for mouse panning
let mouse_startX, mouse_startY;
let u_curveFamily, u_samplePoints, u_a, u_b, u_c, u_tMin, u_tMax, u_panx, u_pany, u_zoom;

// Coefficient array - easier to manage (a, b, c)
let coefficients = [1.0, 0.0, 1.0];
let selectedCoefIndex = 0; // Which coefficient is currently selected

// Parameter range for t
let tMin = 0.0;
let tMax = 6.283185; // 2*PI

// Step sizes for adjustments
const COEF_STEP = 0.1;
const COEF_BIG_STEP = 1.0;
const T_STEP = 0.1;

// Toggle interface panel visibility
function togglePanelVisibility(infoPanel) {
    if (infoPanel.style.display === 'none') {
        infoPanel.style.display = 'block';
    } else {
        infoPanel.style.display = 'none';
    }
}

// Change curve color
function changeCurveColor(r, g, b, a) {
    let color = document.getElementById("color-picker").value;
    r = parseInt(color.slice(1, 3), 16) / 255;
    g = parseInt(color.slice(3, 5), 16) / 255;
    b = parseInt(color.slice(5, 7), 16) / 255;
    a = 1.0; // Opaque
    const u_color = gl.getUniformLocation(program, "color");
    gl.useProgram(program);
    gl.uniform4f(u_color, r, g, b, a);
}

 // Handle color change button update
    const colorButton = document.getElementById("apply-color-button");
    colorButton.addEventListener("click", () => {
        changeCurveColor();
    });

// Function to update the Info panel
function updateInfoPanel() {
    const curveEl = document.getElementById('curve-number');
    const tMinEl = document.getElementById('t-min');
    const tMaxEl = document.getElementById('t-max');
    const coefsEl = document.getElementById('coefs');
    const sampleEl = document.getElementById('sample-size');

    // Safety check - make sure elements exist
    if (!curveEl || !tMinEl || !tMaxEl || !coefsEl || !sampleEl) {
        console.error('Info panel elements not found!');
        return;
    }

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
    console.log(`Selected coefficient ${selectedCoefIndex}: ${coefficients[selectedCoefIndex]}`);
}

function selectPreviousCoefficient() {
    selectedCoefIndex = (selectedCoefIndex - 1 + coefficients.length) % coefficients.length;
    console.log(`Selected coefficient ${selectedCoefIndex}: ${coefficients[selectedCoefIndex]}`);
}

// Coefficient modification functions
function increaseSelectedCoefficient(step = COEF_STEP) {
    coefficients[selectedCoefIndex] += step;
    console.log(`Coefficient ${selectedCoefIndex} increased to ${coefficients[selectedCoefIndex].toFixed(2)}`);
}

function decreaseSelectedCoefficient(step = COEF_STEP) {
    coefficients[selectedCoefIndex] -= step;
    console.log(`Coefficient ${selectedCoefIndex} decreased to ${coefficients[selectedCoefIndex].toFixed(2)}`);
}

// T limit modification functions
function increaseT() {
    tMax += T_STEP;
    console.log(`t max increased to ${tMax.toFixed(2)}`);
}

function decreaseT() {
    tMax -= T_STEP;
    if (tMax < tMin) tMax = tMin; // Prevent tMax from going below tMin
    console.log(`t max decreased to ${tMax.toFixed(2)}`);
}


// Call same functions as in SETUP but on keystroke update in order to refresh the aBuffer contents
function updateSamplePoints(step){

    if (step == 0){
        // Reset Sample points to default
        samplePointsN = 60000;
    }
    else{
        // Clamp the value between 0 and 60000
        samplePointsN = Math.max(0, Math.min(60000, samplePointsN + step));
    }

    // Update Buffer with new sample size
    let a_position_array = new Uint32Array(samplePointsN);
    for (let i = 0; i < samplePointsN; i++){
        a_position_array[i] = i;
    }
    console.log("Updated sample points:", samplePointsN);

    // Delete old buffer if it exists
    if (aBuffer) {
        gl.deleteBuffer(aBuffer);
    }

    // Create fresh attribute buffer, bind it and read array data into it
    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, a_position_array, gl.STATIC_DRAW);

    // Rebind VAO with new information and attribute pointer
    gl.bindVertexArray(vao);
    const a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribIPointer(a_position, 1, gl.UNSIGNED_INT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);
    gl.bindVertexArray(null);
   
}

function resize(target) {
    // Aquire the new window dimensions
    const width = target.innerWidth;
    const height = target.innerHeight;

    // Set canvas size to occupy the entire window
    canvas.width = width;
    canvas.height = height;

    // Set the WebGL viewport to fill the canvas completely
    gl.viewport(0, 0, width, height);

    // Set and update Aspect ration on resize event
    const u_aspect = gl.getUniformLocation(program, "u_aspect");
    gl.useProgram(program);
    gl.uniform1f(u_aspect, canvas.width / canvas.height);
}


function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas, { alpha: true, preserveDrawingBuffer: false });

    // Create WebGL programs
    program = buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    resize(window);

    // Populate an array with unsigned int values ranging from 0 to number of sample points
    let a_position_array = new Uint32Array(samplePointsN);
    for (let i = 0; i < samplePointsN; i++){
        a_position_array[i] = i;
    }

    console.log("Updated sample points:", samplePointsN);

    // Create attribute buffer, bind it and read array data into it
    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, a_position_array, gl.STATIC_DRAW);

    // Create and bind VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Refer to a_position in variable in vertex shader and inject 
    const a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribIPointer(a_position, 1, gl.UNSIGNED_INT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);

    // Setup location for uniforms
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

    // Initial curve color
    changeCurveColor(1.0, 0.0, 0.0, 1.0); // Red
    // Handle resize events 
    window.addEventListener("resize", (event) => {
        resize(event.target);
    });

    // Handle keyboard events
    window.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "0":
                console.log("Debug Family 0");
                curveFamilyValue = 0;
                break;
            case "1":
                console.log("Draw Family 1");
                curveFamilyValue = 1;
                break;
            case "2":
                console.log("Draw Family 2");
                curveFamilyValue = 2;
                break;
            case "3":
                console.log("Draw Family 3");
                curveFamilyValue = 3;
                break;
            case "4":
                console.log("Draw Family 4");
                curveFamilyValue = 4;
                break;
            case "5":
                console.log("Draw Family 5");
                curveFamilyValue = 5;
                break;
            case "6":
                console.log("Draw Family 6");
                curveFamilyValue = 6;
                break;
            case "r":
                // Reset everything to default values
                console.log("Restart Curve Family");
                /** Not sure if we want to reset view parameters too
                zoomValue = 1.0;
                panxValue = 0.0;
                panyValue = 0.0;
                */   
                updateSamplePoints(0);
                console.log("Restart Coefficients");
                // Reset depends on which family is selected
                selectedCoefIndex = 0;
                tMin = 0.0;
                switch(curveFamilyValue){
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
                console.log("Toggle Draw Mode");
                drawPoints = !drawPoints;
                break;
            case "h":
                console.log("Toggle User Interface");
                let panel = this.document.getElementById("overlay2");
                togglePanelVisibility(panel);
                break;
            case " ":
                console.log("Toggle Auto Animation");
                break;
            case "ArrowLeft":
                console.log("ArrowLeft - Select previous coefficient");
                selectPreviousCoefficient();
                break;
            case "ArrowRight":
                console.log("ArrowRight - Select next coefficient");
                selectNextCoefficient();
                break;
            case "ArrowUp":
                console.log("ArrowUp - Increase selected coefficient");
                increaseSelectedCoefficient();
                break;
            case "ArrowDown":
                console.log("ArrowDown - Decrease selected coefficient");
                decreaseSelectedCoefficient();
                break;
            case "PageUp":
                console.log("PageUp - Increase t max");
                increaseT();
                break;
            case "PageDown":
                console.log("PageDown - Decrease t max");
                decreaseT();
                break;
            case "+":
                console.log("Step sample up by 500 points");
                updateSamplePoints(500);
                break;
            case "-":
                console.log("Step sample down by 500 points");
                updateSamplePoints(-500);
                break;
        }
        updateInfoPanel();
    });

    // Handle mouse and wheel movement events
    canvas.addEventListener("mousedown", function (event) {
        console.log("Mouse down", event);
        isClicked = true;
        mouse_startX = event.clientX;
        mouse_startY = event.clientY;

    });

    // Handle mouse move only if clicked
    canvas.addEventListener("mousemove", function (event) {
        console.log("Mouse move", event);
        if (isClicked){
            let deltaX = event.clientX - mouse_startX;
            let deltaY = event.clientY - mouse_startY;
            // Update pan values based on mouse movement and current zoom level
            // Invert y axis movement for intuitive panning
            // Scale movement by canvas dimensions to maintain consistent panning speed
            // Convert pixel movement to normalized device coordinates in clip space
            panxValue += (2 * deltaX / canvas.width) * (1/zoomValue);
            panyValue -= (2 * deltaY / canvas.height) * (1/zoomValue);
            mouse_startX = event.clientX;
            mouse_startY = event.clientY;
            console.log("Panning to: ", panxValue, panyValue);
        }
    });

    // On mouse up stop panning
    canvas.addEventListener("mouseup", function (event) {
        console.log("Mouse up", event);
        isClicked = false;
    });

    // Mouse wheel for zooming
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

function animate(timestamp) {
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

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
    if(drawPoints){
        gl.drawArrays(gl.POINTS, 0, samplePointsN);
    }
    else{
        gl.drawArrays(gl.LINE_STRIP, 0, samplePointsN);
    }

    gl.bindVertexArray(null);
}


loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(shaders => setup(shaders));