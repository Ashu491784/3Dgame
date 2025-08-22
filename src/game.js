import { createScene } from './scene.js';
import { createcity } from './city.js';

export function createGame () {
    let activeToolId = '';

    const scene = createScene();
    const city = createcity(16);

    scene.initialize(city);
    scene.onObjectSelected = (selectedObject) => {
        let {x, y} = selectedObject.userData;
        const tile = city.data[x][y];

        if(activeToolId === 'bulldoze') {
            tile.buildingId = undefined;
            scene.update(city);
        }else if(!tile.buildingId) {
            tile.buildingId = activeToolId;
            scene.update(city);
        }
    }
    document.addEventListener('mousedown', scene.onMouseDown.bind(scene), true);
    document.addEventListener('mouseup', scene.onMouseUp.bind, false);
    document.addEventListener('mousemove', scene.onMouseMove.bind(scene), false);
    document.addEventListener('contextmenu', (event) => event.preventDefault(), false);

    const game = {
        update(){
            city.update();
            scene.update(city);
        },
        setActiveTool(toolId){
            activeToolId = toolId;
        }
    }

    setInterval(() => {
        game.update();
    },1000)
    scene.start();

    return game;
}
