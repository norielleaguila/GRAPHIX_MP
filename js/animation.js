'use strict';

/* SCENE VARIABLES */
var scene,
camera, FOV, aspectRatio, near, far, LOCAL_HEIGHT, LOCAL_WIDTH,
renderer, container;

/* SCENE OBJECTS */
var cloudArray = [];

/* LIGHTING */
var ambientLight, hemisphereLight, shadowLight;

var sea;
var sky;

/* COLOR PALETTES */
var colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0,
};

// ends the game
var done = false;

// 45 degrees in radians
var theta = 45 / 180 * Math.PI;

// const. distance between sea and clouds
var clearance = 200;

var plane = [];

window.addEventListener('load', init, false);

function init() {
    // set up the scene, the camera and the renderer
    createScene();

    // add the lights
    createLights();

    // add the objects
    createSea();
    createSky();

    // var axesHelper = new THREE.AxesHelper( 1000 );
    // scene.add( axesHelper );

    // start a loop that will update the objects' positions
    // and render the scene on each frame
    loop();
}

function createScene() {
    LOCAL_HEIGHT = window.innerHeight;
    LOCAL_WIDTH = window.innerWidth;

    scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0xf7ddc0, 100, 950);

    // Create the camera
    aspectRatio = LOCAL_WIDTH / LOCAL_HEIGHT;
    FOV = 60;
    near = 1;
    far = 10000;
    camera = new THREE.PerspectiveCamera(FOV, aspectRatio, near, far);

    camera.position.set(0, 100, 200);
    // camera.position.set(0, -600, 2000);


    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setSize(LOCAL_WIDTH, LOCAL_HEIGHT);
    renderer.shadowMap.enabled = true;

    container = document.getElementById('playzone');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    // update height and width of the renderer and the camera
    LOCAL_HEIGHT = window.innerHeight;
    LOCAL_WIDTH = window.innerWidth;
    renderer.setSize(LOCAL_WIDTH, LOCAL_HEIGHT);
    camera.aspect = LOCAL_WIDTH / LOCAL_HEIGHT;
    camera.updateProjectionMatrix();
}

function createLights() {
    ambientLight = new THREE.AmbientLight(0xdc8874, .5);

    // gradient: sky to ground
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);

    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    scene.add(ambientLight);
    scene.add(hemisphereLight);
    scene.add(shadowLight);
}

var temp;

function createPlane(){

    var objLoader = new THREE.OBJLoader();
    var material = new THREE.MeshLambertMaterial({
        color: '#fff'
    });

    objLoader.load(
        'obj/plane.obj',
        function (obj) {
            obj.traverse(function (child) {

                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }

            });

            // camera.position.set(0, -600, 2000);

            obj.scale.set(50, 50, 50);

            obj.position.y = 50;
            obj.position.x = 0;

            obj.position.z = 100;

            obj.rotation.z = Math.random() * 30 * Math.PI / 180;

            obj.rotation.x = 10 / 180 * Math.PI;

            if(Math.random() * 10 < 6)
                obj.rotation.z *= -1;

            console.log(obj.position);

            scene.add(obj);

            plane.push(obj);

            temp = obj;
        },
        // called when loading is in progresses
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        }
    );
}

function Sea(){
    // create the geometry (shape) of the cylinder;
    // the parameters are:
    // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
    // var geom = new THREE.CylinderGeometry(700,600,500,40,10);
    var geom = new THREE.CylinderGeometry(600,600,800,40,10);

    // rotate the geometry on the z axis
    geom.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/2));

    // important: by merging vertices we ensure the continuity of the waves
    geom.mergeVertices();

    // get the vertices
    var l = geom.vertices.length;

    // stores data associated w/ each vertex
    this.waves = [];

    for (var i=0; i<l; i++){
        // get each vertex
        var v = geom.vertices[i];

        // store some data associated to it
        this.waves.push({y:v.y,
            x:v.x,
            z:v.z,
            // a random angle
            ang:Math.random()*Math.PI*2,
            // a random distance
            amp:5 + Math.random()*30,
            // a random speed between 0.016 and 0.048 radians / frame
            speed:0.016 + Math.random()*0.032
        });
    };

    // create the material
    var mat = new THREE.MeshPhongMaterial({
        color:colors.blue,
        transparent:true,
        opacity:0.9,
        flatShading:true
    });

    // To create an object in Three.js, we have to create a mesh
    // which is a combination of a geometry and some material
    this.mesh = new THREE.Mesh(geom, mat);

    // Allow the sea to receive shadows
    this.mesh.receiveShadow = true;
}

