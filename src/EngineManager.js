import * as THREE from 'three';
import Ammo from 'ammojs-typed';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import skyBoxTex from '../assets/2k_stars_milky_way.jpg';

class EngineManager {
    constructor () {
        this.physicsWorld = null; 
        this.scene = null; 
        this.controls = null; 
        this.camera = null; 
        this.renderer = null; 
        this.loader = null; 
        this.clock = null;

        this.initalized = false;
    }

    init () {
        if(!this.initalized) {
            this.setupPhysicsWorld();
            this.setupGraphics();
            this.loadSkyBox();

            this.initalized = true;
        }
    }

    setupPhysicsWorld () {
        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();
    
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
            dispatcher, 
            overlappingPairCache, 
            solver,
            collisionConfiguration);
        this.physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));
    }
    setupGraphics () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0,10,25);
        
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
    
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
        this.loader = new GLTFLoader();
        this.loader.setCrossOrigin("anonymous");
        this.clock = new THREE.Clock();
    }

    loadSkyBox () {
        var geometry = new THREE.SphereGeometry(500, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(skyBoxTex, (texture) => {
                console.log('Texture loaded:', texture);
            }),
            side: THREE.DoubleSide
        });

        var skysphere = new THREE.Mesh(geometry, material);

        this.scene.add(skysphere);
    
        var sunLight = new THREE.PointLight(0xffffff, 1, 0, 1);

        this.scene.add(new THREE.AmbientLight(0x404040));
        this.scene.add(sunLight);
    
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = this.camera.near;
        sunLight.shadow.camera.far = this.camera.far;
    }

    render () {
        this.renderer.render(
            this.scene, 
            this.camera
        );
    }
}

export default new EngineManager();