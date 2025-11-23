// SlimeThree.js 
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
//sessionStorage.removeItem('slimeAnimationSeen'); // FOR TESTING

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;
    varying vec2 vUv;
    uniform float time;
    uniform float melt;
    uniform vec2 mouse;
    uniform vec2 resolution;

    vec3 slimeColor = vec3(0.72, 0.58, 0.96);

    vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                       dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                   mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                       dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
        float f = 0.0;
        float a = 0.5;
        for(int i = 0; i < 5; i++) {
            f += a * noise(p);
            p *= 2.01;
            a *= 0.49;
        }
        return f;
    }

    float dripMask(vec2 uv, float t, vec2 mouse) {
        float erased = 0.0;
        float dripCount = resolution.x < 768.0 ? 18.0 : 50.0;

        for(float i = 0.0; i < 60.0; i++) {
            if (i >= dripCount) break;

            float x = fract(sin(i * 12.9898) * 43758.5453);
            float startDelay = fract(sin(i * 91.745) * 43758.5453 + sin(i * 13.37)) * 2.7;
            float dripTime = max(0.0, t - startDelay);
            float speed = 0.04 + fract(sin(i * 45.123) * 43758.5453) * 0.22;
            float fallDistance = dripTime * speed;
            float dripY = 1.2 - fallDistance;

            // Mouse repellent
            float mouseDist = length(vec2(x, dripY) - mouse);
            float repel = 1.0 - smoothstep(0.0, 0.35, mouseDist);
            x += repel * sin(time * 4.0 + i * 10.0) * 0.12;

            float width = 0.03 + fract(sin(i * 91.456) * 43758.5453) * 0.04;
            float dist = abs(uv.x - x);

            float wobble = fbm(vec2(uv.y * 14.0, time * 3.6 + i)) * 0.05;
            float horiz = smoothstep(width + wobble + repel * 0.28, width * 0.88, dist);

            float dripLength = 1.5 + fract(sin(i * 63.789) * 43758.5453) * 1.0;
            float dripBottom = dripY;
            float dripTop = dripY + dripLength;

            float vert = smoothstep(dripBottom - 0.1, dripBottom + 0.05, uv.y) * 
                        smoothstep(dripTop + 0.05, dripTop - 0.1, uv.y);

            float bulge = 1.0 + sin(uv.y * 18.0 - dripTime * 3.0 + i * 6.0) * 0.4;
            erased = max(erased, horiz * vert * bulge);
        }
        return 1.0 - erased;
    }

    void main() {
        vec2 uv = vUv;
        float t = melt * 9.0;

        float mask = dripMask(uv, t, mouse);

        // Cute slime creature at the end
        float creaturePhase = smoothstep(0.80, 1.0, melt);
        if (creaturePhase > 0.01) {
            vec2 center = vec2(0.5, 0.45 + sin(time * 1.6) * 0.06);  // bigger, slower wave
            float body = 1.0 - smoothstep(0.11, 0.20, length(uv - center));
            vec2 eyeL = center + vec2(-0.045, 0.04);
            vec2 eyeR = center + vec2( 0.045, 0.04);
            float eyes = smoothstep(0.04, 0.0, length(uv - eyeL)) +
                        smoothstep(0.04, 0.0, length(uv - eyeR));
            float mouthY = center.y - 0.025 + sin(time * 3.0) * 0.005;
            float mouth = smoothstep(0.008, 0.0, abs(uv.y - mouthY) - 0.04 + sin((uv.x-center.x)*20.0)*0.02);

            float creature = max(body * 0.9, max(eyes, mouth * 0.8));
            mask = max(mask, creature * creaturePhase);
        }

        float surface = 1.0 - fbm(uv * 28.0 + time * 0.25) * 0.06;
        vec3 color = slimeColor * surface;
        float highlight = pow(max(0.0, fbm(uv * 35.0 + time * 0.3)), 3.8) * 1.2;
        color += vec3(highlight);
        color += vec3(0.08, 0.0, 0.22) * fbm(uv * 10.0 + time * 0.15);

        // GLOW + EDGE
        float edge = abs(dFdx(mask)) + abs(dFdy(mask));
        color += vec3(0.9, 0.6, 1.4) * edge * 4.0;
        float outerGlow = pow(1.0 - mask, 2.5) * 0.9;
        color += vec3(0.8, 0.5, 1.6) * outerGlow;

        gl_FragColor = vec4(color, mask);
    }
`;

try {
    initThreeSlime();
} catch (err) {
    console.error("SLIME REVEAL CRASHED:", err);
    document.getElementById('slime-overlay')?.classList.add('hidden');
}

function skipAnimation() {
    const overlay = document.getElementById('slime-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.classList.add('hidden');
        document.documentElement.classList.add('slime-ready');
        sessionStorage.setItem('slimeAnimationSeen', 'true');
    }, 800);
}

function initThreeSlime() {
    document.body.classList.add('slime-ready');
    // MOBILE DIRECTION
    const isMobile = window.innerWidth < 768;
    const dripCount = isMobile ? 18 : 50;

    const canvas = document.getElementById("slime-three");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(2, 2);

    // MOUSE TRACKING
    const mouse = new THREE.Vector2(0.5, 0.5);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = e.clientY / window.innerHeight;
    });

    
    canvas.addEventListener('click', () => {
        if (material.uniforms.melt.value < 0.95) {
            material.uniforms.melt.value += 0.18;
            // VISUAL SQUISH FEEDBACK
            canvas.style.transform = 'scale(0.98)';
            setTimeout(() => canvas.style.transform = 'scale(1)', 150);
        }
    });

    const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            time: { value: 0 },
            melt: { value: isMobile ? 1.1 : 0 }, // SKIP ON MOBILE
            mouse: { value: mouse },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader,
        fragmentShader
    });

if (material.uniforms && !renderer.capabilities.isWebGL2) {
    console.log("SlimeThree.js → Shader compiled successfully!");
} else {
    console.error("SLIME SHADER FAILED → Check the errors above!");
}


    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // SKIP IF SEEN
if (sessionStorage.getItem('slimeAnimationSeen') === 'true' || isMobile) {
     document.getElementById('slime-overlay').classList.add('hidden');
     return;
  }

    let start = performance.now();

    function animate() {
        const elapsed = (performance.now() - start) / 1000;
        material.uniforms.time.value = elapsed;
        material.uniforms.melt.value = Math.min(1.0, elapsed / 10.5);

        renderer.render(scene, camera);

        if (elapsed < 11) {
            requestAnimationFrame(animate);
        } else {
            const overlay = document.getElementById('slime-overlay');
            overlay.style.transition = 'opacity 0.8s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.add('hidden');
                sessionStorage.setItem('slimeAnimationSeen', 'true');
            }, 800);
        }
    }

    animate();

    setTimeout(() => {
        document.body.classList.add('slime-ready');
    }, 900); 

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    });
}

window.skipAnimation = skipAnimation;