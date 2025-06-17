import { generateHeightMap } from '../terrain.js'; // ili gde već ti se nalazi

function testGenerateHeightMap() {
  const width = 5;
  const height = 5;
  const scale = 2.0;

  const map = generateHeightMap(width, height, scale);

  console.log('--- Height Map Values ---');
  let allValid = true;

  for (let z = 0; z < height; z++) {
    let rowStr = '';
    for (let x = 0; x < width; x++) {
      const val = map[z][x];
      rowStr += val.toFixed(4).padStart(8) + ' ';
      if (val < -1 || val > 1 || isNaN(val)) {
        allValid = false;
      }
    }
    console.log(rowStr);
  }

  if (allValid) {
    console.log('\n✅ All values are in range [-1, 1]');
  } else {
    console.error('\n❌ Some values are out of range!');
  }
}

// Poziv test funkcije
testGenerateHeightMap();
