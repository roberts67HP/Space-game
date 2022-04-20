import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Ammo from 'ammojs-typed';
import astTex from '/assets/2k_moon.jpg';
import skyBoxTex from '/assets/2k_stars_milky_way.jpg';

const STATE = { DISABLE_DEACTIVATION : 4 }
let moveDirection = { left: 0, right: 0, forward: 0, back: 0 }

let physicsWorld, scene, controls, camera, renderer, loader, clock;
let rigidBodies = [], tmpTrans;

var ship;

var asteroids = [];
var timeOfAstSpawn = undefined;
var astGen = 1;
var astSpeed = 50;

var timeBeforeCrash = undefined;
var gameOver = false;
var gameOverShown = false;

function setupPhysicsWorld () {
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));
}
function setupGraphics () {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,10,25);
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xFFFFFF);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    loader = new GLTFLoader();
    loader.setCrossOrigin("anonymous");
    clock = new THREE.Clock();
}

function loadShip () {
    loader.load('/spaceship/scene.gltf', function (gltf) {
        let pos = {x: 0, y: -15, z: -5};
        let quat = {x: 1, y: 0, z: 0, w: 1};
        let mass = 1;
        
        ship = gltf.scene.children[0];
        ship.scale.set(0.4, 0.4, 0.4);
        scene.add(ship);

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );
    
        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 5 * 0.5, 6 * 0.5, 1 * 0.5 ) );
        colShape.setMargin( 0.05 );
    
        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );
    
        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );

        body.setFriction(4);
        body.setRollingFriction(10);
        body.setRestitution(0.6);
        body.setActivationState( STATE.DISABLE_DEACTIVATION )
    
        physicsWorld.addRigidBody(body);
        ship.userData.physicsBody = body;
        rigidBodies.push(ship);
    }, undefined, function (error) {
        console.error(error);
    });
}
function updateShip () {
    if(ship != null) {
        let scalingFactor = 60;

        let moveX = moveDirection.right - moveDirection.left;

        if((ship.position.x > 27 && moveX == 1) || (ship.position.x < -27 && moveX == -1))
            moveX = 0;

        let resultantImpulse = new Ammo.btVector3(moveX, 0, 0);
        resultantImpulse.op_mul(scalingFactor);

        let physicsBody = ship.userData.physicsBody;
        physicsBody.setLinearVelocity(resultantImpulse);
    }
}
function loadSkyBox () {
    var geometry = new THREE.SphereGeometry(500, 32, 32);
    var material = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(skyBoxTex),
        side: THREE.DoubleSide
    });
    var skysphere = new THREE.Mesh(geometry, material)
    scene.add(skysphere);

    var sunLight = new THREE.PointLight(0xffffff, 1, 0, 1);
    scene.add(new THREE.AmbientLight(0x404040));
    scene.add(sunLight);

    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = camera.near;
    sunLight.shadow.camera.far = camera.far;
}
function loadAsteroid (randNum) {
    randNum -= 6;
    
    let pos = {x: randNum * 5, y: -15, z: -130};
    let radius = 1;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    var asteroid = new THREE.Mesh(
        new THREE.SphereBufferGeometry(radius), 
        new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(astTex),
            metalness: 0
        })
    );

    asteroid.position.set(pos.x, pos.y, pos.z);
    asteroid.castShadow = true;
    asteroid.receiveShadow = true;
    scene.add(asteroid);
    asteroids.push(asteroid);

    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);
    body.setRestitution(0.6);
    body.setActivationState( STATE.DISABLE_DEACTIVATION );

    physicsWorld.addRigidBody(body);
    asteroid.userData.physicsBody = body;
    rigidBodies.push(asteroid);
}
function updateAsteroids () {
    asteroids.forEach(function(ast, index, object) {
        let resultantImpulse = new Ammo.btVector3(0, 0, 1);
        resultantImpulse.op_mul(astSpeed);

        let physicsBody = ast.userData.physicsBody;
        physicsBody.setLinearVelocity(resultantImpulse);

        if(ast.position.z > 10) {
            physicsWorld.removeRigidBody(ast.userData.physicsBody);
            scene.remove(ast);
            object.splice(index, 1);
        }
    });

    if(clock.getElapsedTime() > timeOfAstSpawn + astGen) {
        var randNum = Math.floor(Math.random() * 12);
        loadAsteroid(randNum);
        timeOfAstSpawn = clock.getElapsedTime();
        if(astGen > 0.15)
            astGen -= 0.01;
        if(astSpeed < 80)
            astSpeed += 1;
    } else if (timeOfAstSpawn == undefined) {
        timeOfAstSpawn = clock.getElapsedTime();
    }
}
function loadListeners () {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    window.addEventListener('keydown', function (event) {
        switch(event.key){
            case 'a':
                moveDirection.left = 1;
                break;
            case 'd':
                moveDirection.right = 1;
                break;
        }
    }, false);
    window.addEventListener('keyup', function (event) {
        switch(event.key){
            case 'a':
                moveDirection.left = 0;
                break;
            case 'd':
                moveDirection.right = 0;
                break;
        }
    }, false);
}
function detectCollision(){
	let dispatcher = physicsWorld.getDispatcher();
	let numManifolds = dispatcher.getNumManifolds();

    if(timeBeforeCrash != undefined && clock.getElapsedTime() > timeBeforeCrash + 1) {
        gameOver = true;
        return;
    } else if(numManifolds > 0)
        timeBeforeCrash = clock.getElapsedTime();
}
function updatePhysics(deltaTime){
	physicsWorld.stepSimulation( deltaTime, 10 );
	for ( let i = 0; i < rigidBodies.length; i++ ) {
		let objThree = rigidBodies[ i ];
		let objAmmo = objThree.userData.physicsBody;
		let ms = objAmmo.getMotionState();
		if ( ms ) {
			ms.getWorldTransform( tmpTrans );
			let p = tmpTrans.getOrigin();
			let q = tmpTrans.getRotation();
			objThree.position.set( p.x(), p.y(), p.z() );
			objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
		}
	}
	detectCollision();
}
function animate() {
    let deltaTime = clock.getDelta();
    if(!gameOver) {
        updateAsteroids();
        updateShip();
        updatePhysics(deltaTime);
        controls.update();
    } else {
        if(!gameOverShown) {
            alert("Game over. You lasted "+Math.round(clock.getElapsedTime())+" seconds.");
            gameOverShown = true;
        }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
Ammo(Ammo).then(() => {
    tmpTrans = new Ammo.btTransform();
    setupGraphics();
    setupPhysicsWorld();
    loadShip();
    loadSkyBox();
    loadListeners();
    animate();
});