export const vertex = `
#define PI 3.1415926535897932384626433832795

precision highp float;
precision highp int;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;

varying vec3 vUv;

void main() {
  vec4 pos = modelViewMatrix * vec4(position, 1.0);
  
  gl_Position = projectionMatrix * pos;

  // implements cover behaviour
  vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );
  
  // TODO: handle scale and translate
  vUv = position * vec3(1., 1., 1.) + vec3(.5, .5, 0.);
  
  vec2 newUV = vec2(
      vUv.x * ratio.x + (1. - ratio.x) * .5,
      vUv.y * ratio.y + (1. - ratio.y) * .5
  );
  vUv = vec3(newUV, 1.);
}
`;
