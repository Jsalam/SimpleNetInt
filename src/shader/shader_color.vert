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
  ivec4 bytes = ivec4(255.0f * v);
  return (bytes.r << 16) | (bytes.g << 8) | (bytes.b << 0);
}

float warp(float r) {
  if (r < r1)
    return s1 * r;
  if (r < r2) {
    return s1 * r + ((s1 - s2) * (r - r1) * (r - r1)) / (2.0f * (r1 - r2));
  }
  return s1 * r2 + ((s2 - s1) * (r2 - r1)) / 2.0f + s2 * (r - r2);
}

float zOffset(float r) { return -0.01f * exp(-1e-5f * r * r); }

vec2 toTexCoord(int i) {
  return vec2((float(i) + 0.5f) / float(paletteSize), 0.0f);
}

void main() {
  vec2 offset2D = aPosition.xy - mouse;
  float r = length(offset2D);
  vec4 position_object = vec4(mouse + warp(r) / r * offset2D, 0.0f, 1.0f);
  vec4 position_camera = modelViewMatrix * position_object;
  gl_Position = projectionMatrix * position_camera;
  gl_Position.z += zOffset(r) * gl_Position.w;

  int index = parseInt(aVertexColor);
  vec4 color = texture(uSampler, toTexCoord(index));
  float intensity = (selected == 0 || selected == index ? 1.0f : 0.5f) *
                    exp(-(0.5f / CAMERA_DIST / CAMERA_DIST) *
                        position_camera.z * position_camera.z);
  vColor = vec4(color.rgb * intensity, 1.0f);
}
