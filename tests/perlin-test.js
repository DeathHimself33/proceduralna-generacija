import { perlin2D, fractalPerlin } from '../perlin.js';
function testPerlinNoise() {
  const testPoints = [
    [0.0, 0.0],
    [0.1, 0.1],
    [0.5, 0.5],
    [1.0, 1.0],
    [2.3, 4.7]
  ];

  console.log('--- Perlin2D Tests ---');
  for (const [x, y] of testPoints) {
    const value = perlin2D(x, y);
    console.log(`perlin2D(${x.toFixed(2)}, ${y.toFixed(2)}) = ${value.toFixed(4)}`);
  }

  console.log('\n--- Fractal Perlin Tests ---');
  for (const [x, y] of testPoints) {
    const value = fractalPerlin(x, y, 5, 0.5);
    console.log(`fractalPerlin(${x.toFixed(2)}, ${y.toFixed(2)}) = ${value.toFixed(4)}`);
  }
}
testPerlinNoise();