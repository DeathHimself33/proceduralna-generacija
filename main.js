async function loadShaderSource(url) {
    const response = await fetch(url);
    return await response.text();
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// Matrica projekcije
function makePerspectiveMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0,                           0,
        0,          f, 0,                           0,
        0,          0, (near + far) * rangeInv,    -1,
        0,          0, near * far * rangeInv * 2,   0
    ]);
}

// Množenje 4x4 matrica
function multiplyMatrices(a, b) {
    const out = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            out[i * 4 + j] =
                a[i * 4 + 0] * b[0 * 4 + j] +
                a[i * 4 + 1] * b[1 * 4 + j] +
                a[i * 4 + 2] * b[2 * 4 + j] +
                a[i * 4 + 3] * b[3 * 4 + j];
        }
    }
    return out;
}

async function main() {
    const canvas = document.getElementById("glcanvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        alert("WebGL nije podržan!");
        return;
    }

    const vsSource = await loadShaderSource('vertexShader.glsl');
    const fsSource = await loadShaderSource('fragmentShader.glsl');

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    // Generisanje terena
    const heightMap = generateHeightMap(50, 50);
    const { positions, indices } = generateTerrainMesh(heightMap);

    // Pozicije verteksa
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    // Matrica kamere i projekcije
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const projectionMatrix = makePerspectiveMatrix(Math.PI / 4, aspect, 0.1, 100);

    const modelView = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -25, -5, -40, 1 // pomeraj unazad i u centar
    ]);

    const finalMatrix = multiplyMatrices(modelView, projectionMatrix);

    const uProj = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    gl.uniformMatrix4fv(uProj, false, finalMatrix);

    // Prikaz
    gl.clearColor(0.5, 0.7, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

main();
