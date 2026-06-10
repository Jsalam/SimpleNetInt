#version 300 es

precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec2 mouse;
in vec3 aPosition;

uniform float r1;
uniform float r2;
uniform float s1;
uniform float s2;

out vec4 vColor;
in vec4 aVertexColor;

float warp(float r) {
  if(r < r1)
    return s1 * r;
  if(r < r2) {
    return s1 * r + ((s1 - s2) * (r - r1) * (r - r1)) / (2.0f * (r1 - r2));
  }
  return s1 * r2 + ((s2 - s1) * (r2 - r1)) / 2.0f + s2 * (r - r2);
}

float zOffset(float r) {
  return -0.01f * exp(-1e-5f * r * r);
}

const float outline_offset = 0.1f;

void main() {
  vec2 offset2D = aPosition.xy - mouse;
  float r = length(offset2D);
  vec4 position_object = vec4(mouse + warp(r) / r * offset2D, 0.0f, 1.0f);
  vec4 position_camera = modelViewMatrix * position_object;
  gl_Position = projectionMatrix * position_camera;
  gl_Position.z += zOffset(r) * gl_Position.w - outline_offset;

  vColor = vec4(aVertexColor.rgb, 1.0f);
}
