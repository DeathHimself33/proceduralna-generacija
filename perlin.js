let seed = Math.random() * 10000;

const gradients = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1]
];

function seededHash(x, y) {
  // Use seed to modify hash, simple hash function with seed
  const s = seed;
  const hash = Math.sin(x * 12.9898 + y * 78.233 + s) * 43758.5453;
  return Math.abs(hash);
}

function gradient(x, y) {
  const hash = seededHash(x, y);
  return gradients[Math.floor(hash) % gradients.length];
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

export function perlin2D(x, y) {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;

  const dx = x - x0;
  const dy = y - y0;

  const dot00 = gradient(x0, y0)[0] * dx + gradient(x0, y0)[1] * dy;
  const dot10 = gradient(x1, y0)[0] * (dx - 1) + gradient(x1, y0)[1] * dy;
  const dot01 = gradient(x0, y1)[0] * dx + gradient(x0, y1)[1] * (dy - 1);
  const dot11 = gradient(x1, y1)[0] * (dx - 1) + gradient(x1, y1)[1] * (dy - 1);

  return lerp(
    lerp(dot00, dot10, fade(dx)),
    lerp(dot01, dot11, fade(dx)),
    fade(dy)
  );
}

export function fractalPerlin(x, y, params = {}) {
  const octaves = params.octaves || 6;
  const persistence = params.persistence || 0.5;
  const lacunarity = params.lacunarity || 2.0;

  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += perlin2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;  // <-- Use lacunarity here
  }

  return total / maxValue;
}


// Function to set the seed from outside
export function setSeed(newSeed) {
  seed = newSeed;
}
