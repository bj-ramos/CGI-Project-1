#version 300 es

in uint a_position;

uniform int u_curveFamily;
uniform float u_aspect;
uniform float u_samplePoints;
uniform float u_zoom;
uniform vec2 u_pan;
uniform vec2 u_tLimits;
uniform vec3 u_coefficients;

out float v_t;

void main() {
    /**
    * Map index [0,60000] → angle [u_tMin, u_tMax]
    * (since all curves are built with sin and cos, this normalization works for every situation)
    */
    float t = mix(u_tLimits.x, u_tLimits.y, float(a_position) / u_samplePoints);

    v_t = float(a_position) / u_samplePoints; 

    //Declare x and y
    float x = 0.0;
    float y = 0.0;

    //Select curve family
    switch(u_curveFamily) {
        case 0:
            x = cos(t) * 0.5;
            y = sin(t) * 0.5;
            break;
        case 1:
            x = cos(u_coefficients.x * t) + cos(u_coefficients.y * t) / 2.0 + sin(u_coefficients.z * t) / 3.0;
            y = sin(u_coefficients.x * t) + sin(u_coefficients.y * t) / 2.0 + cos(u_coefficients.z * t) / 3.0;
            break;
        case 2:
            x = 2.0 * (cos(u_coefficients.x * t) + ((cos(u_coefficients.y * t)) * (cos(u_coefficients.y * t)) * (cos(u_coefficients.y * t))));
            y = 2.0 * (sin(u_coefficients.x * t) + ((sin(u_coefficients.y * t)) * (sin(u_coefficients.y * t)) * (sin(u_coefficients.y * t))));
            break;
        case 3:
            x = cos(u_coefficients.x * t) * sin(sin(u_coefficients.y * t));
            y = sin(u_coefficients.x * t) * cos(cos(u_coefficients.y * t));
            break;
        case 4:
            x = cos(u_coefficients.x * t) * cos(u_coefficients.y * t);
            y = sin(cos(u_coefficients.x * t));
            break;
        case 5:
            x = sin(u_coefficients.x * t) * (exp(cos(u_coefficients.x * t)) - (2.0 * cos(u_coefficients.y * t)));
            y = cos(u_coefficients.x * t) * (exp(cos(u_coefficients.x * t)) - (2.0 * cos(u_coefficients.y * t)));
            break;
        case 6:
            x = ((u_coefficients.x - u_coefficients.y) * cos(u_coefficients.y * t)) + cos(u_coefficients.x * t - u_coefficients.y * t);
            y = ((u_coefficients.x - u_coefficients.y) * sin(u_coefficients.y * t)) - sin(u_coefficients.x * t - u_coefficients.y * t);
            break;
    }

    //Dividing x by the aspect ratio gives us an always square proportion
    gl_Position = vec4(((x + u_pan.x) / u_aspect) * u_zoom, (y + u_pan.y) * u_zoom, 0.0, 1.0);

    //Defines the pixel size of each point
    gl_PointSize = 5.0;
}