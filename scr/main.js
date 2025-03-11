import * as THREE from 'three';
import GUI from 'lil-gui'; 

import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ParticleSystem } from './particles.js'; // Import the particle system

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
// import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass.js';



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const room_length = 70;

const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.outputColorSpace = THREE.SRGBColorSpace; // Ensure correct color space
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const modelLoader = new GLTFLoader();


const composer = new EffectComposer(renderer);

// Main render pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const volumetricCones = [];
// const fxaaPass = new ShaderPass(FXAAShader);
// fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
// composer.addPass(fxaaPass);

// const lutPass = new LUTPass();
// composer.addPass(lutPass);





const gui = new GUI();
gui.close();

const loader = new TextureLoader();

scene.fog = new THREE.Fog("#270303", 2, 100);
const particleSystem = new ParticleSystem(scene, room_length);

// Ambient Light
const ambientLight = new THREE.AmbientLight("#808080", 2);
scene.add(ambientLight);
// GUI Controls
const ambientLightFolder = gui.addFolder("Ambient Light");

ambientLightFolder.addColor({ color: ambientLight.color.getHex() }, "color")
    .onChange(value => ambientLight.color.set(value));

ambientLightFolder.add(ambientLight, "intensity", 0, 20, 0.1); // Adjust intensity range

ambientLightFolder.open();


for(let i=1; i<=6; i++){

    const color = i % 2 === 0 ? "red" : "blue";
    const light = new THREE.PointLight(color, 50, 100);
    light.castShadow = true;
    
    light.position.set(0, 2.5, -10 * i); // Slightly below the ceiling
    scene.add(light);

    const spotLight = new THREE.SpotLight( i % 2 === 0 ?"#FF5252":"#3D6FE2", 40, 50, Math.PI / 4, 1, 1);
    spotLight.position.set(0, 4, -10 * i);
    spotLight.target.position.set(0, 4.5, -10 * i);
    scene.add(spotLight);
    scene.add(spotLight.target);


    // Flickering effect (optional)
    setInterval(() => {
        light.intensity = 50 + Math.random() * 0.5; // Random slight flicker
        spotLight.intensity = 50 + Math.random() * 5;
    }, 100);
}


const texture = loader.load('texture/white-wall-textures.jpg'); // Replace with your image path
texture.wrapS = THREE.RepeatWrapping; // Repeat horizontally
texture.wrapT = THREE.RepeatWrapping; // Repeat vertically
// Base repeat unit (tiles per 10 units, assuming texture is square)
const baseRepeat = 1; // 1 tile per 10 units (adjust based on texture resolution)

// Side walls (70x10): 7 tiles wide, 1 tile high
texture.repeat.set(room_length / 10 * baseRepeat, 1 * baseRepeat); // 7, 1

// Wall Material
const wallMaterial = new THREE.MeshStandardMaterial({  map: texture, color: "#FFFBD1" });

// Left Wall (Plane)
const wallGeometry = new THREE.PlaneGeometry(room_length, 10); // Width (z) = 70, Height (y)
const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.position.x = -10;
leftWall.position.z = -room_length / 2; // Center at z = -35
leftWall.rotation.y = Math.PI / 2; // Face inward
leftWall.receiveShadow = true;
scene.add(leftWall);

// Right Wall (Plane)
const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.position.x = 10;
rightWall.position.z = -room_length / 2; // Center at z = -35
rightWall.rotation.y = -Math.PI / 2; // Face inward
rightWall.receiveShadow = true;
scene.add(rightWall);

// Back Wall (Plane)

const backWallGeometry = new THREE.PlaneGeometry(20, 10); // Width (x), Height (y)
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.z = -room_length; // At z = -70
backWall.receiveShadow = true;
scene.add(backWall);

// Floor and Ceiling

const floor_texture = loader.load('texture/floor.jpg'); // Replace with your image path
floor_texture.wrapS = THREE.RepeatWrapping; // Repeat horizontally
floor_texture.wrapT = THREE.RepeatWrapping; // Repeat vertically
floor_texture.repeat.set(room_length / 10 * baseRepeat, 1 * baseRepeat); // 7, 1

const floorGeometry = new THREE.PlaneGeometry(20, room_length); // Width (x) = 20, Depth (z) = 70
const floorMaterial = new THREE.MeshStandardMaterial({ map: floor_texture, color: "#CDAB79"});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -5;
floor.position.z = -room_length / 2; // Center at z = -35
floor.receiveShadow = true;
scene.add(floor);


const ceilingMaterial = new THREE.MeshPhysicalMaterial({
    map: texture,  color: "#FFFBD1",
    //roughness: 0.1, // Makes it slightly glossy
    metalness: 0.5, // Reflects some light
});
const ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 5;
ceiling.position.z = -room_length / 2; // Center at z = -35
scene.add(ceiling);


