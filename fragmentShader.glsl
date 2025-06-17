precision mediump float;

varying float vVerticalPos;
uniform float uLayerThreshold;

void main() {
    vec4 green = vec4(0.2, 0.7, 0.3, 1.0);
    vec4 coffee = vec4(0.44, 0.31, 0.22, 1.0);
    vec4 water  = vec4(0.2, 0.5, 0.8, 1.0);
    
    if (vVerticalPos > uLayerThreshold) {
        gl_FragColor = green;
    } else if (vVerticalPos > -uLayerThreshold) {
        gl_FragColor = coffee;
    } else {
        gl_FragColor = water;
    }
}