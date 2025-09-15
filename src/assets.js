import * as THREE from "three";

const cube = new THREE.BoxGeometry(1, 1, 1);

let loader = new THREE.TextureLoader();

function loadTexture(url){
        try {
            const tex = loader.load(url);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);
            return tex;
        } catch (error) {
            console.error(`Failed to load texture: ${url}`, error);
            // Return a default texture or create a colored material
            return null;
        }
}

const Textures = {
        'grass': loadTexture('./public/textture/grass.jpg'),
        'residential1': loadTexture('./public/textture/residntial1.avif'),
        'residential2': loadTexture('./public/textture/residntial2.webp'),
        'residential3': loadTexture('./public/textture/residntial3.jpg'),
        'commercial1': loadTexture('./public/textture/commercial1.jpg'),
        'commercial2': loadTexture('./public/textture/commercial2.jpg'),
        'industrial1': loadTexture('./public/textture/industrial1.webp'),
        'industrial2': loadTexture('./public/textture/indestrial2.webp'),
        'industrial3': loadTexture('./public/textture/industrial3.webp'),
}

// Log loaded textures
console.log('Loaded textures:', Object.keys(Textures));
console.log('Texture objects:', Textures);

function getTopMaterial(){
        return new THREE.MeshLambertMaterial({color: 0x555555});
}

function getSideMaterial(textureName){
        if (Textures[textureName]) {
            return new THREE.MeshLambertMaterial({map: Textures[textureName]});
        } else {
            console.warn(`Texture ${textureName} not found, using fallback color`);
            return new THREE.MeshLambertMaterial({color: 0x888888});
        }
}

/**
 * Creates an asset instance with the given parameters
 * @param {String} assetId - The ID of the asset to create
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} data - Additional data for the asset (e.g., building height)
 * @returns {THREE.Mesh|undefined} The created mesh or undefined if asset not found
 */
export function createAssetInstance(assetId, x, y, data) {
    try {
        if(assetId in assets) {
            return assets[assetId](x, y, data);
        } else {
            console.warn(`Asset Id ${assetId} not found`);
            return undefined;
        }
    } catch (error) {
        console.error(`Error creating asset ${assetId} at (${x}, ${y}):`, error);
        return undefined;
    }
}

const assets = {
        'ground': (x, y) => {
            const material = new THREE.MeshLambertMaterial({map: Textures.grass });
            const mesh = new THREE.Mesh(cube, material);
            mesh.userData = {  x, y };
            mesh.position.set(x, -0.5, y);
            mesh.receiveShadow = true;
            return mesh;
        },
        'residential': (x,y, data) => createBuildingMesh(x,y,data),
        'commercial': (x,y, data) => createBuildingMesh(x,y,data),
        'industrial': (x,y, data) => createBuildingMesh(x,y,data),
        'road': (x, y, data) => {
            // Create a flat road plate
            const roadGeometry = new THREE.PlaneGeometry(1, 1);
            const roadMaterial = new THREE.MeshLambertMaterial({color: 0x333333}); // Dark gray for roads
            const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
            roadMesh.userData = { x, y };
            roadMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            roadMesh.position.set(x, 0.025, y); // Slightly above ground
            roadMesh.receiveShadow = true;
            roadMesh.castShadow = false;
            return roadMesh;
        }
}

function createBuildingMesh(x,y,data) {
   const textureName = `${data.type}${data.style}`;
   console.log(`Creating building mesh for ${data.type} type ${data.buildingType} with texture: ${textureName}`);
   
   let mesh;
   
   if (data.buildingType === 1) {
       // Building Type 1: Traditional rectangular building with pitched roof
       const buildingGeometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
       
       // Check if texture exists
       if (!Textures[textureName]) {
           console.warn(`Texture ${textureName} not found, using fallback`);
           // Use a fallback texture
           const fallbackTexture = Textures[`${data.type}1`] || Textures.grass;
           const material = new THREE.MeshLambertMaterial({map: fallbackTexture});
           mesh = new THREE.Mesh(buildingGeometry, material);
       } else {
           const topMaterial = getTopMaterial();
           const sideMaterial = getSideMaterial(textureName);
           
           let materialArray = [
                sideMaterial,
                sideMaterial,
                topMaterial,
                topMaterial,
                sideMaterial,
                sideMaterial
           ];
           
           mesh = new THREE.Mesh(buildingGeometry, materialArray);
       }
       
       mesh.position.set(x, (data.height - 1) / 2, y);
       
       // Add a pitched roof for traditional buildings
       const roofGeometry = new THREE.ConeGeometry(data.width * 0.7, data.height * 0.3, 4);
       const roofMaterial = new THREE.MeshLambertMaterial({color: 0x8B4513}); // Brown roof
       const roof = new THREE.Mesh(roofGeometry, roofMaterial);
       roof.position.set(0, data.height / 2 + data.height * 0.15, 0);
       roof.rotation.y = Math.PI / 4; // Rotate roof to align with building
       mesh.add(roof);
       
   } else {
       // Building Type 2: Modern tower with different proportions and flat roof
       const towerGeometry = new THREE.BoxGeometry(data.width * 0.8, data.height * 1.2, data.depth * 0.8);
       
       // Check if texture exists
       if (!Textures[textureName]) {
           console.warn(`Texture ${textureName} not found, using fallback`);
           // Use a fallback texture
           const fallbackTexture = Textures[`${data.type}1`] || Textures.grass;
           const material = new THREE.MeshLambertMaterial({map: fallbackTexture});
           mesh = new THREE.Mesh(towerGeometry, material);
       } else {
           const topMaterial = getTopMaterial();
           const sideMaterial = getSideMaterial(textureName);
           
           let materialArray = [
                sideMaterial,
                sideMaterial,
                topMaterial,
                topMaterial,
                sideMaterial,
                sideMaterial
           ];
           
           mesh = new THREE.Mesh(towerGeometry, materialArray);
       }
       
       // Position tower buildings slightly higher and add some variation
       mesh.position.set(x, (data.height * 1.2 - 1) / 2, y);
       
       // Add some rotation for variety
       mesh.rotation.y = Math.PI / 4; // 45-degree rotation
       
       // Add antenna or spire for modern towers
       const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, data.height * 0.4, 8);
       const antennaMaterial = new THREE.MeshLambertMaterial({color: 0x666666}); // Gray antenna
       const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
       antenna.position.set(0, data.height * 1.2 / 2 + data.height * 0.2, 0);
       mesh.add(antenna);
   }
   
   mesh.userData = { x, y };
   mesh.castShadow = true;
   mesh.receiveShadow = false;
   return mesh;
}