import * as THREE from 'three';
import { createCamera } from './camera.js';
import {createAssetInstance } from './assets.js';

export function createScene() {
   //initialize scen setup
   const gameWindow = document.getElementById('render-target');
   const scene = new THREE.Scene();
   scene.background = new THREE.Color(0x777777);
   
   const camera = createCamera(gameWindow);

   const renderer = new THREE.WebGLRenderer();
   renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
   renderer.setClearColor(0x000000, 0);
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   gameWindow.appendChild(renderer.domElement);
   
   const reycaster = new THREE.Raycaster();
   const mouse = new THREE.Vector2();
   let selectObject = undefined;

   let terrain = [];
   let buildings = [];

   let onObjectSelected = undefined;

   function initialize(city){
    scene.clear();
    terrain = [];
    buildings = [];
    for (let x = 0; x < city.size; x++){
        const column = [];
        for(let y = 0; y < city.size; y++){
          const terrainId = city.data[x][y].terrainId;
          const mesh = createAssetInstance(terrainId,x,y);
            scene.add(mesh);
            column.push(mesh);
          }
            terrain.push(column); 
            buildings.push([...Array(city.size)]);       
    }

    setupLight();
   }

   function update(city){
     try {
       for (let x = 0; x < city.size; x++){
          for(let y = 0; y < city.size; y++){
            const tile = city.data[x][y];
            const existingBuildingMesh = buildings[x][y];
            
            //if the player removes a building, remove it from the scene
            if(!tile.building && existingBuildingMesh){
              console.log(`Removing building at (${x}, ${y})`);
              scene.remove(buildings[x][y]);
              buildings[x][y] = undefined;
            }

            //if the data model has changed, update the mesh
            if(tile.building && tile.building.updated){
              console.log(`Creating/updating building at (${x}, ${y}): ${tile.building.id}`);
              if (existingBuildingMesh) {
                scene.remove(existingBuildingMesh);
              }
              const newBuildingMesh = createAssetInstance(tile.building.id, x, y, tile.building);
              if (newBuildingMesh) {
                buildings[x][y] = newBuildingMesh;
                scene.add(buildings[x][y]);
                tile.building.updated = false;
              } else {
                console.error(`Failed to create building mesh for ${tile.building.id} at (${x}, ${y})`);
              }
            }
          }
      }
     } catch (error) {
       console.error('Error in scene update:', error);
     }
   }


   function setupLight(){
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(20, 20, 20); // Position the light
    sun.castShadow = true;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 0;
    sun.shadow.camera.bottom = -10;
    sun.shadow.camera.width = 1024;
    sun.shadow.camera.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

   }
  function draw() {
    renderer.render(scene, camera.camera);   
  }

  function start() {
    renderer.setAnimationLoop(draw);
  }
  function stop(){
    renderer.setAnimationLoop(null);
  }

  function onMouseDown(event) {
   camera.onMouseDown(event);

   if (event.button === 0) { // Left mouse button
     mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
     mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
     reycaster.setFromCamera(mouse, camera.camera);

     let intersection = reycaster.intersectObjects(scene.children, false);
     if (intersection.length > 0) {
      if(selectObject) selectObject.material.emissive.setHex(0);
       selectObject = intersection[0].object;
       selectObject.material.emissive.setHex(0x555555);
       console.log(selectObject.userData)

       if(this.onObjectSelected){
        this.onObjectSelected(selectObject);
       }
     }
   }
  }

  function onMouseUp(event){
    camera.onMouseUp(event);
  }
  function onMouseMove(event){
    camera.onMouseMove(event);
  }
  
  return {
    onObjectSelected,
    initialize,
    update,
    start,
    stop,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    camera,
    setPickedUpBuilding: (building) => {
      // Visual feedback for picked up building
      if (building) {
        console.log(`Picked up ${building.type} building from (${building.x}, ${building.y})`);
      } else {
        console.log('No building picked up');
      }
    }
  }
}