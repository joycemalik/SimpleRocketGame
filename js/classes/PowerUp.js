// js/classes/PowerUp.js

export default class PowerUp {
    constructor(canvas, image, type) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.image = image;
        this.type = type; // e.g., 'score', 'shield', 'speed'
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width) + this.width / 2;
        this.y = -this.height;
        this.speed = 2 + Math.random();
        this.radius = this.width / 2;
    }

    draw() {
        this.ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    update() {
        this.y += this.speed;
        this.draw();
    }

    isOffScreen() {
        return this.y > this.canvas.height + this.height;
    }
}
