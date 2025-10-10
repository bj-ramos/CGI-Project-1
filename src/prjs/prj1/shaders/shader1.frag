#version 300 es

precision mediump float;

// === Uniform inputs ===
uniform vec4 u_singleColor; // Single color mode value
uniform vec4 u_startingColor; // Gradient start color value
uniform vec4 u_endingColor; // Gradient end color value
uniform bool u_colorModeFlag; // Flag between single color mode or gradient mode

// === Varying inputs ===
in float v_t; // Interpolation factor for gradient mode

// === Output ===
out vec4 frag_color; // Final fragment color output

void main() {

    if(u_colorModeFlag){
        frag_color = u_singleColor;
    }
    else{
        vec4 color = mix(u_startingColor, u_endingColor, v_t);
        frag_color = color;
    }
}