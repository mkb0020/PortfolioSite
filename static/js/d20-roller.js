// static/js/d20-roller.js
console.log('D20 Roller – FINAL PERFECTION LOADED');

let scene, camera, renderer, controls;
let world;
let diceMesh, diceBody;
let diceGeometry, diceVertices = [], diceFaces = [];
let isRolling = false;
let calmTimer = 0;

document.addEventListener('DOMContentLoaded', init);

function init() {
    const container = document.getElementById('dice-canvas');
    if (!container) return console.error('dice-canvas not found!');

    scene = new THREE.Scene(); // THREE.js SETUP
    //scene.background = new THREE.Color(0x111111);

    { // GRADIENT BG
        const gradientShader = {
            uniforms: {},
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;

                // Customize these colors for your cosmic void!
                void main() {
                    vec3 topColor = vec3(0.12, 0.01, 0.19);     // Purple-pink nebula
                    vec3 bottomColor = vec3(0.02, 0.0, 0.07);  // Deep cosmic blue

                    gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
                }
            `
        };

        const bgMaterial = new THREE.ShaderMaterial({
            vertexShader: gradientShader.vertexShader,
            fragmentShader: gradientShader.fragmentShader,
            uniforms: gradientShader.uniforms,
            depthWrite: false,     //
            depthTest: false,
            side: THREE.DoubleSide
        });

        const bgPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2), 
            bgMaterial
        );

        bgPlane.frustumCulled = false; 

        const bgScene = new THREE.Scene();
        const bgCamera = new THREE.Camera();
        bgScene.add(bgCamera);
        bgScene.add(bgPlane);

        window._bgScene = bgScene;
        window._bgCamera = bgCamera;
    }

    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(16, 7, 13);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;


    function addStars() {
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 10);

        for (let i = 0; i < starCount; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = -20 - Math.random() * 40;  
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 4));

        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.7,
        });

        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);
        return stars;
    }

    const backgroundStars = addStars();


    scene.add(new THREE.AmbientLight(0xffffff, 0.6)); // LIGHTS
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 12, 5);
    scene.add(dirLight);

    
    world = new CANNON.World(); // CANNON WORLD
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 25;


    const floorMat = new CANNON.Material('floor'); // MATERIALS 
    const diceMat = new CANNON.Material('dice');

    // FLOOR 
    const floorBody = new CANNON.Body({
        mass: 0,
        type: CANNON.Body.STATIC,
        material: floorMat,
        collisionFilterGroup: 1,
        collisionFilterMask: 1
    });
    floorBody.addShape(new CANNON.Plane());
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
    world.addBody(floorBody);

    const floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ 
            color: 0x474752,
            transparent: true,
            opacity: 0.9,
        })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    scene.add(floorMesh);

    world.addContactMaterial(new CANNON.ContactMaterial(floorMat, diceMat, {
        friction: 0.2,
        restitution: 0.55,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 4
    }));

    // WALLS
    const wallThickness = 0.2;
    const halfSize = 10;
    const wallMat = new CANNON.Material("wall");
    function addWall(x, y, z, hx, hy, hz) {
        const body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(hx, hy, hz)),
            position: new CANNON.Vec3(x, y, z),
            material: wallMat
        });
            world.addBody(body);
    }

        // BACK
    addWall(0, 2, -halfSize, halfSize, 2, wallThickness);
        // FRONT
    addWall(0, 2, halfSize, halfSize, 2, wallThickness);
        // LEFT
    addWall(-halfSize, 2, 0, wallThickness, 2, halfSize);
        // RIGHT
    addWall(halfSize, 2, 0, wallThickness, 2, halfSize);


    const radius = 1; // GEOMETRY AND PHYSICS
    diceGeometry = new THREE.IcosahedronGeometry(radius, 0);
    const pos = diceGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        diceVertices.push(new CANNON.Vec3(pos.getX(i), pos.getY(i), pos.getZ(i)));
    }
    diceFaces = [
        [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
        [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
        [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
        [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];

    const diceShape = new CANNON.ConvexPolyhedron(diceVertices, diceFaces);

    diceBody = new CANNON.Body({
        mass: 0.5,
        material: diceMat,
        linearDamping: 0.5,
        angularDamping: 0.8,
        sleepTimeLimit: 0.4,
        collisionFilterGroup: 1,
        collisionFilterMask: 1
    });
    diceBody.addShape(diceShape);
    diceBody.position.set(0, 1, 0);
    world.addBody(diceBody);

    diceMesh = new THREE.Mesh(
        diceGeometry,
        new THREE.MeshNormalMaterial({
            flatShading: false,
            wireframe: false,
            transparent: true,
            opacity: 0.95,
            }));
    scene.add(diceMesh); 

    window.rollDice = function () { // GLOBAL ROLL FUNCTION
        if (isRolling) return;
        isRolling = true;
        calmTimer = 0;
        document.getElementById('resultDisplay').textContent = 'Rolling';

        const x = (Math.random() - 0.5) * 6;
        const z = (Math.random() - 0.5) * 6;
        diceBody.position.set(
            (Math.random() - 0.5) * 1,
            5,
            (Math.random() - 0.5) * 1
        );
        diceBody.velocity.set(
            (Math.random() - 0.5) * 12,
            12 + Math.random() * 4,
            (Math.random() - 0.5) * 12
        );
        diceBody.angularVelocity.set(
            (Math.random() - 0.5) * 90,
            (Math.random() - 0.5) * 90,
            (Math.random() - 0.5) * 90
        );
    };

    function getResult() {  // RESULT FROM LOWEST FACE
        diceMesh.updateMatrixWorld();
        const m = diceMesh.matrixWorld;
        const pos = diceGeometry.attributes.position;
        let lowest = Infinity, faceIdx = 0;
        for (let f = 0; f < diceFaces.length; f++) {
            const verts = diceFaces[f].map(i => new THREE.Vector3().fromBufferAttribute(pos, i));
            const center = verts.reduce((a,b) => a.add(b)).multiplyScalar(1/3).applyMatrix4(m);
            if (center.y < lowest) {
                lowest = center.y;
                faceIdx = f;
            }
        }
        return (faceIdx % 20) + 1;
    }

    function checkSettled() {   // SETTLE CHECK 
        if (!isRolling) return;
        const vel = diceBody.velocity.length();
        const ang = diceBody.angularVelocity.length();

        if (vel < 0.5 && ang < 0.5) {
            calmTimer += clock.getDelta();
            if (calmTimer > 1.5) {
                diceBody.velocity.scale(0.1, diceBody.velocity);
                diceBody.angularVelocity.scale(0.1, diceBody.angularVelocity);
                calmTimer = 0;
            }
        } else {
            calmTimer = 0;
        }

        if (vel < 0.02 && ang < 0.02) {
            document.getElementById('resultDisplay').textContent = getResult();
            isRolling = false;
        }
    }

    const clock = new THREE.Clock();  // ANIMATION LOOP
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        world.step(1/60, delta, 3);

        diceMesh.position.copy(diceBody.position);
        diceMesh.quaternion.copy(diceBody.quaternion);

        if (backgroundStars) { // --- STAR TWINKLE 
            const t = Date.now() * 0.001;
            const pos = backgroundStars.geometry.attributes.position;

            for (let i = 0; i < pos.count; i++) {
                const zOriginal = pos.getZ(i); // LIL Z WOBBLE FOR SHIMMER 

                pos.setZ(i, zOriginal + Math.sin(t + i) * 0.003);
            }
            pos.needsUpdate = true;
        }

        checkSettled();
        controls.update();
        renderer.autoClear = false;
        renderer.clear();
        renderer.render(_bgScene, _bgCamera);
        renderer.render(scene, camera);
    }
    animate();


    window.addEventListener('resize', () => { // RESIZE + SPACEBAR
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    document.addEventListener('keydown', e => {
        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            window.rollDice();
        }
    });}