const gradients = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1]
];

function gradient(x, y) {
  const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return gradients[Math.floor(Math.abs(hash) % gradients.length)];
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

export function fractalPerlin(x, y, octaves = 6, persistence = 0.5) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += perlin2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}