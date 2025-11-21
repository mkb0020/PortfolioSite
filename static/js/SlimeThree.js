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
    
    vec3 slimeColor = vec3(0.72, 0.58, 0.96);

    // Better noise function for organic movement
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

    // FRACTAL NOISE FOR MORE DETAIL
    float fbm(vec2 p) {
        float f = 0.0;
        float a = 0.5;
        for(int i = 0; i < 4; i++) {
            f += a * noise(p);
            p *= 2.0;
            a *= 0.5;
        }
        return f;
    }

    // CALCULATE DRIP MASK - RETURNS 0 WHERE DRIPS HAVE ALREADY ERSASED, 1 WHERE SLIME REMAINS
    float dripMask(vec2 uv, float t) {
        float erasedArea = 0.0;
        
        // CREATE MORE DRIPS FOR BETTER COVERAGE
        for(float i = 0.0; i < 45.0; i++) {
            // Random x position for each drip
            float x = fract(sin(i * 12.9898) * 43758.5453);
            
            // STAGGERED START TIMES
            float startDelay = fract(sin(i * 78.233) * 43758.5453) * 0.9;
            float dripTime = max(0.0, t - startDelay);
            
            // VARIABLE FALL SPEEDS
            float speedVariation = 0.045 + fract(sin(i * 45.123) * 43758.5453) * 0.2;
            float fallDistance = dripTime * speedVariation;
            
            // DRIP BOTTOM - STARTS ABOVE SCREEN - FALLS THROUGH
            float dripY = 1.1 - fallDistance;
            
            // VARIABLE WIDTHS
            float baseWidth = 0.035 + fract(sin(i * 91.456) * 43758.5453) * 0.065;
            
            // WOBBLE
            float xWobble = fbm(vec2(i * 3.0, dripTime * 0.8)) * 0.02;
            float dripX = x + xWobble;
            
            // DISTANCE FROM DRIP CENTER
            float dist = abs(uv.x - dripX);
            
            // DRIP LENGTHS - LONGER THAN SCREEN HEIGHT
            // This ensures when the bottom reaches the bottom, the top is off-screen
            float dripLength = 1.5 + fract(sin(i * 63.789) * 43758.5453) * 1.0;
            
            // CHECK IF WE'RE WITHIN HORIZONTAL BOUNDS
            float wobble = fbm(vec2(uv.y * 10.0, dripTime * 1.2 + i * 2.0)) * 0.02;
            float horizontalMask = smoothstep(baseWidth + wobble, baseWidth * 0.3, dist);
            
            // BOTTOM OF DRIP STARTS AT TOP AND FALLS DOWN - TOP OF DRIP IS DRIP LENGTH ABOVE THE BOTTOM
            float dripBottom = dripY;
            float dripTop = dripY + dripLength;
            
            // ONLY ERASE BETWEEN DRIPS TOP AND BOTTOM
            float verticalMask = smoothstep(dripBottom - 0.1, dripBottom + 0.05, uv.y) * 
                                smoothstep(dripTop + 0.05, dripTop - 0.1, uv.y);
            
            // VARIATION WITH BULGES
            float bulge = 1.4 + sin(uv.y * 15.0 - dripTime * 2.0 + i * 5.0) * 0.3;
            
            // DRIP ONLY ERASES WHERE IT CURRENTLY IS
            float thisDrip = horizontalMask * verticalMask * bulge;
            
            erasedArea = max(erasedArea, thisDrip);
        }
        
        // RETURN 1 - ERASED AREA SO THAT ERASED PARTS BECOME TRANSPARENT
        return 1.0 - erasedArea;
    }

    void main() {
        vec2 uv = vUv;
        
        float mask = 1.0; // START WITH FULL SLIME COVERAGE
        
        float dripsErasure = dripMask(uv, melt * 8.0); // CALCULATE HOW MUCH HAS BEEN ERASED BY DRIPS
        
        mask = dripsErasure; // MASK IS WHAT REMAINS AFTER DRIPS HAVE ERASED
        
        float surface = 1.0 - fbm(vUv * 25.0 + time * 0.3) * 0.05; // ADD SUBTLE TEXTURE TO SLIME SURFACE
        vec3 color = slimeColor * surface;
        
        float highlight = pow(max(0.0, fbm(vUv * 30.0 - time * 0.2)), 4.0) * 0.9; // ADD GLOSSY HIGHLIGHTS FOR WET LOOK
        color += vec3(highlight);
        
        color += vec3(0.05, 0.01, 0.2) * fbm(vUv * 12.0 + time * 0.1); // SLIGHT COLOR VARIATION FOR DEPTH
        
        gl_FragColor = vec4(color, mask);
    }
`;

initThreeSlime();

function skipAnimation() { // SKIP ANIMATION IF VISITOR HAS BEEN TO ABOUT PAGE IN CURRENT SESSION
    const overlay = document.getElementById('slime-overlay');
    overlay.style.transition = 'opacity 0.5s';
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.classList.add('hidden');
        sessionStorage.setItem('slimeAnimationSeen', 'true');
    }, 500);
}

function initThreeSlime() {
    const canvas = document.getElementById("slime-three");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene(); // SCENE
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10); // CAMERA
    camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            time: { value: 0 },
            melt: { value: 0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let start = performance.now();

    function animate() {
        let elapsed = (performance.now() - start) / 1000;

        material.uniforms.time.value = elapsed;
        material.uniforms.melt.value = Math.min(1, elapsed / 10); // ANIMATION RUNS FOR 10 SECONSDS

        renderer.render(scene, camera);

        if (elapsed < 10) {  // TOPS ANIMATION TIME
            requestAnimationFrame(animate);
        } else {
            const overlay = document.getElementById('slime-overlay');
            overlay.style.transition = 'opacity 0.5s';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.add('hidden');
                sessionStorage.setItem('slimeAnimationSeen', 'true');
            }, 500);
        }
    }

    animate();

    window.addEventListener('resize', () => { // WINDOW RESIZING
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

window.skipAnimation = skipAnimation; // EXPORT SKIP FUNCTION TO GLOBAL SCOPE