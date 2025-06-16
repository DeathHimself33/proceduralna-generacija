const gradients = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1]
];
function gradient(x, y) {
  const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  const index = Math.floor(Math.abs(hash) % gradients.length);
  return gradients[index];
}
// Pretvori [-1, 1] u [0, 255]

function fade(x){
    comp1 = 6 * Math.pow(x,5);
    comp2 = 15 * Math.pow(x,4);
    comp3 = 10 * Math.pow(x,3);
    fade = comp1 - comp2 + comp3;
    return fade;
}

function lerp(x,y,u){
    lerp = x + u * (y - x);
    return lerp;
}

function perlin_2d(x, y){
    x0 = Floor(x);
    x1 = x0 + 1;
    y0 = Floor(y);
    y1 = y0 + 1;

    //Vektori udaljenosti
    dx = x - x0;
    dy = y - y0;

    //Dot proizvodi sa vektorom udaljenosti
    const dot00 = gradient(x0, y0)[0]*dx + gradient(x0, y0)[1]*dy;
    const dot10 = gradient(x1, y0)[0]*(dx-1) + gradient(x1, y0)[1]*dy;
    const dot01 = gradient(x0, y1)[0]*dx + gradient(x0, y1)[1]*(dy-1);
    const dot11 = gradient(x1, y1)[0]*(dx-1) + gradient(x1, y1)[1]*(dy-1);

    u = fade(dx);
    v = fade(dy);
    a = lerp(dot00,dot10,u);
    b = lerp(dot01,dot11,u)
    return lerp(a,b,v) 
}

function fractal_perlin(x,y,octaves = 6.0, persistence = 0.5, lacunarity = 2.0){
    total = 0;
    frequency = 1.0;
    amplitude = 1.0;
    let maxValue = 0;
    for(i in Range(octaves)){
        total += perlin_2d(x * frequency, y * frequency) * amplitude;
        frequency *= lacunarity;
        amplitude *= persistence;
    }
    return total / maxValue;
}

