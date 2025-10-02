import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../../libs/utils.js";

let canvas;
let gl;
let program;
// Create vao
var vao;



function resize(target) {
    // Aquire the new window dimensions
    const width = target.innerWidth;
    const height = target.innerHeight;

    // Set canvas size to occupy the entire window
    canvas.width = width;
    canvas.height = height;


    // Set the WebGL viewport to fill the canvas completely
    gl.viewport(0, 0, width, height);
}


function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas, { alpha: true, preserveDrawingBuffer: false });

    // Create WebGL programs
    program = buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);



    resize(window);

    // Populate an array with unsigned int values from 0 to 60000 
    let a_index_array = new Uint32Array(60000);
    for (let i = 0; i < 60000; i++){
        a_index_array[i] = i;
    }

    // Create attribute buffer, bind it and read array data into it
    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, a_index_array, gl.STATIC_DRAW);

    // Create and bind VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Refer to a_position in variable in vertex shader and inject 
    const a_index_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribIPointer(a_index_position, 1, gl.UNSIGNED_INT, false, 0, 0);
    gl.enableVertexAttribArray(a_index_position);

    // Handle resize events 
    window.addEventListener("resize", (event) => {
        resize(event.target);
    });

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

function animate(timestamp) {
    window.requestAnimationFrame(animate);


    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Bind vao
    gl.bindVertexArray(vao);

    // Drawing code
    gl.drawArrays(gl.LINE_LOOP, 0, 60000);
    gl.bindVertexArray(null);
}


loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(shaders => setup(shaders));
