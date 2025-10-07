#version 300 es

precision mediump float;

uniform vec4 u_singleColor;
uniform vec4 u_startingColor;
uniform vec4 u_endingColor;

uniform bool u_colorModeFlag;

in float v_t;

out vec4 frag_color;

void main() {

    if(u_colorModeFlag){
        frag_color = u_singleColor;
    }
    else{
        vec4 color = mix(u_startingColor, u_endingColor, v_t);
        frag_color = color;
    }
}