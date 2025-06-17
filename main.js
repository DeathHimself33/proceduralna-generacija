import { fractalPerlin } from './perlin.js';

function generateHeightMap(size=1, scale = 4) { //size=najveci razmak izmedu planjine i dubine; scale=visina planina(idealno do 5)
  const map = [];
  for (let z = 0; z < size; z++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const nx = x/size - 0.5;
      const nz = z/size - 0.5;
      let elevation = fractalPerlin(nx * scale, nz * scale);
      elevation = elevation * 4; // kontrolise visinu
      row.push(elevation);
    }
    map.push(row);
  }
  return map;
}

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// Shader sources
const vsSource = `
attribute vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying float vVerticalPos;
void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
    vVerticalPos = aPosition.y;
}
`;

const fsSource = `
precision mediump float;
varying float vVerticalPos;
uniform float uLayerThreshold;
void main() {
    vec4 green = vec4(0.2, 0.7, 0.3, 1.0);
    vec4 coffee = vec4(0.44, 0.31, 0.22, 1.0);
    vec4 gray = vec4(0.5, 0.5, 0.5, 1.0);
    if (vVerticalPos > uLayerThreshold) gl_FragColor = green;
    else if (vVerticalPos > -uLayerThreshold) gl_FragColor = coffee;
    else gl_FragColor = gray;
}
`;

// Compile shader
function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

// Initialize WebGL
function initGL() {
  const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  return program;
}

// Generate terrain mesh
function createTerrainMesh(size = 30) {    //velicina terena x,y
  const heightMap = generateHeightMap(size);
  const positions = [];
  const indices = [];

  // Create vertices
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      positions.push(x - size/2, heightMap[z][x] * 5, z - size/2);
    }
  }

  // Create indices
  for (let z = 0; z < size-1; z++) {
    for (let x = 0; x < size-1; x++) {
      const i = z * size + x;
      indices.push(i, i + size, i + 1);
      indices.push(i + 1, i + size, i + size + 1);
    }
  }

  return { positions, indices };
}

// Main function
function main() {
  const program = initGL();
  const { positions, indices } = createTerrainMesh();

  // Create buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Set up attributes
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

  // Get uniforms
  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  const uLayerThreshold = gl.getUniformLocation(program, "uLayerThreshold");
  gl.uniform1f(uLayerThreshold, 0.33); // Default 3 layers

  // Camera controls
  let rotX = -0.6, rotY = 0;
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let zoom = 25;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotY += (e.clientX - lastX) * 0.01;
    rotX += (e.clientY - lastY) * 0.01;
    lastX = e.clientX;
    lastY = e.clientY;
    draw();
  });

  canvas.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);

  canvas.addEventListener('wheel', (e) => {
    zoom += e.deltaY * 0.1;
    zoom = Math.max(5, Math.min(50, zoom));
    draw();
  });

  // Matrices
  function getProjectionMatrix() {
    const fov = Math.PI/4;
    const aspect = canvas.width/canvas.height;
    const near = 0.1;
    const far = 100;
    const f = 1/Math.tan(fov/2);
    return [
      f/aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far+near)/(near-far), -1,
      0, 0, 2*far*near/(near-far), 0
    ];
  }

  function getModelViewMatrix() {
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    return [
      cosY, sinX*sinY, cosX*sinY, 0,
      0, cosX, -sinX, 0,
      -sinY, sinX*cosY, cosX*cosY, 0,
      0, -5, -zoom, 1
    ];
  }

  // Draw function
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv(uProjectionMatrix, false, new Float32Array(getProjectionMatrix()));
    gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(getModelViewMatrix()));

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  draw();
}

main();