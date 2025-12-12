export const fragment = `
precision highp float;

uniform sampler2D uTexture;
uniform float uAlpha;
uniform float uInvert;
uniform float uMono;

varying vec3 vUv;

void main() {
  vec4 texture = texture2D(uTexture, vUv.xy);
  vec3 rgb = texture.rgb;
  vec3 invert = abs(vec3(uInvert) - rgb);
  vec3 final = rgb;

  if (uInvert > 0.) {
    final = mix(final, invert, uInvert);
  }

  vec3 bw = vec3((final.r + final.g + final.b) / 3.);
  
  if (uMono > 0.) {
    final = mix(final, bw, uMono);
  }

  gl_FragColor = vec4(mix(rgb, final, max(uMono, uInvert)), uAlpha);
}
`;
