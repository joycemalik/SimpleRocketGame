// js/utils/Storage.js

export function getHighScore() {
    return parseInt(localStorage.getItem('highScore')) || 0;
}

export function setHighScore(score) {
    const currentHighScore = getHighScore();
    if (score > currentHighScore) {
        localStorage.setItem('highScore', score);
    }
}
