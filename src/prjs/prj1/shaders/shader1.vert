#version 300 es

in uint a_position;

uniform float u_aspect;
uniform int u_curveFamily;
uniform float u_a;
uniform float u_b;
uniform float u_c;

void main() {

    /**
    * Map index [0,60000] → angle [0, 2π] 
    * (since all curves are built with sin and cos,this normalization works for every situation)
    */
    float t = mix(0.0, 6.283185, float(a_position) / 60000.0);
    
    //Declare x and y
    float x = 0.0;
    float y = 0.0;
    
    //Select curve family 
    switch(u_curveFamily){
        case 0:
            x = cos(t) * 0.5;
            y = sin(t) * 0.5;
            break;
        case 1:
            x = cos(u_a*t) + cos(u_b*t) / 2.0 + sin(u_c*t) / 3.0;
            y = sin(u_a*t) + sin(u_b*t) / 2.0 + cos(u_c*t) / 3.0;
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
        case 6:
            break;
    }
   

    //Dividing x by the aspect ratio gives us an always square proportion
    gl_Position = vec4(x / u_aspect, y, 0.0, 1.0);

    //Defines the pixel size of each point
    gl_PointSize = 5.0;
}
