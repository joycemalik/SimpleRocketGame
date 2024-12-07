// js/classes/Particle.js

export default class Particle {
    constructor(canvas, x, y, color) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.color = color;
        this.alpha = 1;
        this.fade = Math.random() * 0.02 + 0.01;
    }

    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.fade;
        this.draw();
    }

    isFaded() {
        return this.alpha <= 0;
    }
}
