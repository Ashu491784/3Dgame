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
     for (let x = 0; x < city.size; x++){
        for(let y = 0; y < city.size; y++){
          const currentBuildingId = buildings[x][y]?.userData.id;
          const newBuildingId = city.data[x][y].buildingId; 
          
          //if the player removes a building, remove it from the scene
          if(!newBuildingId && currentBuildingId){
            scene.remove(buildings[x][y]);
            buildings[x][y] = undefined;
          }

          //if the data model has changed, update the mesh
          if(newBuildingId && newBuildingId !== currentBuildingId){
            scene.remove(buildings[x][y]);
            buildings[x][y] = createAssetInstance(newBuildingId,x,y);
            scene.add(buildings[x][y]);
          }
        }
    }
  }


   function setupLight(){
    const lights = [
      new THREE.AmbientLight(0xffffff, 0.2),
      new THREE.DirectionalLight(0xffffff, 0.3),
      new THREE.DirectionalLight(0xffffff, 0.3),
      new THREE.DirectionalLight(0xffffff, 0.3)
    ];
    lights[1].position.set(0, 1, 0);
    lights[2].position.set(1, 1, 0);
    lights[3].position.set(0, 1, 1);
    scene.add(...lights);

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

   // Always handle building selection on left mouse down
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