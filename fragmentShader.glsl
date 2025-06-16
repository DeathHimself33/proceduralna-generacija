precision mediump float;

varying vec2 vTexCoord;
varying float vVerticalPos;

uniform sampler2D uTexture;
uniform bool uUseTexture;
uniform float uLayerThreshold; // Added for dynamic layer control

void main() {
    vec4 green = vec4(0.2, 0.7, 0.3, 1.0);
    vec4 coffee = vec4(0.44, 0.31, 0.22, 1.0);
    vec4 gray = vec4(0.5, 0.5, 0.5, 1.0);
    
    vec4 baseColor;
    if (vVerticalPos > uLayerThreshold) {
        baseColor = green;
    } else if (vVerticalPos > -uLayerThreshold) {
        baseColor = coffee;
    } else {
        baseColor = gray;
    }
    
    if (uUseTexture) {
        vec4 texColor = texture2D(uTexture, vTexCoord);
        gl_FragColor = mix(baseColor, texColor, 0.5);
    } else {
        gl_FragColor = baseColor;
    }
}