// Paintings
const paintings = [
    { title: "Mona Lisa", img: "images/img1.jpg", details: "here are some details<br>im the hero", date: "17th Oct, 1923" },
    { title: "Cristiano Ronaldo", img: "images/img2.jpg", details: "A beautiful starry night painting.", date: "3rd July, 1998" },
    { title: "Cristiano Ronaldo", img: "images/img2.jpg", details: "The famous scream by Edvard Munch.", date: "21st Dec, 1951" },
    { title: "Mona Lisa", img: "images/img1.jpg", details: "A reimagining of Mona Lisa.", date: "5th Feb, 1985" },
    { title: "Starry Night", img: "images/img1.jpg", details: "Another take on Starry Night.", date: "28th March, 1972" },
    { title: "The Scream", img: "images/img1.jpg", details: "An expressionist masterpiece.", date: "14th August, 1964" }
  ];



function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 256;  
    canvas.height = 64;  

    // Remove background fill to keep transparency

    ctx.font = 'bold 30px "Inter", "Arial", sans-serif';  
    ctx.fillStyle = '#000000';   // Text color
    ctx.textAlign = 'center';  
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 10); 

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true; 
    texture.transparent = true; // Enable transparency

    return texture;
}

// Store paintings for raycasting
const paintingMeshes = [];

let i = 0;
paintings.forEach((paintingData) => {
    var pos = i%2==0 ?-25 + i*4 : 0+i*4;
    let currentI = i; // Capture i for this iteration
 
    const image = new Image();
    image.src = paintingData.img;
    image.onload = function() {
        // Get the image width and height
        const aspectRatio = image.width / image.height;
        
        const maxSize = 4; // Max dimension (width or height)

        // Calculate dimensions to maintain aspect ratio
        let width, height;
        if (aspectRatio > 1) {
            // Wide image (width > height)
            width = maxSize;
            height = maxSize / aspectRatio;
        } else {
            // Tall or square image (height >= width)
            height = maxSize;
            width = maxSize * aspectRatio;
        }
        
        const paintingGeometry = new THREE.PlaneGeometry(width, height);
        const texture = loader.load(paintingData.img);
    
        const material = new THREE.MeshStandardMaterial({ map: texture });
        const painting = new THREE.Mesh(paintingGeometry, material);
        painting.receiveShadow = true;
        painting.position.set(pos, 0, 0.2); // Local: just inside, spaced along z
        currentI % 2 === 0 ? leftWall.add(painting) : rightWall.add(painting); // Use captured i
        paintingMeshes.push(painting);

        // Frame with Textures
        const frameThickness = 0.2; // Width of the frame border
        const frameDepth = 0.2;     // Depth of the frame (front to back)
        const outerWidth = width + frameThickness * 2;
        const outerHeight = height + frameThickness * 2;
        const innerWidth = width;
        const innerHeight = height;

        const shape = new THREE.Shape();
        // Outer rectangle
        shape.moveTo(-outerWidth / 2, -outerHeight / 2);
        shape.lineTo(outerWidth / 2, -outerHeight / 2);
        shape.lineTo(outerWidth / 2, outerHeight / 2);
        shape.lineTo(-outerWidth / 2, outerHeight / 2);
        shape.lineTo(-outerWidth / 2, -outerHeight / 2);

        // Inner rectangle (hole)
        const hole = new THREE.Path();
        hole.moveTo(-innerWidth / 2, -innerHeight / 2);
        hole.lineTo(innerWidth / 2, -innerHeight / 2);
        hole.lineTo(innerWidth / 2, innerHeight / 2);
        hole.lineTo(-innerWidth / 2, innerHeight / 2);
        hole.lineTo(-innerWidth / 2, -innerHeight / 2);
        shape.holes.push(hole);

        const extrudeSettings = { depth: frameDepth, bevelEnabled: false };
        const frameGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const frameDiffuse = loader.load('texture/wood_diffuse.jpg'); // Diffuse (color) map
        const frameNormal = loader.load('texture/wood_normal.jpg');   // Normal map
        const frameRoughness = loader.load('texture/wood_roughness.jpg'); // Roughness map

        frameDiffuse.wrapS = frameDiffuse.wrapT = THREE.RepeatWrapping;
        frameNormal.wrapS = frameNormal.wrapT = THREE.RepeatWrapping;
        frameRoughness.wrapS = frameRoughness.wrapT = THREE.RepeatWrapping;
        frameDiffuse.repeat.set(1, 1); // Adjust repeat as needed
        frameNormal.repeat.set(1, 1);
        frameRoughness.repeat.set(1, 1);

        const frameMaterial = new THREE.MeshStandardMaterial({
            map: frameDiffuse,           // Base color texture
            normalMap: frameNormal,      // Surface detail
            roughnessMap: frameRoughness, // Roughness texture
            roughness: 0.7,              // Base roughness if no map
            metalness: 0.1              // Slight metalness for realism
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(pos, 0, 0.1);
        frame.castShadow = true; // Cast shadows
        frame.receiveShadow = true; // Receive shadows
        currentI % 2 === 0 ? leftWall.add(frame) : rightWall.add(frame);

    };
    

    let spotLight = new THREE.SpotLight( "#FFEDCB", 35, 50, Math.PI /18, 1, 1);
    spotLight.position.set(i%2==0 ?10:-10, -5, i%2==0 ?pos-1:-pos-11);
    spotLight.target.position.set(i%2==0 ?-5:5, -1.3, i%2==0 ?pos-1:-pos-11);
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);
    // const spotLightHelper = new THREE.SpotLightHelper(spotLight1, 0x00ff00); // Green cone
    // scene.add(spotLightHelper);


   // Create a plane for text
    const textTexture = createTextTexture(paintingData.date);
    const textMaterial = new THREE.MeshBasicMaterial({ 
        map: textTexture, 
        transparent: true,  // Allow transparency
    });
    const textGeometry = new THREE.PlaneGeometry(4, 1);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Position the text below the image
    textMesh.position.set(pos, -2.5, 0.1);
    i%2==0?leftWall.add(textMesh):rightWall.add(textMesh);
    i++;
});

// function loadModel( x=0, y=-5.2, z=0 ) {
//     modelLoader.load('/model/vase.glb', function (gltf) {
//         const model = gltf.scene;
//         // Set position
//         model.position.set(x,y,z);
//         // Set scale
//         model.scale.set(3,3,3);
//         // Enable shadows
//         model.castShadow =  true;
//         model.receiveShadow = true;
//         // Add to scene
//         scene.add(model);
//     }, undefined, function (error) {
//         console.error("Error loading model:", error);
//     });
// }
// loadModel( 9, -4.2,-15);
// loadModel(-9, -5.2, -18)



// Camera Initial Position
let initialCameraPos = new THREE.Vector3(0, 0, 0);
camera.position.copy(initialCameraPos);

// Raycaster for Click Detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// HTML Overlay for Details
const detailsDiv = document.createElement('div');
detailsDiv.classList.add('details-div'); // Add the CSS class
document.body.appendChild(detailsDiv);
detailsDiv.style.display = 'none';

// Go Back Button
const goBackButton = document.createElement('button');
goBackButton.classList.add('go-back-btn');
goBackButton.textContent = 'Go Back';

document.body.appendChild(goBackButton);


// Camera Animation State
let targetCameraPos = null;
let targetCameraLookAt = null;
let animationProgress = 0;
const animationSpeed = 0.01;

// Click Handler
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(paintingMeshes);
    if (intersects.length > 0) {
        initialCameraPos = camera.position.clone();
        const painting = intersects[0].object;

        const paintingData = paintings[paintingMeshes.indexOf(painting)];

        // Calculate world position of painting
        const paintingWorldPos = new THREE.Vector3();
        painting.getWorldPosition(paintingWorldPos);

        // Target camera position: 5 units in front of painting
        const wallNormal = painting.parent === leftWall ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-1, 0, 0);
        targetCameraPos = paintingWorldPos.clone().add(wallNormal.multiplyScalar(6.5));
        targetCameraPos.y = 0; // Keep camera at eye level

        // Target look-at: center of painting
        targetCameraLookAt = paintingWorldPos.clone();

        // Show details
        console.log(painting);
        detailsDiv.innerHTML = `
            <h2>${paintingData.title}</h2>
            <p>${paintingData.details || "No details available."}</p>
        `;
        detailsDiv.style.display = 'block';
        goBackButton.style.display = 'block';

        animationProgress = 0; // Start animation
    }
});

