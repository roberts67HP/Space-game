
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

    /**
     * Sets up the physics world with default collision configuration, 
     * collision dispatcher, overlapping pair cache, sequential impulse constraint solver, 
     * and sets the gravity to 0.
     */
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

    /**
     * Checks if a collision has occurred and if so, 
     * sets the game over flag if a second has passed since the last collision.
     * 
     * A collision is detected by checking if there are any overlapping
     * manifolds in the physics world.
     */
    #detectCollision(){
        let dispatcher = this.physicsWorld.getDispatcher();
        let numManifolds = dispatcher.getNumManifolds();

        let isTimeElapsed = this.timeBeforeCrash != undefined 
                        && EngineManager.clock.getElapsedTime() > this.timeBeforeCrash + 1;
        let isCollisionDetected = numManifolds > 0;

        if(isTimeElapsed) {
            GameManager.gameOver = true;
            return;
        } else if(isCollisionDetected) {
            this.timeBeforeCrash = EngineManager.clock.getElapsedTime();
        }
    }

    /**
     * Updates the physics world with the deltaTime passed into the method.
     * 
     * It does the following:
     *  1. Steps the simulation with the given deltaTime.
     *  2. Updates the position and rotation of each rigidBody in the
     *     rigidBodies array with the corresponding physics body.
     *  3. Checks if a collision has occurred and sets the game over flag
     *     if a second has passed since the last collision.
     * 
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
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