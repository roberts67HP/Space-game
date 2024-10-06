import * as THREE from 'three';

import Ammo from 'ammojs-typed';

import PhysicsManager from './PhysicsManager';
import EngineManager from './EngineManager';

export default class Ship {
    /**
     * Initializes the ship with no object and all moveDirections set to 0.
     * Calls the load method to load the ship model.
     */
    constructor () {
        this.obj = null;
        this.moveDirection = {
            left: 0, 
            right: 0, 
            forward: 0, 
            back: 0 
        };

        this.load();
    }
    /**
     * Loads the ship object from the gltf model (in #loadObject) and sets up the event listeners 
     * for the ship's controls.
     */
    load() {
        EngineManager.loader.load('../spaceship/scene.gltf', function (gltfModel) {
            this.#loadObject(gltfModel);
        }.bind(this));

        this.#loadControls();
    }

    /**
     * Loads the ship object from the given gltf model.
     * @param {object} gltfModel - The gltf model to load the ship from.
     */
    #loadObject (gltfModel) {
        this.obj = gltfModel.scene.children[0];
        this.obj.scale.set(0.4, 0.4, 0.4);

        this.#addToScene(this.obj);

        let body = this.#createPhysicsBody({x: 0, y: -15, z: -5}, {x: 1, y: 0, z: 0, w: 1}, 1);

        this.#setupPhysics(this.obj, body);
    }
    
    /**
     * Adds the given object to the scene.
     * @param {THREE.Object3D} obj - The object to add to the scene.
     */
    #addToScene(obj) {
        EngineManager.scene.add(obj);
    }
    
    /**
     * Creates a physics body based on the given position, quaternion and mass parameters.
     *
     * The body is created with a box shape and is set to have a friction of 4,
     * a rolling friction of 10 and a restitution of 0.6. The body is also set
     * to have the disable deactivation flag.
     * 
     * @param {Object} pos - The position of the body in 3D space.
     * @param {Object} quat - The quaternion of the body in 3D space.
     * @param {Number} mass - The mass of the body.
     * 
     * @returns {Object} The created physics body.
    */
    #createPhysicsBody(pos, quat, mass) {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    
        let motionState = new Ammo.btDefaultMotionState(transform);
        let colShape = new Ammo.btBoxShape(new Ammo.btVector3(5 * 0.5, 6 * 0.5, 1 * 0.5));
        colShape.setMargin(0.05);
    
        let localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localInertia);
    
        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);
    
        body.setFriction(4);
        body.setRollingFriction(10);
        body.setRestitution(0.6);
        body.setActivationState(4); // DISABLE_DEACTIVATION
    
        return body;
    }
    
    /**
     * Sets up the physics body for the given object.
     * 
     * Adds the physics body to the physics world, sets the physics body as the user data for the object
     * and adds the object to the list of rigid bodies.
     * 
     * @param {THREE.Object3D} obj - The object to set up the physics body for.
     * @param {Object} body - The physics body to set up for the object.
     */
    #setupPhysics(obj, body) {
        PhysicsManager.physicsWorld.addRigidBody(body);
        obj.userData.physicsBody = body;
        PhysicsManager.rigidBodies.push(obj);
    }

    /**
     * Loads the controls for the ship.
     * 
     * Listens for 'resize' events to update the camera and renderer, and 'keydown' and 'keyup' events
     * to set the direction of the ship.
     */
    #loadControls () {
        window.addEventListener('resize', () => {
            EngineManager.camera.aspect = window.innerWidth / window.innerHeight;
            EngineManager.camera.updateProjectionMatrix();
            
            EngineManager.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener('keydown', function (event) {
            switch(event.key){
                case 'a':
                    this.moveDirection.left = 1;
                    break;
                case 'd':
                    this.moveDirection.right = 1;
                    break;
            }
        }.bind(this), false);
        window.addEventListener('keyup', function (event) {
            switch(event.key){
                case 'a':
                    this.moveDirection.left = 0;
                    break;
                case 'd':
                    this.moveDirection.right = 0;
                    break;
            }
        }.bind(this), false);
    }

    /**
     * Updates the ship's movement based on the direction the player is moving.
     * 
     * Gets the direction the player is moving, and sets the linear velocity of the ship accordingly.
     * 
     * The ship will not move if it is already at the edge of the screen and the player is trying to move it more in that direction.
     */
     
    update () {
        if(this.obj != null) {
            let scalingFactor = 60;
            let moveX = this.moveDirection.right - this.moveDirection.left;
    
            if((this.obj.position.x > 27 && moveX == 1) || (this.obj.position.x < -27 && moveX == -1)) {
                moveX = 0;
            }
    
            let resultantImpulse = new Ammo.btVector3(moveX, 0, 0);
            resultantImpulse.op_mul(scalingFactor);
    
            let physicsBody = this.obj.userData.physicsBody;
            physicsBody.setLinearVelocity(resultantImpulse);
        }
    }
}