// Go Back Handler
goBackButton.addEventListener('click', () => {
    targetCameraPos = initialCameraPos.clone();
    targetCameraLookAt = new THREE.Vector3(0, 0, -room_length);

    detailsDiv.style.display = 'none';
    goBackButton.style.display = 'none';
    animationProgress = 0;
});

camera.position.z = 1;

const moveSpeed = 0.5; 
// Keyboard controls
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            camera.position.z -= moveSpeed; // Move forward (negative z)
            break;
        case 'ArrowDown': // Optional: move backward
            camera.position.z += moveSpeed;
            break;
    }
});

// Scroll controls
window.addEventListener('wheel', (event) => {
    // event.deltaY > 0 means scrolling down, < 0 means scrolling up
    camera.position.z += event.deltaY * 0.01; // Adjust multiplier for sensitivity
    // Negative z moves forward, so scrolling up (deltaY < 0) decreases z
});

window.addEventListener('resize', ()=>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix();
  })

function animate() {
    window.requestAnimationFrame(animate);
    
    // Animate camera if target exists
    if (targetCameraPos && targetCameraLookAt) {
        animationProgress += animationSpeed;
        if (animationProgress <= 1) {
            //Interpolate position
            camera.position.lerp(targetCameraPos, animationProgress);

            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle( camera.up, Math.PI / 2 );
            camera.applyQuaternion(quaternion);
            camera.lookAt(targetCameraLookAt);

        } else {
            camera.position.copy(targetCameraPos);
            camera.lookAt(targetCameraLookAt);
            targetCameraPos = 0
            targetCameraLookAt = 0
            animationProgress = 1; // Lock at end
        }
    }
    particleSystem.update();


    composer.render();
	//renderer.render( scene, camera );
}
animate();