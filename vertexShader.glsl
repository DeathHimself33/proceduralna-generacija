attribute vec3 aPosition;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix * vec4(aPosition, 1.0);
}
