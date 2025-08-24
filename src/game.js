import { createScene } from './scene.js';
import { createcity } from './city.js';
import { buildingFactory } from './buildings.js';

export function createGame () {
    let activeToolId = '';
    let pickedUpBuilding = null; // Track the building being moved

    const scene = createScene();
    const city = createcity(16);

    scene.initialize(city);
    scene.onObjectSelected = (selectedObject) => {
        try {
            let {x, y} = selectedObject.userData;
            const tile = city.data[x][y];

            console.log(`Tool selected: ${activeToolId}, Tile at (${x}, ${y}):`, tile);

            if(activeToolId === 'bulldoze') {
                // Bulldoze: remove building
                console.log(`Bulldozing building at (${x}, ${y})`);
                tile.building = undefined;
                scene.update(city);
            } else if(activeToolId === 'move') {
                // Move mode: pick up building or place it
                if (pickedUpBuilding && !tile.building) {
                    // Place the picked up building
                    tile.building = pickedUpBuilding;
                    console.log(`Placed ${pickedUpBuilding.id} building at (${x}, ${y})`);
                    pickedUpBuilding = null;
                    scene.setPickedUpBuilding(null);
                    scene.update(city);
                } else if (tile.building && !pickedUpBuilding) {
                    // Pick up this building
                    pickedUpBuilding = tile.building;
                    tile.building = undefined;
                    scene.setPickedUpBuilding(pickedUpBuilding);
                    scene.update(city);
                }
            } else if(!tile.building) {
                // Regular building placement
                if (buildingFactory[activeToolId]) {
                    console.log(`Placing ${activeToolId} building at (${x}, ${y})`);
                    tile.building = buildingFactory[activeToolId]();
                    scene.update(city);
                } else {
                    console.error(`Unknown building type: ${activeToolId}`);
                }
            } else {
                console.log(`Cannot place ${activeToolId} at (${x}, ${y}) - tile already occupied by ${tile.building.id}`);
            }
        } catch (error) {
            console.error('Error in onObjectSelected:', error);
        }
    }
    document.addEventListener('mousedown', scene.onMouseDown.bind(scene), false);
    document.addEventListener('mouseup', scene.onMouseUp.bind(scene), false);
    document.addEventListener('mousemove', scene.onMouseMove.bind(scene), false);
    document.addEventListener('contextmenu', (event) => event.preventDefault(), false);

    const game = {
        update(){
            city.update();
            scene.update(city);
        },
        setActiveTool(toolId){
            activeToolId = toolId;
            // Enable building placement mode when a tool is selected
            if (toolId !== 'bulldoze' && toolId !== 'move') {
                scene.camera.setBuildingPlacementMode(true);
            } else {
                scene.camera.setBuildingPlacementMode(false);
            }
            
            // Clear any picked up building when switching tools
            if (toolId !== 'move') {
                pickedUpBuilding = null;
            }
        }
    }

    setInterval(() => {
        game.update();
    },1000)
    scene.start();

    return game;
}

