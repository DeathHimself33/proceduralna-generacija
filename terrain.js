import { fractalPerlin } from './perlin.js';

export function generateHeightMap(width, height, scale = 0.1) {
  const map = [];
  for (let z = 0; z < height; z++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      // Normalize coordinates and apply Perlin noise
      const nx = x / width - 0.5;
      const nz = z / height - 0.5;
      let elevation = fractalPerlin(nx * scale, nz * scale);
      row.push(elevation);
    }
    map.push(row);
  }
  return map;
}