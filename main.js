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


// let spotLight1 = new THREE.SpotLight( "#FFF4DF", 50, 50, Math.PI /18, 1, 1);
// spotLight1.position.set(10, -5, -10);
// spotLight1.target.position.set(-5, -1.3, -10.1);
// scene.add(spotLight1);
// scene.add(spotLight1.target);

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
const floorMaterial = new THREE.MeshStandardMaterial({ map: floor_texture});
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
    { title: "Mona Lisa", img: "./public/images/img1.jpg", details: "here are some details<br>im the hero", date: "17th Oct, 1923" },
    { title: "Cristiano Ronaldo", img: "./public/images/img2.jpg", details: "A beautiful starry night painting.", date: "3rd July, 1998" },
    { title: "Cristiano Ronaldo", img: "./public/images/img2.jpg", details: "The famous scream by Edvard Munch.", date: "21st Dec, 1951" },
    { title: "Mona Lisa", img: "./public/images/img1.jpg", details: "A reimagining of Mona Lisa.", date: "5th Feb, 1985" },
    { title: "Starry Night", img: "./public/images/img1.jpg", details: "Another take on Starry Night.", date: "28th March, 1972" },
    { title: "The Scream", img: "./public/images/img1.jpg", details: "An expressionist masterpiece.", date: "14th August, 1964" }
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
        painting.position.set(pos, 0, 0.1); // Local: just inside, spaced along z
        i%2==0?leftWall.add(painting):rightWall.add(painting);
        paintingMeshes.push(painting);
    };
    

    let spotLight1 = new THREE.SpotLight( "#FFEDCB", 35, 50, Math.PI /18, 1, 1);
    spotLight1.position.set(i%2==0 ?10:-10, -5, i%2==0 ?pos-1:-pos-11);
    spotLight1.target.position.set(i%2==0 ?-5:5, -1.3, i%2==0 ?pos-1:-pos-11);
    scene.add(spotLight1);
    scene.add(spotLight1.target);
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
        //detailsDiv.classList.add('visible');
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

	renderer.render( scene, camera );
}
animate();