function gradient(x, y, seed = 0) {
  //Pseudo-random generisanje sa seedom
  const n = (x * 92837111) ^ (y * 689287499) ^ (seed * 283923);
  const h = (n << 13) ^ n;
  return ((h * (h * h * 60493 + 19990303) + 1376312589) & 0x7FFFFFFF) % 8;
}

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

    //Dot proizvodi
    dot00 = gradient(x0,y0);
    dot10 = gradient(x1,y0);
    dot01 = gradient(x0,y1);
    dot11 = gradient(x1,y1);

    u = fade(dx);
    u = fade(dy);
    a = lerp(dot00,dot01,u);
    b = lerp(dot01,dot11,u)
    return lerp(a,b,v) 
}

function fractal_perlin(x,y,octaves = 6.0, persistence = 0.5, lacunarity = 2.0){
    total = 0;
    frequency = 1.0;
    amplitude = 1.0;
    for(i in Range(octaves)){
        total += perlin_2d(x * frequency, y * frequency) * amplitude;
        frequency *= lacunarity;
        amplitude *= persistence;
    }
    return total;
}