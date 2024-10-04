import * as THREE from 'three';

import Ammo from 'ammojs-typed';

import GameData from './GameData';

import EngineManager from './EngineManager';
import AsteroidManager from './AsteroidManager';
import PhysicsManager from './PhysicsManager';
import Ship from './Ship';

var gameLoop = () => {
    let deltaTime = EngineManager.clock.getDelta();

    if(!GameData.gameOver) {
        AsteroidManager.update();
        GameData.ship.update();
        PhysicsManager.update(deltaTime);

        EngineManager.controls.update();
    } else {
        if(!GameData.gameOverShown) {
            alert("Game over. You lasted "+Math.round(EngineManager.clock.getElapsedTime())+" seconds.");
            GameData.gameOverShown = true;
        }
    }
    
    EngineManager.render();
    requestAnimationFrame(gameLoop);
}

Ammo(Ammo).then(() => {
    EngineManager.init();

    GameData.ship = new Ship();
    GameData.gameOver = false,
    GameData.gameOverShown = false

    gameLoop();
});