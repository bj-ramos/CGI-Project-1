import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../../libs/utils.js";

let canvas;
let gl;
let program;
// Create vao
let vao;

// Flag for drawing points or lines
let drawPoints = false;

// Uniforms
let u_curveFamily, u_a, u_b, u_c, u_tMin, u_tMax;

// Values for uniforms 
let curveFamilyValue = 0;

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

// Points control
const MAX_NUM_POINTS = 60000;


// Function to update the Info panel
function updateInfoPanel() {
    const curveEl = document.getElementById('curve-number');
    const tMinEl = document.getElementById('t-min');
    const tMaxEl = document.getElementById('t-max');
    const coefsEl = document.getElementById('coefs');

    // Safety check - make sure elements exist
    if (!curveEl || !tMinEl || !tMaxEl || !coefsEl) {
        console.error('Info panel elements not found!');
        return;
    }

    curveEl.textContent = curveFamilyValue;
    tMinEl.textContent = tMin.toFixed(2);
    tMaxEl.textContent = tMax.toFixed(2);

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

    // Populate an array with unsigned int values from 0 to MAX_NUM_POINTS 
    let a_position_array = new Uint32Array(MAX_NUM_POINTS);
    for (let i = 0; i < MAX_NUM_POINTS; i++) {
        a_position_array[i] = i;
    }

    console.log(a_position_array);

    // Create attribute buffer, bind it and read array into it
    const aBuffer = gl.createBuffer();
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
    u_a = gl.getUniformLocation(program, "u_a");
    u_b = gl.getUniformLocation(program, "u_b");
    u_c = gl.getUniformLocation(program, "u_c");
    u_tMin = gl.getUniformLocation(program, "u_tMin");
    u_tMax = gl.getUniformLocation(program, "u_tMax");

    // Initial update of info panel
    updateInfoPanel();

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
                console.log("Restart Coefficients");
                coefficients = [1.0, 1.0, 0.0];
                selectedCoefIndex = 0;
                tMin = 0.0;
                tMax = 6.283185;
                break;
            case "p":
                console.log("Toggle Draw Mode");
                drawPoints = !drawPoints;
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

        }
        updateInfoPanel();
    });

    // Handle mouse events

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

function animate(timestamp) {
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Update uniform values
    gl.uniform1i(u_curveFamily, curveFamilyValue);
    gl.uniform1f(u_a, coefficients[0]);
    gl.uniform1f(u_b, coefficients[1]);
    gl.uniform1f(u_c, coefficients[2]);
    gl.uniform1f(u_tMin, tMin);
    gl.uniform1f(u_tMax, tMax);

    // Bind vao
    gl.bindVertexArray(vao);

    // Drawing code
    if (drawPoints) {
        gl.drawArrays(gl.POINTS, 0, MAX_NUM_POINTS);
    }
    else {
        gl.drawArrays(gl.LINE_STRIP, 0, MAX_NUM_POINTS);
    }

    gl.bindVertexArray(null);
}


loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(shaders => setup(shaders));