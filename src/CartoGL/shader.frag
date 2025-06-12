#version 300 es

precision highp float;

uniform sampler2D uSampler;

in vec4 vColor;
out vec4 fragColor;

void main() {
    fragColor = vColor;
}