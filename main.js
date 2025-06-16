import { generateHeightMap } from './terrain.js';

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

async function loadShaderSource(url) {
    const res = await fetch(url);
    return await res.text();
}

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
    }
    return shader;
}

async function main() {
    // Učitavanje shader fajlova
    const vsSource = await loadShaderSource("vertex.glsl");
    const fsSource = await loadShaderSource("fragment.glsl");

    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Generisanje height mape
    const heightMap = generateHeightMap(50, 50);
    const positions = [];
    const indices = [];

    const width = heightMap[0].length;
    const height = heightMap.length;

    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const y = heightMap[z][x];
            positions.push(x, y, z);
        }
    }

    for (let z = 0; z < height - 1; z++) {
        for (let x = 0; x < width - 1; x++) {
            const i = z * width + x;
            indices.push(i, i + width, i + 1);
            indices.push(i + 1, i + width, i + width + 1);
        }
    }

    // Buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    // Projekcija
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

    let cameraDistance = 25;

    function getModelViewMatrix() {
        const angleX = -0.6;
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        return new Float32Array([
            1, 0, 0, 0,
            0, cosX, -sinX, 0,
            0, sinX, cosX, 0,
            -25, -10, -cameraDistance, 1
        ]);
    }

    const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

    function draw() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.5, 0.8, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.uniformMatrix4fv(uModelViewMatrix, false, getModelViewMatrix());
        gl.uniformMatrix4fv(uProjectionMatrix, false, getProjectionMatrix());

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }

    draw();

    // Zumiranje
    canvas.addEventListener("wheel", function (e) {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.05;
        cameraDistance = Math.max(5, Math.min(200, cameraDistance));
        draw();
    });
}

main();
