// Konfiguracijski parametri
const TERRAIN_CONFIG = {
  width: 1024,          // Rezolucija heightmape
  height: 1024,
  scale: 0.02,          // Osnovni skala terena
  octaves: 6,           // Broj oktava za fractal šum
  persistence: 0.5,     // Utjecaj viših oktava
  lacunarity: 2.0,      // Frekvencijska promjena
  seed: 12345           // Seed za reprodukciju
};

// Gradienti
const gradients = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1]
];

// Poboljšani gradijent sa seedom
function gradient(x, y, seed = 0) {
  const seededX = x * 12.9898 + seed;
  const seededY = y * 78.233 + seed * 1.618;
  const hash = Math.sin(seededX + seededY) * 43758.5453;
  const index = Math.floor(Math.abs(hash) % gradients.length);
  return gradients[index];
}

// Funkcije za interpolaciju (ostaju iste)
function fade(x) {
  return 6*x**5 - 15*x**4 + 10*x**3;
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

// 2D Perlin šum sa seedom
function perlin_2d(x, y, seed = 0) {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;

  const dx = x - x0;
  const dy = y - y0;

  const dot00 = gradient(x0, y0, seed)[0] * dx + gradient(x0, y0, seed)[1] * dy;
  const dot10 = gradient(x1, y0, seed)[0] * (dx-1) + gradient(x1, y0, seed)[1] * dy;
  const dot01 = gradient(x0, y1, seed)[0] * dx + gradient(x0, y1, seed)[1] * (dy-1);
  const dot11 = gradient(x1, y1, seed)[0] * (dx-1) + gradient(x1, y1, seed)[1] * (dy-1);

  const u = fade(dx);
  const v = fade(dy);
  
  const a = lerp(dot00, dot10, u);
  const b = lerp(dot01, dot11, u);
  return lerp(a, b, v);
}

// Fraktalni Perlin sa normalizacijom [0, 1]
function fractal_perlin(x, y, config) {
  let total = 0;
  let frequency = config.scale;
  let amplitude = 1;
  let maxAmplitude = 0;  // Za normalizaciju

  for(let i = 0; i < config.octaves; i++) {
    total += perlin_2d(
      x * frequency, 
      y * frequency, 
      config.seed + i
    ) * amplitude;
    
    maxAmplitude += amplitude;
    amplitude *= config.persistence;
    frequency *= config.lacunarity;
  }

  // Normalizacija na [-1, 1] pa pretvorba u [0, 1]
  const normalized = total / maxAmplitude;
  return (normalized + 1) * 0.5;
}

// Generiranje heightmap matrice (glavni izlazni format)
function generateHeightmap(config = TERRAIN_CONFIG) {
  const heightmap = new Array(config.height);
  
  for(let y = 0; y < config.height; y++) {
    heightmap[y] = new Float32Array(config.width);
    
    for(let x = 0; x < config.width; x++) {
      // Dodaj offset kako bi različiti seedovi davali različite rezultate
      const noiseX = x + config.seed * 100;
      const noiseY = y + config.seed * 100;
      
      heightmap[y][x] = fractal_perlin(noiseX, noiseY, config);
    }
  }
  
  return heightmap;
}

// Primjer upotrebe
// const heightmap = generateHeightmap();