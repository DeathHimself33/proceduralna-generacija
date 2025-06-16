precision mediump float;

varying vec2 vTexCoord;
varying float vVerticalPos;

uniform sampler2D uTexture; // For texture support
uniform bool uUseTexture;   // Flag to enable/disable texture

void main() {
    // Define our colors
    vec4 green = vec4(0.2, 0.7, 0.3, 1.0);
    vec4 coffee = vec4(0.44, 0.31, 0.22, 1.0);
    vec4 gray = vec4(0.5, 0.5, 0.5, 1.0);
    
    // Determine color based on vertical position
    vec4 baseColor;
    if (vVerticalPos > 0.33) {
        // Top section - green
        baseColor = green;
    } else if (vVerticalPos > -0.33) {
        // Middle section - coffee
        baseColor = coffee;
    } else {
        // Bottom section - gray
        baseColor = gray;
    }
    
    // Apply texture if enabled
    if (uUseTexture) {
        vec4 texColor = texture2D(uTexture, vTexCoord);
        gl_FragColor = mix(baseColor, texColor, 0.5); // Blend with base color
    } else {
        gl_FragColor = baseColor;
    }
}