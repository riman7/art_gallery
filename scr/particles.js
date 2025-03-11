// particles.js
import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene, roomLength) {
        this.scene = scene;
        this.roomLength = roomLength;
        this.particleCount = 1000;

        this.particles = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount * 3; i += 3) {
            this.positions[i] = Math.random() * 20 - 10; // x
            this.positions[i + 1] = Math.random() * 10 - 5; // y
            this.positions[i + 2] = Math.random() * -this.roomLength; // z

            this.velocities[i] = (Math.random() - 0.5) * 0.02;
            this.velocities[i + 1] = (Math.random() - 0.5) * 0.02;
            this.velocities[i + 2] = (Math.random() - 0.5) * 0.02;
        }

        this.particles.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        const particleMaterial = new THREE.PointsMaterial({ 
            color: "#F9DE13", 
            size: 0.03, // Increased size slightly for visibility
            transparent: true,
            sizeAttenuation: true, // Keep attenuation but adjust base size
            opacity: 0.15, // Increased opacity for better visibility up close
            depthTest: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending // Softer blending for dust-like effect
        });
        this.particleSystem = new THREE.Points(this.particles, particleMaterial);
        this.scene.add(this.particleSystem);
    }

    update() { // Removed camera parameter since we’re not using it yet
        const positions = this.particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < this.particleCount * 3; i += 3) {
            positions[i] += this.velocities[i];
            positions[i + 1] += this.velocities[i + 1];
            positions[i + 2] += this.velocities[i + 2];

            this.velocities[i] += (Math.random() - 0.5) * 0.001;
            this.velocities[i + 1] += (Math.random() - 0.5) * 0.001;
            this.velocities[i + 2] += (Math.random() - 0.5) * 0.001;

            this.velocities[i] = Math.max(Math.min(this.velocities[i], 0.02), -0.02);
            this.velocities[i + 1] = Math.max(Math.min(this.velocities[i + 1], 0.02), -0.02);
            this.velocities[i + 2] = Math.max(Math.min(this.velocities[i + 2], 0.02), -0.02);

            if (positions[i] < -10) positions[i] = -10, this.velocities[i] *= -1;
            if (positions[i] > 10) positions[i] = 10, this.velocities[i] *= -1;
            if (positions[i + 1] < -5) positions[i + 1] = -5, this.velocities[i + 1] *= -1;
            if (positions[i + 1] > 5) positions[i + 1] = 5, this.velocities[i + 1] *= -1;
            if (positions[i + 2] < -this.roomLength) positions[i + 2] = -this.roomLength, this.velocities[i + 2] *= -1;
            if (positions[i + 2] > 0) positions[i + 2] = 0, this.velocities[i + 2] *= -1;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
}