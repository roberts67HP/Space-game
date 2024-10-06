import * as THREE from 'three';
import Ammo from 'ammojs-typed';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import skyBoxTex from '../assets/2k_stars_milky_way.jpg';

class EngineManager {
    //Is initalized in GameManager
    init () {
        this.scene = null; 
        this.controls = null; 
        this.camera = null; 
        this.renderer = null; 
        this.loader = null; 
        this.clock = null;

        this.setupGraphics();
        this.loadSkyBox();
    }

    //Gets called in GameManager
    kill () {
        this.scene.clear();

        // Reset the graphics
        this.renderer.renderLists.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }

    /**
     * Sets up a new 
     *  1) THREE.Scene
     *  2) THREE.PerspectiveCamera
     *  3) THREE.WebGLRenderer
     *  4) THREE.OrbitControls
     *  5) THREE.Clock.
     * The renderer is appended to the body of the HTML document.
     * The loader is a GLTFLoader for loading models.
     * The clock is a THREE.Clock for keeping track of time in the game loop.
     */
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

    /**
     * This sets up a skybox with a sun and adds it to the scene.
     * The skybox is a THREE.Mesh made of a THREE.SphereGeometry and a THREE.MeshStandardMaterial.
     * The material has a texture map loaded from a texture file.
     * The sphere is added to the scene.
     * The scene is also given an ambient light and a point light for the sun.
     * The point light has a shadow map. The light is added to the scene.
     */
    loadSkyBox () {
        var geometry = new THREE.SphereGeometry(500, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(skyBoxTex),
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

//Singleton
export default new EngineManager();