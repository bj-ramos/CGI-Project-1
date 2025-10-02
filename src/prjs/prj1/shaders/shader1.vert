#version 300 es
precision highp float;

in uint a_position;

void main() {
    // Map index [0,60000] → angle [0, 2π]
    float t = mix(0.0, 6.283185, float(a_position) / 60000.0);

    float x = cos(t) * 0.5;
    float y = sin(t) * 0.5;

    gl_Position = vec4(x, y, 0.0, 1.0);
}
