import { generateHeightMap } from './terrain.js';

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// Mouse rotation variables
let isDragging = false;
let lastX = 0, lastY = 0;
let rotX = -0.6, rotY = 0;

async function main() {
    // Shader loading and compilation (same as before)
    // ...

    // Generate terrain
    const heightMap = generateHeightMap(50, 50);
    const positions = [];
    const texCoords = [];
    const indices = [];

    // Create mesh
    for (let z = 0; z < heightMap.length; z++) {
        for (let x = 0; x < heightMap[0].length; x++) {
            positions.push(x, heightMap[z][x] * 5, z); // Scale height for better visibility
            texCoords.push(x / heightMap[0].length, z / heightMap.length);
        }
    }

    // Create indices (same as before)
    // ...

    // Set up buffers (same as before)
    // ...

    // Add layer threshold uniform
    const uLayerThreshold = gl.getUniformLocation(program, "uLayerThreshold");
    gl.uniform1f(uLayerThreshold, 0.33); // Default shows all 3 layers

    // Mouse controls
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        rotY += dx * 0.01;
        rotX += dy * 0.01;
        lastX = e.clientX;
        lastY = e.clientY;
        draw();
    });

    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);

    function getModelViewMatrix() {
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        
        return new Float32Array([
            cosY, sinX * sinY, cosX * sinY, 0,
            0, cosX, -sinX, 0,
            -sinY, sinX * cosY, cosX * cosY, 0,
            -25, -10, -25, 1
        ]);
    }

    function draw() {
        gl.uniformMatrix4fv(uModelViewMatrix, false, getModelViewMatrix());
        // Rest of draw code...
    }

    draw();
}

main();