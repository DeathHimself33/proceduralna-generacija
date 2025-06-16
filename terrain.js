const PerlinNoise = require('./perlin.js');  //

class Terrain {
    constructor(size) {
        this.size = size;
        this.heightMap = this.generateHeightMap();
    }

    generateHeightMap() {
        const map = [];
        for (let z = 0; z < this.size; z++) {
            const row = [];
            for (let x = 0; x < this.size; x++) {
                // Koristimo samo Y iz Perlinovog šuma!
                const { y } = PerlinNoise.generate(x, 0, z);  // (x, y, z)
                row.push(y);
            }
            map.push(row);
        }
        return map;  // 2D niz visina (heightmap)
    }

    getMesh() {
        const vertices = [], indices = [];
        for (let z = 0; z < this.size; z++) {
            for (let x = 0; x < this.size; x++) {
                vertices.push(x, this.heightMap[z][x], z);  // X, Y, Z
                if (x < this.size - 1 && z < this.size - 1) {
                    const i = z * this.size + x;
                    indices.push(i, i + 1, i + this.size);  // Trouglovi
                }
            }
        }
        return { vertices, indices };
    }
}

module.exports = Terrain;  // Ili `export default Terrain`