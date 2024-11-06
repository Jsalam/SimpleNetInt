#version 300 es

precision highp float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 mouse;
uniform float r1;
uniform float r2;
uniform float s1;
uniform float s2;

uniform vec4 colors[7];
uniform int selected;

in vec3 aPosition;
in vec4 aVertexColor;

out vec4 vColor;

float warp(float r) {
    if (r < r1) return s1 * r;
    if (r < r2) {
        return s1 * r + ((s1 - s2) * (r - r1) * (r - r1)) / (2.0 * (r1 - r2));
    }
    return s1 * r2 + ((s2 - s1) * (r2 - r1)) / 2.0 + s2 * (r - r2);
}

float get_z(float r) {
    return -1.0 * exp(-0.00001 * r * r);
}

void main() {
    ivec4 bytes = ivec4(255.0 * aVertexColor);
    int index = (bytes.r << 16) | (bytes.g << 8) | (bytes.b << 0);

    vec2 v = aPosition.xy - mouse;
    float r = length(v);

    vec3 color = (selected == index ? 0.5 : 0.2) * colors[index % 7].rgb;
    vColor = vec4(color, 1.0);

    vec4 positionVec4 = vec4(mouse + warp(r) / r * v, 0.0, 1.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
    gl_Position.z = get_z(r) * gl_Position.w;
}
