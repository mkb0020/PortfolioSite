// FRACTALS
let scene, camera, renderer, uniforms;
let container;
let currentFractal = "mandelbrot";
let material;

function resizeRendererToContainer() {
    if (!renderer || !uniforms || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height, false);
    uniforms.u_resolution.value.set(width, height);
}

// ======================== FRACTAL FORMULAS ========================
const fractalShaders = {
    mandelbrot: `
        z = vec2(
            z.x*z.x - z.y*z.y + c.x,
            2.0*z.x*z.y + c.y
        );
    `,

    power3: `
        z = vec2(
            z.x*z.x*z.x - 3.0*z.x*z.y*z.y + c.x,
            3.0*z.x*z.x*z.y - z.y*z.y*z.y + c.y
        );
    `,

    julia: `
      // Override z and c BEFORE iteration
      if (i == 0.0) {
          z = uv;  

          c = vec2(
              sin(u_time * 0.3) * 0.6,
              cos(u_time * 0.2) * 0.4
          );
      }

      // Actual Julia iteration
      z = vec2(
          z.x*z.x - z.y*z.y + c.x,
          2.0*z.x*z.y + c.y
      );
    `,

    tricorn: `
        z = vec2(
            z.x*z.x - z.y*z.y + c.x,
            -2.0*z.x*z.y + c.y
        );
    `,

    burningship: `
        vec2 absz = vec2(abs(z.x), abs(z.y));
        z = vec2(
            absz.x*absz.x - absz.y*absz.y + c.x,
            2.0*absz.x*absz.y + c.y
        );
    `
};

// ======================== SHADER BUILDER ========================
function buildFragmentShader() {
    return `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_zoom;
        uniform vec2 u_offset;

        vec3 colorize(float t) {
            return 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + t));
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

            // Default initial values (Julia overrides both)
            vec2 z = uv;
            vec2 c = uv / u_zoom + u_offset;

            float iter = 0.0;
            const float maxIter = 150.0;

            for (float i = 0.0; i < maxIter; i++) {
                if (dot(z,z) > 4.0) break;

                ${fractalShaders[currentFractal]}

                iter = i;
            }

            float t = iter / maxIter;
            vec3 col = colorize(t + u_time * 0.1);
            gl_FragColor = vec4(col, 1.0);
        }
    `;
}

function init() {
    container = document.getElementById("fractal-canvas");
    container.style.cursor = "grab";

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    uniforms = {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(0, 0) },
        u_mouse: { value: new THREE.Vector2() },
        u_zoom: { value: 1.0 },
        u_offset: { value: new THREE.Vector2(0, 0) }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);

    material = new THREE.ShaderMaterial({
        uniforms,
        fragmentShader: buildFragmentShader()
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    resizeRendererToContainer();
}

function animate(t) {
    uniforms.u_time.value = t * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();
animate();

// ======================== FRACTAL DROPDOWN ========================
const fractalSelect = document.getElementById("fractalSelect");
fractalSelect.addEventListener("change", e => {
    currentFractal = e.target.value;
    material.fragmentShader = buildFragmentShader();
    material.needsUpdate = true;
});

window.addEventListener("resize", resizeRendererToContainer);

// ======================== ZOOM CONTROLS ========================
let zoomLevel = 1.0;
const zoomFactor = 1.5;

document.getElementById("zoomInBtn").addEventListener("click", () => {
    zoomLevel *= zoomFactor;
    uniforms.u_zoom.value = zoomLevel;
});

document.getElementById("zoomOutBtn").addEventListener("click", () => {
    zoomLevel /= zoomFactor;
    uniforms.u_zoom.value = zoomLevel;
});

document.getElementById("resetZoomBtn").addEventListener("click", () => {
    zoomLevel = 1.0;
    uniforms.u_zoom.value = 1.0;
    uniforms.u_offset.value.set(-0.5, 0);
});

// ======================== PAN / DRAG ========================
let isDragging = false;
let lastMouse = { x: 0, y: 0 };

container.addEventListener("mousedown", e => {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    container.style.cursor = "grabbing";
});

container.addEventListener("mousemove", e => {
    if (!isDragging) return;

    const dx = (e.clientX - lastMouse.x) / container.clientWidth;
    const dy = (e.clientY - lastMouse.y) / container.clientHeight;

    uniforms.u_offset.value.x -= dx * 3.0 / zoomLevel;
    uniforms.u_offset.value.y += dy * 3.0 / zoomLevel;

    lastMouse = { x: e.clientX, y: e.clientY };
});

container.addEventListener("mouseup", () => {
    isDragging = false;
    container.style.cursor = "grab";
});

container.addEventListener("mouseleave", () => {
    isDragging = false;
    container.style.cursor = "grab";
});