Sea.prototype.moveWaves = function (){

    // get the vertices
    var verts = this.mesh.geometry.vertices;
    var l = verts.length;

    for (var i=0; i<l; i++){
        var v = verts[i];

        // get the data associated to it
        var vprops = this.waves[i];

        // update the position of the vertex
        v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
        v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;

        // increment the angle for the next frame
        vprops.ang += vprops.speed;

    }

    this.mesh.geometry.verticesNeedUpdate=true;
}

function createSea(){
    sea = new Sea();

    // push it a little bit at the bottom of the scene
    sea.mesh.position.y = -600;

    // add the mesh of the sea to the scene
    scene.add(sea.mesh);
}

function Cloud(){
    // Create an empty container that will hold the different parts of the cloud
    this.mesh = new THREE.Object3D();

    // create a cube geometry;
    // this shape will be duplicated to create the cloud
    var geom = new THREE.BoxGeometry(20,20,20);
    // var geom = new THREE.IcosahedronGeometry(20,0);

    // create a material; a simple white material will do the trick
    var mat = new THREE.MeshPhongMaterial({
        color:colors.white,
        opacity:.8
    });

    // duplicate the geometry a random number of times
    var nBlocs = 4 + Math.floor(Math.random() * 3);
    for (var i=0; i<nBlocs; i++ ){

        // create the mesh by cloning the geometry
        var m = new THREE.Mesh(geom, mat);

        // set the position and the rotation of each cube randomly
        m.position.x = i*15;
        m.position.y = Math.random()*15;
        m.position.z = Math.random()*10;
        m.rotation.z = Math.random()*Math.PI*2;
        m.rotation.y = Math.random()*Math.PI*2;

        // set the size of the cube randomly
        var s = .6 + Math.random()*.9;
        m.scale.set(s,s,s);

        // allow each cube to cast and to receive shadows
        m.castShadow = true;
        m.receiveShadow = true;

        // add the cube to the container we first created
        this.mesh.add(m);
    }
}

function Sky(){
    // Create an empty container
    this.mesh = new THREE.Object3D();

    // choose a number of clouds to be scattered in the sky
    this.nClouds = 40;

    // To distribute the clouds consistently,
    // we need to place them according to a uniform angle
    var stepAngle = Math.PI*2 / this.nClouds;

    // create the clouds
    for(var i=0; i<this.nClouds; i++){
        var c = new Cloud();

        var thetaP = theta * (i % 8);
        var dist =  600 + Math.random() * 250 + clearance;

        var posY = Math.sin(thetaP) * dist;
        var posX = Math.cos(thetaP) * dist;

        posX -= Math.random() * 225 + Math.random() * 450;

        if(posX >= 0 && posY >= 0){  // Quadrant I
            posY += clearance;
        }
        else if(posX < 0 && posY > 0){  // Quadrant II
            posY += clearance;
        }
        else if(posX < 0 && posY < 0){  // Quadrant III
            while(posY > -1200)
            posY = posY - Math.random() * 150;

            posY -= clearance;
        }
        else if(posX > 0 && posY < 0){  // Quadrant IV
            while(posY > -1200)
            posY = posY - Math.random() * 150;

            posY -= clearance;
        }

        var tan = FOV / 2 * Math.PI / 180;
        var h = tan * near;
        var w = h * aspectRatio;
        var right = w * far / 2;
        var left = right * -1;

        console.log(left, right);

        c.mesh.position.y = posY;
        c.mesh.position.x = posX;

        var posZ = Math.random() * 100 * Math.random() * 25;

        var choose = Math.random() * 10;

        if(choose < 5)
        c.mesh.position.z = -1 * posZ;
        else
        c.mesh.position.z = posZ;

        // console.log(c.mesh.position);

        // we also set a random scale for each cloud
        var s = 1+Math.random()*2;
        c.mesh.scale.set(s,s,s);

        cloudArray.push(c);

        // do not forget to add the mesh of each cloud in the scene
        this.mesh.add(c.mesh);
    }
}

// Now we instantiate the sky and push its center a bit
// towards the bottom of the screen

function createSky(){
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
}

var inf = 0;

function loop(){
    sea.mesh.rotation.x += .0075;
    sky.mesh.rotation.x += .005;

    sea.moveWaves();

    if($("#score").text() != "" && !done){
        done = true;
        createPlane();
    }

    inf++;

    if(plane.length > 0){
        plane[0].position.z -= 10;
        plane[0].position.y -= 1 + (inf / 250);
        plane[0].rotation.x -= 0.005;
    }

    // render the scene
    renderer.render(scene, camera);

    // call the loop function again
    requestAnimationFrame(loop);
}
