#version 300 es
#define CAMERA_DIST 800.0

precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec2 mouse;
uniform float r1;
uniform float r2;
uniform float s1;
uniform float s2;

uniform sampler2D uSampler; // palette
uniform int paletteSize;
uniform int selected;

in vec3 aPosition;
in vec4 aVertexColor; // RGB channels represent a 24-bit feature ID

out vec4 vColor;

int parseInt(vec4 v) {
    ivec4 bytes = ivec4(255.0 * v);
    return (bytes.r << 16) | (bytes.g << 8) | (bytes.b << 0);
}

float warp(float r) {
    if (r < r1) return s1 * r;
    if (r < r2) {
        return s1 * r + ((s1 - s2) * (r - r1) * (r - r1)) / (2.0 * (r1 - r2));
    }
    return s1 * r2 + ((s2 - s1) * (r2 - r1)) / 2.0 + s2 * (r - r2);
}

float zOffset(float r) {
    return -0.01 * exp(-1e-5 * r * r);
}

vec2 toTexCoord(int i) {
    return vec2((float(i) + 0.5) / float(paletteSize), 0.0);
}

void main() {
    vec2 offset2D = aPosition.xy - mouse;
    float r = length(offset2D);
    vec4 position_object = vec4(mouse + warp(r) / r * offset2D, 0.0, 1.0);
    vec4 position_camera = modelViewMatrix * position_object;
    gl_Position = projectionMatrix * position_camera;
    gl_Position.z += zOffset(r) * gl_Position.w;

    int index = parseInt(aVertexColor);
    vec3 color = texture(uSampler, toTexCoord(index)).rgb;
    float intensity = selected == index
        ? 0.8
        : exp(-(0.5 / CAMERA_DIST / CAMERA_DIST) * position_camera.z * position_camera.z);
    vColor = vec4(color * intensity, 1.0);
}
