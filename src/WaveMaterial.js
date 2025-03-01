import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const WaveMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
    pointer: new THREE.Vector2(),
    color1: new THREE.Color('#4361EE'),
    color2: new THREE.Color('#3A0CA3'),
    color3: new THREE.Color('#F72585'),
    color4: new THREE.Color('#7209B7')
  },
  /*glsl*/ `
      varying vec2 vUv;
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectionPosition = projectionMatrix * viewPosition;
        gl_Position = projectionPosition;
        vUv = uv;
      }`,
  /*glsl*/ `
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 pointer;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      uniform vec3 color4;
      varying vec2 vUv;      

      vec3 palette(float t, vec3 baseColor) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = baseColor;
        return a + b * cos(6.28318 * (c * t + d));
      }

      // Smoothstep function for smoother transitions
      float smoothMix(float edge0, float edge1, float x) {
        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;      
        vec2 uv0 = uv;
        
        // Normalize uv to 0-1 range for color mixing
        vec2 normalizedUv = (uv + 1.0) * 0.5;
        
        // Create smooth color blending based on position
        // Instead of hard quadrant boundaries, we'll use smoothstep for gradual transitions
        float mixFactorX = smoothMix(0.3, 0.7, normalizedUv.x);
        float mixFactorY = smoothMix(0.3, 0.7, normalizedUv.y);
        
        // Mix the colors smoothly
        vec3 colorBottom = mix(color1, color3, mixFactorX);
        vec3 colorTop = mix(color2, color4, mixFactorX);
        vec3 blendedColor = mix(colorBottom, colorTop, mixFactorY);
        
        // Apply color variation based on wave movement
        float colorVariation = sin(length(uv0) * 3.0 + time * 0.5) * 0.1 + 0.9;
        blendedColor *= colorVariation;
        
        // Wave effect
        vec2 waveUv = sin(uv * 0.5) - pointer;     
        float d = length(waveUv) * exp(-length(uv0));
        vec3 col = palette(length(uv0) + time * 0.4, blendedColor);
        d = sin(d * 8.0 + time) / 8.0;
        d = abs(d);
        d = pow(0.02 / d, 2.0);
        
        vec3 finalColor = col * d;
        gl_FragColor = vec4(finalColor, 1.0);
      }`
)

extend({ WaveMaterial })

export { WaveMaterial }
