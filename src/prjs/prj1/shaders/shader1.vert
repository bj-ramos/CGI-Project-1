#version 300 es

in uint a_position;

uniform float u_aspect;

void main() {

    /**
    * Map index [0,60000] → angle [0, 2π] 
    * (since all curves are built with sin and cos,this normalization works for every situation)
    */
    float t = mix(0.0, 6.283185, float(a_position) / 60000.0);
    
    //Simple circle curve
    float x = cos(t) * 0.5;
    float y = sin(t) * 0.5;

    //Dividing x by the aspect ratio gives us an always square proportion
    gl_Position = vec4(x / u_aspect, y, 0.0, 1.0);

    //Defines the pixel size of each point
    gl_PointSize = 5.0;
}
