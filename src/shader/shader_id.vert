#version 300 es

precision highp float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 mouse;
in vec3 aPosition;

uniform float r1;
uniform float r2;
uniform float s1;
uniform float s2;

out vec4 vColor;
in vec4 aVertexColor;


float warp(float r) {
    if (r < r1) return s1 * r;
    if (r < r2) {
        return s1 * r + ((s1 - s2) * (r - r1) * (r - r1)) / (2.0 * (r1 - r2));
    }
    return s1 * r2 + ((s2 - s1) * (r2 - r1)) / 2.0 + s2 * (r - r2);
}

void main() {
    vColor = aVertexColor;
    vec2 v = aPosition.xy - mouse;
    float r = length(v);
    vec4 positionVec4 = vec4(mouse + warp(r) / r * v, 0.0, 1.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}
