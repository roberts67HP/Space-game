
import GameManager from './GameManager';
import EngineManager from './EngineManager';

class PhysicsManager {
    //Is initalized in GameManager
    init () {
        this.physicsWorld = null; 
        this.rigidBodies = [];
        this.timeBeforeCrash = undefined;

        this.#setupPhysicsWorld();
    }

    //Gets called in GameManager
    kill () {
        // Remove all rigid bodies
        this.rigidBodies.forEach(rigidBody => {
            rigidBody.userData.physicsBody.clearForces();
            this.physicsWorld.removeRigidBody(rigidBody.userData.physicsBody);
        });

        // Reset the physics world
        this.physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));

        // Reset the rigid bodies array
        this.rigidBodies = [];
    }

    #setupPhysicsWorld () {
        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();
    
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
            dispatcher, 
            overlappingPairCache, 
            solver,
            collisionConfiguration
        );
        this.physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));
    }

    #detectCollision(){
        let dispatcher = this.physicsWorld.getDispatcher();
        let numManifolds = dispatcher.getNumManifolds();

        if(this.timeBeforeCrash != undefined && EngineManager.clock.getElapsedTime() > this.timeBeforeCrash + 1) {
            GameManager.gameOver = true;
            return;
        } else if(numManifolds > 0) {
            this.timeBeforeCrash = EngineManager.clock.getElapsedTime();
        }
    }

    update(deltaTime){
        this.physicsWorld.stepSimulation(deltaTime, 10);

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
        this.#detectCollision();
    }
}

//Singleton
export default new PhysicsManager();