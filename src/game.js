import { createScene } from './scene.js';
import { createcity } from './city.js';

export function createGame () {
    const scene = createScene();
    const city = createcity(8);

    scene.initialize(city);
    
    window.scene = scene;
    document.addEventListener('mousedown', window.scene.onMouseDown, true);
    document.addEventListener('mouseup', window.scene.onMouseUp, false);
    document.addEventListener('mousemove', window.scene.onMouseMove, false);

    const game = {
        update(){
            city.update();
            scene.update(city);
        }
    }

    setInterval(() => {
        game.update();
    },1000)
    scene.start();

    return game;
}
