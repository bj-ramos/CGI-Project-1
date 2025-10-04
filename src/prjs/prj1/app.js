import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../../libs/utils.js";

let canvas;
let gl;
let program;
// Create vao
let vao;

// Flag for drawing points or lines
let drawPoints = false;

// Uniforms
let u_curveFamily, u_a, u_b, u_c;

// Values for uniforms 
let curveFamilyValue = 0;
let aValue = 1.0;
let bValue = 0.0;
let cValue = 1.0;


//Parameter range for t
let tMin = 0.0;
let tMax = 6.283185;

const MIN_NUM_POINTS = 0
const MAX_NUM_POINTS = 60000
let current_num_Points = 60000

/// Function to update the Info panel
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

    // Format coefficients based on curve family
    let coefsText = `[${aValue.toFixed(2)}, ${bValue.toFixed(2)}, ${cValue.toFixed(2)}]`;
    coefsEl.textContent = coefsText;
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

    // Populate an array with unsigned int values from 0 to 60000 
    let a_position_array = new Uint32Array(current_num_Points);
    for (let i = 0; i < current_num_Points; i++) {
        a_position_array[i] = i;
    }

    console.log(a_position_array);

    // Create attribute buffer, bind it and read array data into it
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
                console.log("Debug Family 0")
                curveFamilyValue = 0;
                updateInfoPanel();
                break;
            case "1":
                console.log("Draw Family 1");
                curveFamilyValue = 1;
                updateInfoPanel();
                break;
            case "2":
                console.log("Draw Family 2");
                curveFamilyValue = 2;
                updateInfoPanel();
                break;
            case "3":
                console.log("Draw Family 3");
                curveFamilyValue = 3;
                updateInfoPanel();
                break;
            case "4":
                console.log("Draw Family 4");
                curveFamilyValue = 4;
                updateInfoPanel();
                break;
            case "5":
                console.log("Draw Family 5");
                curveFamilyValue = 5;
                updateInfoPanel();
                break;
            case "6":
                console.log("Draw Family 6");
                curveFamilyValue = 6;
                updateInfoPanel();
                break;
            case "r":
                console.log("Restart Program");
                curveFamilyValue = 0;
                aValue = 1.0;
                bValue = 0.0;
                cValue = 1.0;
                tMin = 0.0;
                tMax = 6.283185;
                updateInfoPanel();
                break;
            case "p":
                console.log("Toggle Draw Mode");
                drawPoints = !drawPoints;
                updateInfoPanel();
                break;
            case " ":
                console.log("Toggle Auto Animation");
                break;
            case "ArrowLeft":
                console.log("ArrowLeft");
                aValue -= 0.1;
                updateInfoPanel();
                break;
            case "ArrowRight":
                console.log("ArrowRight");
                aValue += 0.1;
                updateInfoPanel();
                break;
            case "ArrowUp":
                console.log("ArrowUp");
                bValue += 0.1;
                updateInfoPanel();
                break;
            case "ArrowDown":
                console.log("ArrowDown");
                bValue -= 0.1;
                updateInfoPanel();
                break;
            case "PageUp":
                console.log("PageUp");
                cValue += 0.1;
                updateInfoPanel();
                break;
            case "PageDown":
                console.log("PageDown");
                cValue -= 0.1;
                updateInfoPanel();
                break;
            case "+":
                //draft idea
                console.log("Plus key");
                if (!(current_num_Points == MAX_NUM_POINTS)) {
                    current_num_Points += 500
                }
                setup()
                break;
            case "-":
                //draft idea
                console.log("Minus Key");
                if (!(current_num_Points == MIN_NUM_POINTS)) {
                    current_num_Points -= 500
                }
                setup()
                break;



        }
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
    gl.uniform1f(u_a, aValue);
    gl.uniform1f(u_b, bValue);
    gl.uniform1f(u_c, cValue);


    // Bind vao
    gl.bindVertexArray(vao);

    // Drawing code
    if (drawPoints) {
        gl.drawArrays(gl.POINTS, 0, 60000);
    }
    else {
        gl.drawArrays(gl.LINE_STRIP, 0, 60000);
    }

    gl.bindVertexArray(null);
}


loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(shaders => setup(shaders));
