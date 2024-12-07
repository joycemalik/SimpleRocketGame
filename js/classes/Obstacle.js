// js/classes/Obstacle.js

export default class Obstacle {
    constructor(canvas, image) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.image = image;
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (canvas.width - this.width) + this.width / 2;
        this.y = -this.height;
        this.speed = 3 + Math.random() * 3;
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
