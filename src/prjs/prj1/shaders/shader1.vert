#version 300 es
in uint a_position;
uniform float u_aspect;
uniform int u_curveFamily;
uniform float u_samplePoints;
uniform float u_a;
uniform float u_b;
uniform float u_c;
uniform float u_tMin;
uniform float u_tMax;

void main() {
    /**
    * Map index [0,60000] → angle [u_tMin, u_tMax]
    * (since all curves are built with sin and cos, this normalization works for every situation)
    */
    float t = mix(u_tMin, u_tMax, float(a_position) / 60000.0f);

    //Declare x and y
    float x = 0.0f;
    float y = 0.0f;

    //Select curve family
    switch(u_curveFamily) {
        case 0:
            x = cos(t) * 0.5f;
            y = sin(t) * 0.5f;
            break;
        case 1:
            x = cos(u_a * t) + cos(u_b * t) / 2.0f + sin(u_c * t) / 3.0f;
            y = sin(u_a * t) + sin(u_b * t) / 2.0f + cos(u_c * t) / 3.0f;
            break;
        case 2:
            x = 2.0 * (cos(u_a*t) + ((cos(u_b*t)) * (cos(u_b*t)) * (cos(u_b*t))));
            y = 2.0 * (sin(u_a*t) + ((sin(u_b*t)) * (sin(u_b*t)) * (sin(u_b*t))));
            break;
        case 3:
            x = cos(u_a*t) * sin(sin(u_a*t));
            y = sin(u_a*t) * cos(cos(u_b*t));
            break;
        case 4:
            x = cos(u_a*t) * cos(u_b*t);
            y = sin(cos(u_a*t));
            break;
        case 5:
            x = sin(u_a*t) * (exp(cos(u_a*t)) - (2.0 * cos(u_b*t)));
            y = cos(u_a*t) * (exp(cos(u_a*t)) - (2.0 * cos(u_b*t)));
            break;
        case 6:
            x = ((u_a - u_b) * cos(u_b*t)) + cos(u_a*t - u_b*t);
            y = ((u_a - u_b) * sin(u_b*t)) - sin(u_a*t - u_b*t);
            break;
    }

    //Dividing x by the aspect ratio gives us an always square proportion
    gl_Position = vec4(x / u_aspect, y, 0.0f, 1.0f);
    //Defines the pixel size of each point
    gl_PointSize = 5.0f;
}