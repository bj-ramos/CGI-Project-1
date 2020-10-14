var gl;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    //background canvas grid colouring
    //ctx.fillRect(0, 0, 100, 75)

    //webgl setup and warning 
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }



    // Three vertices 
    var vertices = [
        //display screen background triangle1
        vec2(-1, 1),
        vec2(-1, -1),
        vec2(1, -1),
        //display screen background triangle2
        vec2(1, 1),
        vec2(-1, 1),
        vec2(1, -1),

        //display line
        vec2(1, 1),
        vec2(-1, -1),

        vec2(-1, 0.75),
        vec2(1, 0.75), 





    ];

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader-1");
    gl.useProgram(program);



    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    renderRed();


    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader-2");
    gl.useProgram(program);

    renderGreen();



}

function renderRed() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawArrays(gl.TRIANGLES, 3, 3);


}

function renderGreen() {

    for (i = 0; i < 8; i++) {
        gl.drawArrays(gl.LINE_STRIP, 8, 2);
    }


}