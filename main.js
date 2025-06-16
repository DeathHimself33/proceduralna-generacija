import { generateHeightMap, generateTerrainMesh } from './terrain.js';

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL nije podržan.");
}

let cameraDistance = 40;

const vertexShaderSource = `
    attribute vec3 aPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying float vHeight;
    void main() {
        vHeight = aPosition.y;
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying float vHeight;
    void main() {
        gl_FragColor = vec4(0.0, 0.6 + vHeight * 0.5, 0.0, 1.0); // zelena sa nijansama visine
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

function createProgram(gl, vShaderSrc, fShaderSrc) {
    const vShader = createShader(gl, gl.VERTEX_SHADER, vShaderSrc);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSrc);

    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    return program;
}

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

// terrain
const heightMap = generateHeightMap(60, 60);
const { positions, indices } = generateTerrainMesh(heightMap);

// position buffer
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// index buffer
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// attribute
const aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

// matrices
const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

function getModelViewMatrix() {
    const angleX = -0.6;
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    return new Float32Array([
        1,    0,     0,    0,
        0,  cosX, -sinX,   0,
        0,  sinX,  cosX,   0,
      -25,  -5, -cameraDistance, 1
    ]);
}

function getProjectionMatrix() {
    const fov = Math.PI / 4;
    const aspect = canvas.width / canvas.height;
    const near = 0.1;
    const far = 1000;

    const f = 1.0 / Math.tan(fov / 2);
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
    ]);
}

function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.8, 1.0, 1.0); // nebo plavo
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv(uModelViewMatrix, false, getModelViewMatrix());
    gl.uniformMatrix4fv(uProjectionMatrix, false, getProjectionMatrix());

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

draw();

// zoom mišem
canvas.addEventListener("wheel", function (e) {
    e.preventDefault();
    cameraDistance += e.deltaY * 0.05;
    cameraDistance = Math.max(5, Math.min(200, cameraDistance));
    draw();
});
