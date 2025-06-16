export function generateHeightMap(width, height) {
    const map = [];
    for (let z = 0; z < height; z++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            // Ravna podloga sa blagim brdašcima
            const wave = 0.1 * Math.sin(x * 0.3) * Math.cos(z * 0.3);
            const bump = 0.15 * Math.exp(-((x - 30) ** 2 + (z - 30) ** 2) / 100); // jedno brdo u centru
            row.push(wave + bump);
        }
        map.push(row);
    }
    return map;
}

export function generateTerrainMesh(heightMap) {
    const width = heightMap[0].length;
    const height = heightMap.length;
    const positions = [];
    const indices = [];

    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const y = heightMap[z][x];
            positions.push(x, y, z);
        }
    }

    for (let z = 0; z < height - 1; z++) {
        for (let x = 0; x < width - 1; x++) {
            const topLeft = z * width + x;
            const topRight = topLeft + 1;
            const bottomLeft = (z + 1) * width + x;
            const bottomRight = bottomLeft + 1;

            indices.push(topLeft, bottomLeft, topRight);
            indices.push(topRight, bottomLeft, bottomRight);
        }
    }

    return { positions, indices };
}
