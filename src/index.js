import * as THREE from 'three';

import Ammo from 'ammojs-typed';

import GameManager from './GameManager';

import EngineManager from './EngineManager';
import AsteroidManager from './AsteroidManager';
import PhysicsManager from './PhysicsManager';
import Ship from './Ship';

import AlertWindow from './AlertWindow';

var gameLoop = () => {
    let deltaTime = EngineManager.clock.getDelta();

    if (!GameManager.gameOver) {
      AsteroidManager.update();
      GameManager.ship.update();
      PhysicsManager.update(deltaTime);
  
      EngineManager.controls.update();
    } else {
        if (!GameManager.gameOverShown) {
            var gameOverWindow = new AlertWindow(
                'Game Over! You lasted ' + Math.round(EngineManager.clock.getElapsedTime()) + ' seconds.', [
                    {
                        text: 'Restart',
                        onClick: () => {
                            GameManager.reset();

                            gameOverWindow.close();
                        }
                    },
                    // {
                    //     text: 'No',
                    //     onClick: () => {
                    //         console.log('You clicked No');
                    //         gameOverWindow.close();
                    //     }
                    // }
                ]

            );
    
            GameManager.gameOverShown = true;
        }
    }

    EngineManager.render();
    requestAnimationFrame(gameLoop);
}

Ammo(Ammo).then(() => {
    GameManager.init();

    gameLoop();
});