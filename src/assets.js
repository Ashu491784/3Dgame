import * as THREE from "three";

const cube = new THREE.BoxGeometry(1, 1, 1);

let loader = new THREE.TextureLoader();

function loadTexture(url){
        const tex = loader.load(url);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 1);
        return tex;
}
const Textures = {
        grass: loadTexture('./public/textures/grass.jpg'),
        'residential': loadTexture('./public/textures/residntial1.jpg'),
        'residential': loadTexture('./public/textures/residntial2.jpg'),
        'residential': loadTexture('./public/textures/residntial3.jpg'),
        'commercial': loadTexture('./public/textures/commercial.jpg'),
        'commercial': loadTexture('./public/textures/commercial.jpg'),
        'commercial': loadTexture('./public/textures/commercial.jpg'),
        'industrial': loadTexture('./public/textures/industrial.jpg'),
        'industrial': loadTexture('./public/textures/industrial.jpg'),
        'industrial': loadTexture('./public/textures/industrial.jpg'),
}
function getTopMeterial(){
        return new THREE.MeshLambertMaterial({color: 0x5555555 });
}

function getSideMeterial(textureName){
        return new THREE.MeshLambertMaterial({map: Textures[textureName].clone()});
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
        'residential': (x,y, data) => createZoomMesh(x,y,data),
        'commercial': (x,y, data) => createZoomMesh(x,y,data),
        'industrial': (x,y, data) => createZoomMesh(x,y,data),
        'road': (x, y) => {
            const material = new THREE.MeshLambertMaterial({color: 0x2222222});
            const mesh = new THREE.Mesh(cube, material);
            mesh.userData = {  x, y };
            mesh.position.set(x, 0.01, y);
            mesh.receiveShadow = true;
            return mesh;
        }
}

function createZoomMesh(x,y,data) {
   const textureName = data.type = data.style;
   const topMaterial = getTopMeterial();
   const sideMaterial = getSideMeterial(textureName);
 
   let materialArray = [
        sideMaterial,
        sideMaterial,
        topMaterial,
        topMaterial,
        sideMaterial,
        sideMaterial
   ];
   let mesh = new THREE.Mesh(cube, materialArray);
   mesh.userData = {  x, y };
   mesh.position.set(0.0, (data.height - 0.95) / 2, 0.8);
   mesh.material.forEach(material => material.map?.repeal.set(1, data.height - 1));
   mesh.position.set(x, (data.height - 0.95) / 4, y);
   mesh.castShadow = true;
   mesh.receiveShadow = false;
   return mesh;

}