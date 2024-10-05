
import AsteroidManager from "./AsteroidManager";
import PhysicsManager from "./PhysicsManager";
import EngineManager from "./EngineManager";

import Ship from "./Ship";

class GameManager {
    init () {
        EngineManager.init();
        PhysicsManager.init();
    
        AsteroidManager.init();

        this.ship = new Ship();
        this.gameOver = false;
        this.gameOverShown = false;
    }
    reset () {
        this.init();
    }
}

export default new GameManager();