import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../../libs/utils.js";

let canvas;
let gl;
let program;

// Variable buffer to be accessed in any call 
let aBuffer;
// Create vao
let vao;

// Flag for drawing points or lines
let drawPoints = false;

// Flag for mouse click and drag
let isClicked = false;

// Uniforms
let u_curveFamily, u_samplePoints, u_panx, u_pany, u_zoom, u_a, u_b, u_c;

// Values for uniforms 
let curveFamilyValue = 0;
// Modifier to control incremental or decremental steps in the number of sample points inside a_pos_array
let samplePointsN = 60000;
// Values for a, b, c
let aValue, bValue, cValue;
// Values for panning and zooming
let panxValue = 0.0;
let panyValue = 0.0;
let zoomValue = 1.0;

// Values for mouse panning
let mouse_startX, mouse_startY;



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

    console.log(a_position_array);

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

    // Handle resize events 
    window.addEventListener("resize", (event) => {
        resize(event.target);
    });

    // Handle keyboard events
    window.addEventListener("keydown", function (event){
        switch(event.key){
            case "0":
                console.log("Debug Family 0")
                curveFamilyValue = 0;
                break;
            case "1":
                console.log("Draw Family 1");
                curveFamilyValue = 1;
                break;
            case "2":
                console.log("Draw Family 2");
                curveFamilyValue= 2;
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
                console.log("Restart Curve and View Parameters");
                updateSamplePoints(0);
                zoomValue = 1.0;
                panxValue = 0.0;
                panyValue = 0.0;
                aValue = 1.0;
                bValue = 1.0;
                cValue = 0.0;    
                break;
            case "p":
                console.log("Toggle Draw Mode");
                drawPoints = !drawPoints;
                break;
            case " ":
                console.log("Toggle Auto Animation");
                break;
            case "ArrowLeft":
                console.log("ArrowLeft");
                break;
            case "ArrowRight":
                console.log("ArrowRight");
                break;
            case "ArrowUp":
                console.log("ArrowUp");
                break;
            case "ArrowDown":
                console.log("ArrowDown");
                break;
            case "PageUp":
                console.log("PageUp");
                break;
            case "PageDown":
                console.log("PageDown");
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
    // Clear the framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Update uniform values
    gl.uniform1i(u_curveFamily, curveFamilyValue);
    gl.uniform1f(u_samplePoints, samplePointsN);
    gl.uniform1f(u_panx, panxValue);
    gl.uniform1f(u_pany, panyValue);
    gl.uniform1f(u_zoom, zoomValue);

    // hard coded for testing
    aValue = 5.4;
    bValue = 2.8;
    cValue = 1.2;

    gl.uniform1f(u_a, aValue);
    gl.uniform1f(u_b, bValue);
    gl.uniform1f(u_c, cValue);

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
