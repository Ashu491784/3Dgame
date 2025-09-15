import * as THREE from "three";

export function createcity(size) {
  const data = [];
  initialize();

  function initialize() {
    for (let x = 0; x < size; x++) {
      const column = [];
      for (let y = 0; y < size; y++) {
        const tile = createTile(x, y);
        column.push(tile);
      }
      data.push(column);
    }
  }

  function update() {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        data[x][y].building?.update();
      }
    }
  }

  return {
    size,
    data,
    update,
  };
}

function createTile(x, y) {
  // 🟩 Tile geometry + mesh
  const geometry = new THREE.BoxGeometry(1, 0.2, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 0, y);

  return {
    x,
    y,
    terrainId: "ground",
    building: undefined,
    mesh,
    enlarge() {
      mesh.scale.set(2, 1, 2); // loku karanna
    },
    reset() {
      mesh.scale.set(1, 1, 1); // normal widiyaṭa
    },
  };
}
