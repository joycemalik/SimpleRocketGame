// js/classes/Rocket.js

import { detectCollision } from '../utils/Collision.js';

export default class Rocket {
    constructor(canvas, images, sounds, input) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.image = images.rocket;
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
        this.input = input;
        this.sounds = sounds;
        this.radius = this.width / 2;
        this.isThrusting = false;
        this.rotation = 0;

        console.log('Rocket initialized at position:', this.x, this.y);
    }

    draw() {
        if (!this.image.complete) {
            console.warn('Rocket image not loaded yet.');
            return;
        }

        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.restore();

        // Debugging: Confirm drawing
        // console.log('Rocket drawn at:', this.x, this.y);
    }

    update() {
        this.isThrusting = false;

        if (this.input.isKeyPressed('w')) {
            this.y -= this.speed;
            this.isThrusting = true;
        }
        if (this.input.isKeyPressed('s')) {
            this.y += this.speed;
            this.isThrusting = true;
        }
        if (this.input.isKeyPressed('a')) {
            this.x -= this.speed;
            this.rotation = -0.05; // Slight rotation for visual effect
            this.isThrusting = true;
        }
        if (this.input.isKeyPressed('d')) {
            this.x += this.speed;
            this.rotation = 0.05; // Slight rotation for visual effect
            this.isThrusting = true;
        }

        if (!this.input.isKeyPressed('a') && !this.input.isKeyPressed('d')) {
            this.rotation = 0; // Reset rotation when not moving sideways
        }

        // Boundary checks
        if (this.x < this.radius) this.x = this.radius;
        if (this.x > this.canvas.width - this.radius) this.x = this.canvas.width - this.radius;
        if (this.y < this.radius) this.y = this.radius;
        if (this.y > this.canvas.height - this.radius) this.y = this.canvas.height - this.radius;

        // Play or pause thrust sound
        if (this.isThrusting && !this.sounds.thrustSound.paused) {
            // Already playing
        } else if (this.isThrusting) {
            this.sounds.thrustSound.currentTime = 0;
            this.sounds.thrustSound.play().catch(error => {
                console.error('Thrust sound playback failed:', error);
            });
        } else {
            this.sounds.thrustSound.pause();
        }

        this.draw();

        // Debugging: Log position
        // console.log('Rocket position:', this.x, this.y);
    }
}
