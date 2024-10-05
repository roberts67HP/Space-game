import * as THREE from 'three';
import Ammo from 'ammojs-typed';

import EngineManager from './EngineManager';
import PhysicsManager from './PhysicsManager';

import astTex from '../assets/2k_moon.jpg';

class AsteroidManager {
    //Is initalized in GameManager
    init () {
        this.asteroids = [];
        this.timeOfAstSpawn = undefined;
        this.astGen = 1;
        this.astSpeed = 50;
    }
    
    //Gets called in GameManager
    kill () {
        this.asteroids.forEach((asteroid) => {
            EngineManager.scene.remove(asteroid);
            PhysicsManager.physicsWorld.removeRigidBody(asteroid.userData.physicsBody);
        });
        this.asteroids = [];
    }

    #generateAsteroidPosition(randNum) {
        randNum -= 6;
        return { x: randNum * 5, y: -15, z: -500 };
    }

    #createAsteroidMesh() {
        let radius = 1;
        let quat = { x: 0, y: 0, z: 0, w: 1 };
        let mass = 1;

        var asteroid = new THREE.Mesh(
            new THREE.SphereBufferGeometry(radius), 
            new THREE.MeshStandardMaterial({
                map: new THREE.TextureLoader().load(astTex),
                metalness: 0
            })
        );

        return asteroid;
    }

    #setupAsteroidPhysics(asteroid, pos) {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));

        let motionState = new Ammo.btDefaultMotionState(transform);

        let colShape = new Ammo.btSphereShape(1);
        colShape.setMargin(0.05);

        let localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(1, localInertia);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(1, motionState, colShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);

        body.setFriction(4);
        body.setRollingFriction(10);
        body.setRestitution(0.6);
        body.setActivationState(4); // DISABLE_DEACTIVATION

        return body;
    }

    loadAsteroid(randNum) {
        let pos = this.#generateAsteroidPosition(randNum);
        let asteroid = this.#createAsteroidMesh();
        let body = this.#setupAsteroidPhysics(asteroid, pos);

        asteroid.position.set(pos.x, pos.y, pos.z);
        asteroid.castShadow = true;
        asteroid.receiveShadow = true;
        EngineManager.scene.add(asteroid);

        this.asteroids.push(asteroid);

        PhysicsManager.physicsWorld.addRigidBody(body);
        asteroid.userData.physicsBody = body;

        PhysicsManager.rigidBodies.push(asteroid);
    }

    update () {
        this.asteroids.forEach(function(asteroid, index, object) {
            let resultantImpulse = new Ammo.btVector3(0, 0, 1);
            resultantImpulse.op_mul(this.astSpeed);
    
            let physicsBody = asteroid.userData.physicsBody;
            physicsBody.setLinearVelocity(resultantImpulse);
    
            if(asteroid.position.z > 10) {
                PhysicsManager.physicsWorld.removeRigidBody(asteroid.userData.physicsBody);
                EngineManager.scene.remove(asteroid);
                object.splice(index, 1);
            }
        }.bind(this));

        if(EngineManager.clock.getElapsedTime() > this.timeOfAstSpawn + this.astGen) {
            var randNum = Math.floor(Math.random() * 12);

            this.loadAsteroid(randNum);
            this.timeOfAstSpawn = EngineManager.clock.getElapsedTime();

            if(this.astGen > 0.11) {
                this.astGen -= 0.01;
            }
            if(this.astSpeed < 100) {
                this.astSpeed += 1;
            }
        } else if (this.timeOfAstSpawn == undefined) {
            this.timeOfAstSpawn = EngineManager.clock.getElapsedTime();
        }
    }
}

//Singleton
export default new AsteroidManager();

