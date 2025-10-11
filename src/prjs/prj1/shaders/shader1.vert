#version 300 es

// === Attribute inputs ===
in uint a_position; // Index of the vertex (0 to 60000)

// === Uniform inputs ===
uniform int u_curveFamily; // Curve family selector
uniform float u_aspect; // Aspect ratio of the canvas
uniform float u_samplePoints; // Number of sample points 
uniform float u_zoom; // Zoom factor
uniform vec2 u_pan; // Pan factor
uniform vec2 u_tLimits; // Min and max t values
uniform vec3 u_coefficients; // Coefficients for the curves

// === Output to the fragment shader ===
out float v_t; // Normalized t value [0,1] for color mapping

void main() {
    
    // Map index [0,60000] → angle [u_tMin, u_tMax]
    // (since all curves are built with sin and cos, this normalization works for every situation)
    
    float t = mix(u_tLimits.x, u_tLimits.y, float(a_position) / u_samplePoints);

    // Normalized t value for color mapping
    v_t = float(a_position) / u_samplePoints; 

    // Variables to hold the x and y coordinates of the curve
    float x = 0.0;
    float y = 0.0;

    // Calculate the x and y coordinates based on the selected curve family
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
            x = cos(u_coefficients.x * t) * sin(sin(u_coefficients.x * t));
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

    // Set the vertex position, applying aspect ratio, zoom, and pan
    gl_Position = vec4(((x + u_pan.x) / u_aspect) * u_zoom, (y + u_pan.y) * u_zoom, 0.0, 1.0);

    // Set point size for rendering points
    gl_PointSize = 5.0;
}