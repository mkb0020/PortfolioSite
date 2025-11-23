// static/js/circuit-sparks.js
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('circuit-container');

    const svgNS = "http://www.w3.org/2000/svg";  // SVG ELEMENT
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("id", "circuit-svg");
    svg.setAttribute("viewBox", "0 0 1000 600");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.style.width = "100%";
    svg.style.height = "100%";
    container.appendChild(svg);

    const circuitSVGContent = `
            <path id="trace1" class="circuit-trace" d="M 705,285 L 727,260 L 727,228 L 805,145 L 823,145 L 850,120" />
            <path id="trace2" class="circuit-trace" d="M 579,200 L 579,275 L 529,326 L 529,346 L 450,428 L 450,496 L423,520" />
            <path id="trace3" class="circuit-trace" d="M 615,352 L 655,310 L 655,270 L 678,248" />
            <path id="trace4" class="circuit-trace" d="M 550,470 L 750,270 L 750,248 L 893,100" />
            <path id="trace5" class="circuit-trace" d="M 1000,140 L 551,590" />
            <path id="trace25" class="circuit-trace" d="M 950,130 L 500,580" />
            <path id="trace24" class="circuit-trace" d="M 530,590 L 990,125" />
            <path id="trace26" class="circuit-trace" d="M 475,590 L 775,280 L 775,253 L 900,123" />
            <path id="trace6" class="circuit-trace" d="M 321,460 L 302,485 L 270,485 L 205,550" />
            <path id="trace7" class="circuit-trace" d="M 0,15 L 157,187 L 157,250 L 185,279 L 185,350" />
            <path id="trace8" class="circuit-trace" d="M 160,330 L 160,290 L 122,252 L 122,184 L 10,80" />
            <path id="trace9" class="circuit-trace" d="M 440,10 L 440,227 L 424,243 L 424,299 L 400,320" />
            <path id="trace10" class="circuit-trace" d="M 185,10 L 185,148 L 222,182 L 222,210" />
            <path id="trace11" class="circuit-trace" d="M 395,365 L 412,365 L 463,313 L 463,285 L 505,240 L 505,160 L 570,100" />
            <path id="trace12" class="circuit-trace" d="M 393,280 L 393,222 L 405,205 L 405,100" />
            <path id="trace13" class="circuit-trace" d="M 204,245 L 189,228 L 189,195 L 155,160 L 155,0" />
            <path id="trace14" class="circuit-trace" d="M 0,449 L 10,460 L 50,460 L 84,496 L 210,496 L 308,398 L 308,310 L 340,275 L 340,207 L 360,185 L 360,100" />
            <path id="trace22" class="circuit-trace" d="M 280,100 L 280,157 L 265,170 L 265,241 L 233,272 L 233,355 L 195,393 L 155,393 L 43,279 L 43,210 L 13,180 L 13,0" />
            <path id="trace23" class="circuit-trace" d="M 316,100 L 316,180 L 304,190 L 304,260 L 270,292 L 270,370 L 207,433 L 123,433 L 10,323 L 0,323" />
            <path id="trace15" class="circuit-trace" d="M 0,296 L 20,297 L 140,414" />
            <path id="trace16" class="circuit-trace" d="M 295,515 L 300,508 L 345,508 L 373,478 L 373,417 L 327,370 L 327,316 L 360,281 L 360,215 L 380,192 L 380,0" />
            <path id="trace17" class="circuit-trace" d="M 755,515 L 755,508 L 928,338" />
            <path id="trace18" class="circuit-trace" d="M 805,515 L 940,380 L 1000,380" />
            <path id="trace18" class="circuit-trace" d="M 775,515 L 915,375 L 925,375 L 1000, 295" />
            <path id="trace19" class="circuit-trace" d="M 680,515 L 695,500 L 695,490" />
            <path id="trace20" class="circuit-trace" d="M 825,10 L 617,217 L 617,290 L 573,338 L 573,375 L 500,450 L 500,700" />
            <path id="trace21" class="circuit-trace" d="M 1000,260 L 970,295 L 910,295 L 711,492 L 711,580" />

            <!-- NEW PARALLEL & BRANCHING TRACES (subtle grid expansion) -->
            <path class="circuit-trace t-pale" d="M 880,80 L 760,200 L 760,340 L 680,420 L 680,520" />
            <path class="circuit-trace t-deep" d="M 920,90 L 800,210 L 800,350 L 720,430 L 720,530" />
            <path class="circuit-trace t-med"  d="M 840,70 L 720,190 L 720,330 L 640,410 L 640,510" />

            <path class="circuit-trace t-pale" d="M 100,120 L 220,240 L 300,360 L 380,480 L 420,560" />
            <path class="circuit-trace t-deep" d="M 80,100 L 200,220 L 280,340 L 360,460 L 400,540" />
            <path class="circuit-trace t-med"  d="M 120,140 L 240,260 L 320,380 L 400,500 L 440,580" />

            <path class="circuit-trace t-pale" d="M 0,180 L 180,180 L 280,280 L 380,280 L 480,180 L 680,180 L 780,280 L 900,280 L 1000,180" />
            <path class="circuit-trace t-deep" d="M 0,480 L 150,480 L 250,380 L 400,380 L 550,480 L 700,480 L 800,380 L 950,380 L 1000,480" />

            <path class="circuit-trace t-med"  d="M 200,0 L 200,150 L 350,300 L 500,300 L 650,150 L 650,0" />
            <path class="circuit-trace t-pale" d="M 300,0 L 300,180 L 450,330 L 600,330 L 750,180 L 750,0" />

            <path class="circuit-trace t-deep" d="M 50,550 L 250,350 L 450,350 L 650,550" />
            <path class="circuit-trace t-med"  d="M 100,500 L 300,300 L 500,300 L 700,500" />

            <!-- Extra fine connecting traces -->
            <path class="circuit-trace t-pale" d="M 150,250 L 350,250 L 350,450 L 150,450 Z" stroke="none" fill="none" />
            <path class="circuit-trace t-pale" d="M 150,250 L 350,250" />
            <path class="circuit-trace t-pale" d="M 350,250 L 350,450" />
            <path class="circuit-trace t-pale" d="M 350,450 L 150,450" />
            <path class="circuit-trace t-pale" d="M 150,450 L 150,250" />

            <!-- NODES (original + many new ones) -->
            <circle class="node" cx="159.5" cy="325" r="6"/>
            <circle class="node" cx="185" cy="348" r="6"/>
            <circle class="node" cx="202" cy="245" r="6"/>
            <circle class="node" cx="222" cy="215" r="6"/>
            <circle class="node" cx="323" cy="463" r="6"/>
            <circle class="node" cx="200" cy="325" r="6"/>
            <circle class="node" cx="389" cy="365" r="6"/>
            <circle class="node" cx="371" cy="326" r="6"/>
            <circle class="node" cx="393" cy="273" r="6"/>
            <circle class="node" cx="613" cy="355" r="6"/>
            <circle class="node" cx="452" cy="256" r="6"/>
            <circle class="node" cx="500" cy="447" r="3"/>
            <circle class="node" cx="579" cy="203" r="6"/>
            <circle class="node" cx="704" cy="283" r="6"/>
            <circle class="node" cx="442" cy="138" r="6"/>
            <circle class="node" cx="535" cy="478" r="15"/>

            <!-- New nodes on the new traces -->
            <circle class="node n-glow" cx="800" cy="210" r="7"/>
            <circle class="node n-glow" cx="720" cy="430" r="7"/>
            <circle class="node" cx="200" cy="220" r="5"/>
            <circle class="node" cx="380" cy="480" r="6"/>
            <circle class="node n-glow" cx="500" cy="300" r="8"/>
            <circle class="node" cx="650" cy="150" r="5"/>
            <circle class="node n-glow" cx="300" cy="300" r="6"/>
            <circle class="node" cx="700" cy="500" r="6"/>
            <circle class="node n-glow" cx="150" cy="250" r="7"/>
            <circle class="node n-glow" cx="350" cy="450" r="7"/>
    `;

    svg.innerHTML = circuitSVGContent; // INJECT ALL AT ONCE

    const traces = svg.querySelectorAll('.circuit-trace');
    const activeSparks = [];

    class Spark { 
        constructor(pathElement) {
            this.path = pathElement;
            this.pathLength = pathElement.getTotalLength();
            this.progress = 0;
            this.speed = 0.4 + Math.random() * 0.8;
            this.element = this.createSparkElement();
            this.active = true;
        }
        createSparkElement() {
            const spark = document.createElementNS(svgNS, 'circle');
            spark.classList.add('spark');
            spark.setAttribute('r', '3');
            svg.appendChild(spark);
            return spark;
        }
        update() {
            if (!this.active) return false;
            this.progress += this.speed;
            if (this.progress >= this.pathLength) {
                this.remove();
                return false;
            }
            const point = this.path.getPointAtLength(this.progress);
            this.element.setAttribute('cx', point.x);
            this.element.setAttribute('cy', point.y);
            const fadePoint = this.pathLength * 0.8;
            if (this.progress > fadePoint) {
                const opacity = 1 - ((this.progress - fadePoint) / (this.pathLength - fadePoint));
                this.element.style.opacity = opacity;
            }
            return true;
        }
        remove() {
            this.active = false;
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }
    }

    function createRandomSpark() {
        const randomTrace = traces[Math.floor(Math.random() * traces.length)];
        const spark = new Spark(randomTrace);
        activeSparks.push(spark);
    }

    function animate() {
        for (let i = activeSparks.length - 1; i >= 0; i--) {
            if (!activeSparks[i].update()) activeSparks.splice(i, 1);
        }
        requestAnimationFrame(animate);
    }

    
    setInterval(createRandomSpark, 600 + Math.random() * 600); // SPARK SPAWNING
    for (let i = 0; i < 5; i++) setTimeout(createRandomSpark, i * 200);
    animate();
});