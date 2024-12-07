// js/classes/Enemy.js

export default class Enemy {
    constructor(canvas, image) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.image = image;
        this.width = 60;
        this.height = 60;
        this.x = Math.random() * (canvas.width - this.width) + this.width / 2;
        this.y = -this.height;
        this.speed = 2 + Math.random() * 2;
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
