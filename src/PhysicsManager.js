
import GameManager from './GameManager';
import EngineManager from './EngineManager';

class PhysicsManager {
    init () {
        this.rigidBodies = [];
        this.timeBeforeCrash = undefined;
    }

    reset () {
        this.init();
    }

    detectCollision(){
        let dispatcher = EngineManager.physicsWorld.getDispatcher();
        let numManifolds = dispatcher.getNumManifolds();
    
        if(this.timeBeforeCrash != undefined && EngineManager.clock.getElapsedTime() > this.timeBeforeCrash + 1) {
            GameManager.gameOver = true;
            return;
        } else if(numManifolds > 0) {
            this.timeBeforeCrash = EngineManager.clock.getElapsedTime();
        }
    }

    update(deltaTime){
        EngineManager.physicsWorld.stepSimulation(deltaTime, 10);

        for (let i = 0; i < this.rigidBodies.length; i++) {
            let objThree = this.rigidBodies[i];
            let objAmmo = objThree.userData.physicsBody;
            let ms = objAmmo.getMotionState();

            if (ms) {
                var tempTransform = new Ammo.btTransform();

                ms.getWorldTransform(tempTransform);

                let p = tempTransform.getOrigin();
                let q = tempTransform.getRotation();

                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        }
        this.detectCollision();
    }
}

export default new PhysicsManager();