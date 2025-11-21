document.addEventListener("DOMContentLoaded", () => {
console.log("Canvas size:", canvas.clientWidth, canvas.clientHeight);
/* ============================ GOOPY GLOBAL SETTINGS ============================ */
window.gooSettings = {
    gravity: 0.3,
    dripInterval: 400,
    baseSize: 10,
    rainbow: false
};

const canvas = document.getElementById("gooCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() { // MAKE CANVAS FULL CONTAINER
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

/* ============================  BLOB DROP ============================ */
class GooDrop {
    constructor(x, y, sizeOverride = null) {
        this.x = x;
        this.y = y;

        const base = window.gooSettings.baseSize;
        this.radius = sizeOverride || (base + Math.random() * (base * 0.8));

        this.vy = 0;
        this.grounded = false;
        this.squish = 1;

        this.color = window.gooSettings.rainbow
            ? randomRainbow()
            : "rgba(100, 180, 255, 0.8)";
    }

    update() {
        if (!this.grounded) {
            this.vy += window.gooSettings.gravity;
            this.y += this.vy;

            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.grounded = true;
            }
        } else {
            this.squish = Math.min(this.squish + 0.05, 1.5);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        let stretch = Math.max(1, this.vy * 0.1);
        if (this.grounded) stretch = 1 / this.squish;

        ctx.scale(1, stretch);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    }
}

let drops = [];

/* ============================  SPAWN + CLEAR FUNCTIONS ============================ */
window.spawnGoo = function () {
    const x = Math.random() * canvas.width;
    drops.push(new GooDrop(x, -20));
};

window.clearGoo = function () {
    drops = [];
};

/* ============================ RAINBOW  ============================ */
function randomRainbow() {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, 100%, 65%, 0.85)`;
}

/* ============================ AUTO DRIP INTERVAL SYSTEM  ============================ */
let dripTimer = null;

function restartDripInterval() {
    if (dripTimer) clearInterval(dripTimer);

    dripTimer = setInterval(() => {
        window.spawnGoo();
    }, window.gooSettings.dripInterval);
}

restartDripInterval();

/* ============================ ANIMATION LOOP ============================ */

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drops.forEach(drop => {
        drop.update();
        drop.draw();
    });

    requestAnimationFrame(animate);
}
animate();
});