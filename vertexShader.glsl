attribute vec3 aPosition;
attribute vec2 aTexCoord;  // Added for texture support

uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;    // Pass texture coordinates to fragment shader
varying float vVerticalPos; // Pass vertical position for gradient

void main() {
    gl_Position = uProjectionMatrix * vec4(aPosition, 1.0);
    vTexCoord = aTexCoord;
    vVerticalPos = aPosition.y; // Assuming Y is the vertical axis
}