import * as THREE from 'three';

import Ammo from 'ammojs-typed';

import PhysicsManager from './PhysicsManager';
import EngineManager from './EngineManager';

export default class Ship {
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

    load() {
        EngineManager.loader.load('../spaceship/scene.gltf', function (gltf) {
            this.#loadObject(gltf);
        }.bind(this));
        this.#loadControls();
    }

    #loadObject (gltf) {
        this.obj = gltf.scene.children[0];
        this.obj.scale.set(0.4, 0.4, 0.4);

        this.#addToScene(this.obj);

        let body = this.#createPhysicsBody({x: 0, y: -15, z: -5}, {x: 1, y: 0, z: 0, w: 1}, 1);

        this.#setupPhysics(this.obj, body);
    }
    
    #addToScene(obj) {
        EngineManager.scene.add(obj);
    }
    
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
    
    #setupPhysics(obj, body) {
        PhysicsManager.physicsWorld.addRigidBody(body);
        obj.userData.physicsBody = body;
        PhysicsManager.rigidBodies.push(obj);
    }

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