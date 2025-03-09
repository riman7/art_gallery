import * as THREE from 'three';

import { TextureLoader } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new TextureLoader();

scene.fog = new THREE.Fog(0x000000, 2, 120);

// Ambient Light
const ambientLight = new THREE.AmbientLight("#808080", 0.4);
scene.add(ambientLight);

const room_length = 70;

for(let i=1; i<=6; i++){

    const color = i % 2 === 0 ? "red" : "blue";
    const light = new THREE.PointLight(color, 50, 100);
    
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


let spotLight1 = new THREE.SpotLight( "#FFF4DF", 50, 50, Math.PI /18, 1, 1);
spotLight1.position.set(10, -5, -10);
spotLight1.target.position.set(-5, -1.3, -10.1);
scene.add(spotLight1);
scene.add(spotLight1.target);

const texture = loader.load('./public/texture/white-wall-textures.jpg'); // Replace with your image path
texture.wrapS = THREE.RepeatWrapping; // Repeat horizontally
texture.wrapT = THREE.RepeatWrapping; // Repeat vertically
// Base repeat unit (tiles per 10 units, assuming texture is square)
const baseRepeat = 1; // 1 tile per 10 units (adjust based on texture resolution)

// Side walls (70x10): 7 tiles wide, 1 tile high
texture.repeat.set(room_length / 10 * baseRepeat, 1 * baseRepeat); // 7, 1

// Wall Material
const wallMaterial = new THREE.MeshStandardMaterial({  map: texture, side: THREE.DoubleSide });

// Left Wall (Plane)
const wallGeometry = new THREE.PlaneGeometry(room_length, 10); // Width (z) = 70, Height (y)
const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.position.x = -10;
leftWall.position.z = -room_length / 2; // Center at z = -35
leftWall.rotation.y = Math.PI / 2; // Face inward
scene.add(leftWall);

// Right Wall (Plane)
const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.position.x = 10;
rightWall.position.z = -room_length / 2; // Center at z = -35
rightWall.rotation.y = -Math.PI / 2; // Face inward
scene.add(rightWall);

// Back Wall (Plane)

const backWallGeometry = new THREE.PlaneGeometry(20, 10); // Width (x), Height (y)
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.z = -room_length; // At z = -70
scene.add(backWall);

// Floor and Ceiling

const floor_texture = loader.load('./public/texture/floor.jpg'); // Replace with your image path
floor_texture.wrapS = THREE.RepeatWrapping; // Repeat horizontally
floor_texture.wrapT = THREE.RepeatWrapping; // Repeat vertically
floor_texture.repeat.set(room_length / 10 * baseRepeat, 1 * baseRepeat); // 7, 1

const floorGeometry = new THREE.PlaneGeometry(20, room_length); // Width (x) = 20, Depth (z) = 70
const floorMaterial = new THREE.MeshStandardMaterial({ map: floor_texture, side: THREE.DoubleSide});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -5;
floor.position.z = -room_length / 2; // Center at z = -35
scene.add(floor);


const ceilingMaterial = new THREE.MeshPhysicalMaterial({
    map: texture,
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
    { title: "1Mona Lisa", img: "./public/images/img1.jpg" },
    { title: "2Starry Night", img: "./public/images/img1.jpg" },
    { title: "3The Scream", img: "./public/images/img1.jpg" },
    { title: "4Mona Lisa", img: "./public/images/img1.jpg" },
    { title: "5Starry Night", img: "./public/images/img1.jpg" },
    { title: "6The Scream", img: "./public/images/img1.jpg" }
];
const paintingGeometry = new THREE.PlaneGeometry(4, 4);

function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 256;  
    canvas.height = 64;  

    // Remove background fill to keep transparency

    ctx.font = '30px Arial';  
    ctx.fillStyle = 'black';   // Text color
    ctx.textAlign = 'center';  
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 10); 

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true; 
    texture.transparent = true; // Enable transparency

    return texture;
}




// Store paintings for raycasting
const paintingMeshes = [];
// Left Wall Paintings
let i = 0;
paintings.forEach((paintingData) => {
    const texture = loader.load(paintingData.img);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const painting = new THREE.Mesh(paintingGeometry, material);
    var pos = i%2==0 ?-25 + i*4 : 0+i*4;
    painting.position.set(pos, 0, 0.1); // Local: just inside, spaced along z
    i%2==0?leftWall.add(painting):rightWall.add(painting);
    paintingMeshes.push(painting);

   // Create a plane for text
    const textTexture = createTextTexture(paintingData.title);
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


// Camera Initial Position
let initialCameraPos = new THREE.Vector3(0, 0, 0);
camera.position.copy(initialCameraPos);

// Raycaster for Click Detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// HTML Overlay for Details
const detailsDiv = document.createElement('div');
detailsDiv.style.position = 'absolute';
detailsDiv.style.top = '20px';
detailsDiv.style.left = '20px';
detailsDiv.style.background = 'rgba(0, 0, 0, 0.8)';
detailsDiv.style.color = 'white';
detailsDiv.style.padding = '10px';
detailsDiv.style.display = 'none';
document.body.appendChild(detailsDiv);

// Go Back Button
const goBackButton = document.createElement('button');
goBackButton.textContent = 'Go Back';
goBackButton.style.position = 'absolute';
goBackButton.style.bottom = '20px';
goBackButton.style.left = '20px';
goBackButton.style.padding = '10px';
goBackButton.style.display = 'none';
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
        detailsDiv.innerHTML = `<h2>${painting.userData.title}dddd</h2><p>${painting.userData.details}ddd</p>`;
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

camera.position.z = 2;

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
        console.log("targetpos"+targetCameraPos);
        console.log("targetlookat"+targetCameraLookAt);
        animationProgress += animationSpeed;
        if (animationProgress <= 1) {
            console.log("animationPregress"+animationProgress)
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

	renderer.render( scene, camera );
}
animate();