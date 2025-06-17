import { fractalPerlin } from './perlin.js';

function generateHeightMap(size=1, scale = 5) { //size=najveci razmak izmedu planjine i dubine; scale=visina planina i broj(idealno do 5)
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

// Initialize shaders
function initShaders() {
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking error:", gl.getProgramInfoLog(program));
        return null;
    }
    
    gl.useProgram(program);
    return program;
}

// Generate terrain mesh
function createTerrainMesh(size = 20) {    //velicina terena x,y
  const heightMap = generateHeightMap(size);
  const positions = [];
  const indices = [];

    // Create vertices
    for (let z = 0; z < terrainSize; z++) {
        for (let x = 0; x < terrainSize; x++) {
            positions.push(x - terrainSize/2, heightMap[z][x] * 5, z - terrainSize/2);
        }
    }

    // Create indices
    for (let z = 0; z < terrainSize-1; z++) {
        for (let x = 0; x < terrainSize-1; x++) {
            const i = z * terrainSize + x;
            indices.push(i, i + terrainSize, i + 1);
            indices.push(i + 1, i + terrainSize, i + terrainSize + 1);
        }
    }

    return { positions, indices };
}

// Update terrain when parameters change
function updateTerrain() {
    const { positions, indices } = createTerrainMesh();
    
    // Update position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    // Update index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    // Rebind attributes
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    
    draw();
}

// Setup camera controls
function setupControls(canvas) {
    let isDragging = false;
    let lastX = 0, lastY = 0;

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

    // Slider controls
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');

    sizeSlider.addEventListener('input', function() {
        terrainSize = parseInt(this.value);
        sizeValue.textContent = terrainSize;
        updateTerrain();
    });

    scaleSlider.addEventListener('input', function() {
        terrainScale = parseFloat(this.value);
        scaleValue.textContent = terrainScale.toFixed(1);
        updateTerrain();
    });
}

// Matrix calculations
function getProjectionMatrix(canvas) {
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
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.5, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv(uProjectionMatrix, false, new Float32Array(getProjectionMatrix(gl.canvas)));
    gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(getModelViewMatrix()));

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

// Main function
function main() {
    const canvas = initWebGL();
    if (!canvas) return;
    
    program = initShaders();
    if (!program) return;
    
    // Get uniform locations
    uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    const uLayerThreshold = gl.getUniformLocation(program, "uLayerThreshold");
    gl.uniform1f(uLayerThreshold, 0.33);
    
    // Create buffers
    positionBuffer = gl.createBuffer();
    indexBuffer = gl.createBuffer();
    
    // Initial terrain generation
    updateTerrain();
    
    // Setup controls
    setupControls(canvas);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    });
    
    // Initial draw
    draw();
}

main();