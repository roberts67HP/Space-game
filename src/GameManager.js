
import AsteroidManager from "./AsteroidManager";
import PhysicsManager from "./PhysicsManager";
import EngineManager from "./EngineManager";

import Ship from "./Ship";

class GameManager {
    //Is initalized in index.js
    init () {
        EngineManager.init();
        PhysicsManager.init();
        AsteroidManager.init();

        this.ship = new Ship();
        this.gameOver = false;
        this.gameOverShown = false;
    }
    //Killed in index.js
    kill () {
        AsteroidManager.kill();
        PhysicsManager.kill();
        EngineManager.kill();
    }

    reset () {
        this.kill();
        this.init();
    }
}

//Singleton
export default new GameManager();