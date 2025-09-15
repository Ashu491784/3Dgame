import { createScene } from './scene.js';
import { createcity } from './city.js';
import { buildingFactory } from './buildings.js';

export function createGame () {
    let selectedControl = document.getElementById('button-select');
    let activeToolId = 'select';
    let isPause = false;
    let pickedUpBuilding = null;

    const scene = createScene();
    const city = createcity(12);

    scene.initialize(city);
    scene.onObjectSelected = (selectedObject) => {
        try {
            let {x, y} = selectedObject.userData;
            const tile = city.data[x][y];

            console.log(`Tool selected: ${activeToolId}, Tile at (${x}, ${y}):`, tile);
            console.log(`Tile has building:`, !!tile.building);

            if(activeToolId === 'bulldoze') {
                // Bulldoze: remove building
                console.log(`Bulldozing building at (${x}, ${y})`);
                tile.building = undefined;
                updateInfoPanel(null, x, y, 'bulldoze');
                scene.update(city);
            } else if(activeToolId === 'select') {
                // Select mode: just select the object
                console.log(`Selected object at (${x}, ${y})`);
                updateInfoPanel(tile, x, y, 'select');
            } else if(!tile.building) {
                // Regular building placement
                if (buildingFactory[activeToolId]) {
                    console.log(`Placing ${activeToolId} building at (${x}, ${y})`);
                    const newBuilding = buildingFactory[activeToolId]();
                    console.log(`Created building:`, newBuilding);
                    console.log(`Building type:`, newBuilding.type);
                    console.log(`Building style:`, newBuilding.style);
                    tile.building = newBuilding;
                    updateInfoPanel(tile, x, y, activeToolId);
                    scene.update(city);
                } else {
                    console.error(`Unknown building type: ${activeToolId}`);
                }
            } else {
                console.log(`Cannot place ${activeToolId} at (${x}, ${y}) - tile already occupied by ${tile.building.type}`);
                updateInfoPanel(tile, x, y, 'occupied');
            }
        } catch (error) {
            console.error('Error in onObjectSelected:', error);
        }
    }
    
    function updateInfoPanel(tile, x, y, action) {
        const infoPanel = document.getElementById('selected-object-info');
        let infoHTML = '';
        
        if (action === 'bulldoze') {
            infoHTML = `
                <h3>Bulldozed</h3>
                <p><strong>Location:</strong> (${x}, ${y})</p>
                <p><strong>Action:</strong> Removed building/road</p>
                <p><strong>Status:</strong> Tile cleared</p>
            `;
        } else if (action === 'select') {
            if (tile && tile.building) {
                if (tile.building.type === 'road') {
                    infoHTML = `
                        <h3>Road Information</h3>
                        <p><strong>Location:</strong> (${x}, ${y})</p>
                        <p><strong>Type:</strong> Road</p>
                        <p><strong>Height:</strong> ${tile.building.height}</p>
                        <p><strong>Status:</strong> Active</p>
                    `;
                } else {
                    const buildingStyle = tile.building.buildingType === 1 ? 'Traditional' : 'Modern Tower';
                    const buildingDimensions = tile.building.buildingType === 1 
                        ? `${tile.building.width} × ${tile.building.height} × ${tile.building.depth}`
                        : `${(tile.building.width * 0.8).toFixed(1)} × ${(tile.building.height * 1.2).toFixed(1)} × ${(tile.building.depth * 0.8).toFixed(1)}`;
                    const architecturalFeatures = tile.building.buildingType === 1 
                        ? 'Pitched roof with traditional design'
                        : 'Flat roof with modern antenna/spire';
                    
                    infoHTML = `
                        <h3>Building Information</h3>
                        <p><strong>Location:</strong> (${x}, ${y})</p>
                        <p><strong>Type:</strong> ${tile.building.type}</p>
                        <p><strong>Building Style:</strong> ${buildingStyle}</p>
                        <p><strong>Architecture:</strong> ${buildingStyle === 'Traditional' ? 'Classic rectangular design' : 'Modern tower with rotation'}</p>
                        <p><strong>Dimensions:</strong> ${buildingDimensions}</p>
                        <p><strong>Roof Style:</strong> ${architecturalFeatures}</p>
                        <p><strong>Texture Style:</strong> ${tile.building.style}</p>
                        <p><strong>Status:</strong> Active</p>
                    `;
                }
            } else {
                infoHTML = `
                    <h3>Empty Tile</h3>
                    <p><strong>Location:</strong> (${x}, ${y})</p>
                    <p><strong>Status:</strong> Available for construction</p>
                    <p><strong>Terrain:</strong> ${tile.terrainId}</p>
                `;
            }
        } else if (action === 'road') {
            infoHTML = `
                <h3>Road Placed</h3>
                <p><strong>Location:</strong> (${x}, ${y})</p>
                <p><strong>Type:</strong> Road</p>
                <p><strong>Description:</strong> Flat road surface for transportation</p>
                <p><strong>Status:</strong> Newly constructed</p>
            `;
        } else if (action === 'residential' || action === 'commercial' || action === 'industrial') {
            const buildingType = action.charAt(0).toUpperCase() + action.slice(1);
            const buildingStyle = tile.building.buildingType === 1 ? 'Traditional' : 'Modern Tower';
            const buildingDimensions = tile.building.buildingType === 1 
                ? `${tile.building.width} × ${tile.building.height} × ${tile.building.depth}`
                : `${(tile.building.width * 0.8).toFixed(1)} × ${(tile.building.height * 1.2).toFixed(1)} × ${(tile.building.depth * 0.8).toFixed(1)}`;
            const architecturalFeatures = tile.building.buildingType === 1 
                ? 'Pitched roof with traditional design'
                : 'Flat roof with modern antenna/spire';
            
            infoHTML = `
                <h3>${buildingType} Building Placed</h3>
                <p><strong>Location:</strong> (${x}, ${y})</p>
                <p><strong>Type:</strong> ${buildingType}</p>
                <p><strong>Building Style:</strong> ${buildingStyle}</p>
                <p><strong>Architecture:</strong> ${buildingStyle === 'Traditional' ? 'Classic rectangular design' : 'Modern tower with rotation'}</p>
                <p><strong>Dimensions:</strong> ${buildingDimensions}</p>
                <p><strong>Roof Style:</strong> ${architecturalFeatures}</p>
                <p><strong>Texture Style:</strong> ${tile.building.style}</p>
                <p><strong>Status:</strong> Newly constructed</p>
            `;
        } else if (action === 'occupied') {
            infoHTML = `
                <h3>Tile Occupied</h3>
                <p><strong>Location:</strong> (${x}, ${y})</p>
                <p><strong>Current:</strong> ${tile.building.type}</p>
                <p><strong>Status:</strong> Cannot place new structure here</p>
                <p><strong>Tip:</strong> Use bulldoze tool to clear this tile first</p>
            `;
        }
        
        infoPanel.innerHTML = infoHTML;
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
            console.log(`Active tool set to: ${toolId}`);
            
            // Enable building placement mode when a tool is selected
            if (toolId !== 'bulldoze' && toolId !== 'select') {
                scene.camera.setBuildingPlacementMode(true);
            } else {
                scene.camera.setBuildingPlacementMode(false);
            }
            
            // Clear any picked up building when switching tools
            if (toolId !== 'move') {
                pickedUpBuilding = null;
            }
        },
        togglePause() {
            isPause = !isPause;
            if (isPause) {
                scene.stop();
            } else {
                scene.start();
            }
        }
    }

    setInterval(() => {
        if (!isPause) {
            game.update();
        }
    }, 1000);
    
    scene.start();

    return game;
}

