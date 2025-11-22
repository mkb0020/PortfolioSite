// static/js/goo.js
(() => {
    document.addEventListener("DOMContentLoaded", () => {
        // ────── WORKS WITH BOTH #blobCanvas OR #JSCanvas) ──────
        const canvas = document.getElementById("JSCanvas") || document.getElementById("blobCanvas");
        if (!canvas) {
            console.error("goo.js: No canvas found! Need id='JSCanvas' or id='blobCanvas'");
            return;
        }
        const ctx = canvas.getContext("2d");

        function resizeCanvas() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        window.goo = { gravity: 0.03, dripInterval: 2000, baseSize: 50, rainbow: false, volume: 0.0 };

        // ────── AUDIO ──────
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playPlop = (pitch = 1, vol = 0.3) => {
            if (!window.goo.volume) return;
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = "sine";
            o.frequency.setValueAtTime(180 * pitch, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(40 * pitch, audioCtx.currentTime + 0.15);
            g.gain.setValueAtTime(vol * window.goo.volume, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            o.connect(g).connect(audioCtx.destination);
            o.start();
            o.stop(audioCtx.currentTime + 0.25);
        };

        class GooDrop {
            constructor(x, y, sizeOverride = null) {
                this.x = x; this.y = y;
                const b = window.goo.baseSize;
                this.radius = sizeOverride || (b + Math.random() * b * 0.6);
                this.vy = 0; this.grounded = false;
                this.squish = 1; this.squishVel = 0; this.targetSquish = 1;
                this.color = window.goo.rainbow ? this.rainbow() : "rgba(184,121,226, 0.9)"; // BLOB MAIN COLOR
                this.trail = []; this.age = 0;
            }
            rainbow() { return `hsla(${(Date.now()/40 + this.x)%360},90%,65%,0.9)`; }

            update() {
                this.age++;

                if (!this.grounded) {
                    this.vy += window.goo.gravity;  
                    this.y += this.vy;

                    // BLOB TRAIL
                    if (this.vy > 1) {
                        this.trail.push({x: this.x, y: this.y + this.radius, life: 2});
                    }

                    if (this.y + this.radius > canvas.height) {
                        this.y = canvas.height - this.radius;
                        this.grounded = true;

                        const impact = Math.min(this.vy / 15, 2);
                        this.targetSquish = 0.6 - impact * 0.1;
                        setTimeout(() => this.targetSquish = 1.6, 20);
                        setTimeout(() => this.targetSquish = 0.8, 150);
                        setTimeout(() => this.targetSquish = 1.1, 300);
                        setTimeout(() => this.targetSquish = 1, 450);

                        playPlop(1 + impact * 0.3, impact * 0.5);

                        // screen shake
                        //document.body.style.transform = `translateY(${impact * -5}px)`;
                        //setTimeout(() => document.body.style.transform = "", 120);
                    }
                } else {
                    // Spring squish
                    const force = (this.targetSquish - this.squish) * 0.3;
                    this.squishVel += force;
                    this.squishVel *= 0.6;
                    this.squish += this.squishVel;
                }

                // BLOB TRAIL FADE
                this.trail = this.trail.filter(p => {
                    p.y += 30;
                    p.life -= 0.9;
                    return p.life > 0;
                });
            }



            draw() { // DRAW BLOBS
                ctx.save();
                ctx.translate(this.x, this.y);
                const stretchY = this.grounded ? this.squish : Math.max(1, this.vy * 0.01);
                const scaleX = 1 / Math.sqrt(stretchY);
                ctx.scale(scaleX, stretchY);

                const r = this.radius, t = Date.now() / 2000; // HIGHER = SLOWER WIGGLE MOVEMENT ON THE GROUND
                ctx.beginPath();
                for (let i = 0; i < 12; i++) {
                    const a = i * Math.PI * 2 / 12;
                    const w = 0.15 + 0.1 * Math.sin(t + this.age * 0.05 + i);
                    const d = r * (1 + w * Math.sin(i * 0.8));
                    const x = Math.cos(a) * d;
                    const y = Math.sin(a) * d;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();

                const grad = ctx.createRadialGradient(-r*0.4, -r*0.5, 0, 0, 0, r*1.4);
                grad.addColorStop(0, "rgba(211,150,252, 0.7)");
                grad.addColorStop(0.3, this.color.replace(/[\d.]+\)$/, "0.9)"));
                grad.addColorStop(1, this.color.replace(/[\d.]+\)$/, "0.3)"));
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.strokeStyle = "rgba(184,121,226, 0.62)";
                ctx.lineWidth = 0;
                ctx.stroke();

                this.trail.forEach(p => {
                    ctx.globalAlpha = p.life * 0.6;
                    ctx.fillStyle = this.color;
                    ctx.fillRect(p.x - 4, p.y, 8, 16);
                });
                ctx.globalAlpha = 1;
                ctx.restore();
            }
        }

        const drops = [];

        const drawConnections = () => {  };

        const spawn = (x = Math.random()*canvas.width, y = -60) => drops.push(new GooDrop(x,y));

        canvas.addEventListener("click", e => {
            const r = canvas.getBoundingClientRect();
            spawn(e.clientX-r.left, e.clientY-r.top-100);
            playPlop(1.4,0.4);
        });

        let dripTimer;
        const restartDrip = () => { clearInterval(dripTimer); dripTimer = setInterval(spawn, window.goo.dripInterval); };
        restartDrip();

        // ────── CAN USE NEW JS CSS OR THE OLD BLOB CSS ──────
        const el = id => document.getElementById(id) || document.getElementById(id.replace("JS","blob").replace("blob","JS"));

        const sync = (inputId, prop, displayId = null, multiplier = 1) => {
            const input = el(inputId);
            if (!input) return;

            input.oninput = e => {
                window.goo[prop] = +e.target.value * multiplier;
                
                if (displayId) {
                    const displayEl = el(displayId);
                    if (displayEl) displayEl.textContent = e.target.value;  // show raw slider value
                }
                
                if (prop === "dripInterval") restartDrip();
            };
        };

        sync("gravitySlider", "gravity", "gravityValue", 0.001);
        sync("dripSlider", "dripInterval", "dripValue");
        sync("sizeSlider", "baseSize", "sizeValue");

        const rainbowBtn = el("rainbowToggle"); // RAINBOW MODE BUTTON
        if (rainbowBtn) rainbowBtn.onclick = () => {
            window.goo.rainbow = !window.goo.rainbow;
            rainbowBtn.textContent = window.goo.rainbow ? "Solid Color" : "Rainbow Blobs";
            rainbowBtn.style.background = window.goo.rainbow
                ? "linear-gradient(90deg,#ff0000,#ff9900,#ccff00,#00ff00,#0099ff,#6600ff)" : "";
        };

        el("spawnBlobBtn")?.addEventListener("click", () => { for(let i=0;i<12;i++) spawn(); });
        el("clearBlobBtn")?.addEventListener("click", () => drops.length = 0);

        // ────── LOOP ──────
        const loop = () => {
            ctx.fillStyle = "rgba(20,0,40,0.03)";
            ctx.fillRect(0,0,canvas.width,canvas.height);
            drops.forEach(d => { d.update(); d.draw(); });
            drawConnections();
            requestAnimationFrame(loop);
        };
        loop();

        setTimeout(() => { for(let i=0;i<15;i++) spawn(); }, 400);
    });
})();