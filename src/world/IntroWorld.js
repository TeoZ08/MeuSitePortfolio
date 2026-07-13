import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GuideRobot } from "./GuideRobot.js";

const damp = (current, target, speed, delta) => THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));
const ease = (value) => 1 - Math.pow(1 - value, 3);

function seeded(index) {
  const value = Math.sin(index * 91.713 + 17.31) * 43758.5453;
  return value - Math.floor(value);
}

export class IntroWorld {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.keys = new Set();
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.mode = "loading";
    this.proximity = false;
    this.screenEnergy = 0;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.touchDirection = new THREE.Vector2();
    this.terminalPosition = new THREE.Vector3(0, 0, -6.15);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9db8aa);
    this.scene.fog = new THREE.Fog(0xaab7a5, 20, 48);
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 90);
    this.camera.position.set(0, 4.1, 16.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.16;
    this.renderer.shadowMap.enabled = innerWidth >= 760;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1 : 1.35));

    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (_url, loaded, total) => this.callbacks.onProgress?.(loaded / Math.max(total, 1));
    this.manager.onError = (url) => console.warn(`Recurso da introdução indisponível: ${url}`);
    this.loader = new GLTFLoader(this.manager);
    this.loader.setMeshoptDecoder(MeshoptDecoder);
    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.addLight();
    this.addGround();
    this.addAtmosphere();
    this.bind();
    this.resize();
  }

  asset(path) {
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
  }

  material(color, options = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.78,
      metalness: options.metalness ?? 0.04,
      emissive: options.emissive ?? 0x000000,
      emissiveIntensity: options.emissiveIntensity ?? 0,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1,
      side: options.side ?? THREE.FrontSide
    });
  }

  async load(path) {
    const { scene } = await this.loader.loadAsync(this.asset(path));
    this.prepare(scene);
    return scene;
  }

  prepare(object) {
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach((material) => {
        material.side = THREE.DoubleSide;
        if (material.map) material.map.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 4);
      });
    });
  }

  normalize(object, target, axis = "y") {
    const wrapper = new THREE.Group();
    wrapper.add(object);
    object.position.set(0, 0, 0);
    object.updateMatrixWorld(true);
    const initial = new THREE.Box3().setFromObject(object);
    const size = initial.getSize(new THREE.Vector3());
    object.scale.multiplyScalar(target / Math.max(size[axis], 0.001));
    object.updateMatrixWorld(true);
    const scaled = new THREE.Box3().setFromObject(object);
    const center = scaled.getCenter(new THREE.Vector3());
    object.position.x -= center.x;
    object.position.z -= center.z;
    object.position.y -= scaled.min.y;
    return wrapper;
  }

  addLight() {
    this.scene.add(new THREE.HemisphereLight(0xfff0c9, 0x405240, 2.4));

    const sun = new THREE.DirectionalLight(0xffc47f, 4.5);
    sun.position.set(-13, 18, 11);
    sun.castShadow = true;
    sun.shadow.mapSize.set(innerWidth < 760 ? 512 : 1536, innerWidth < 760 ? 512 : 1536);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -14;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 48;
    this.scene.add(sun);

    const sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd59b, transparent: true, opacity: 0.82, fog: false, toneMapped: false })
    );
    sunDisc.position.set(-18, 11, -35);
    sunDisc.lookAt(this.camera.position);
    this.scene.add(sunDisc);
  }

  addGround() {
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(34, 96),
      this.material(0x536744, { roughness: 0.98, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -3;
    ground.receiveShadow = true;
    this.root.add(ground);

    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 28, 1, 12),
      this.material(0x8a7658, { roughness: 1, metalness: 0 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.018, 2.5);
    path.receiveShadow = true;
    this.root.add(path);

    const edgeMaterial = this.material(0x66774c, { roughness: 0.96, metalness: 0 });
    const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.09, 0.48, 3), edgeMaterial, innerWidth < 760 ? 130 : 280);
    const dummy = new THREE.Object3D();
    for (let index = 0; index < grass.count; index += 1) {
      const side = seeded(index) > 0.5 ? 1 : -1;
      const distance = 3 + seeded(index + 12) * 14;
      const z = -14 + seeded(index + 40) * 30;
      dummy.position.set(side * distance, 0.2, z);
      dummy.rotation.set(0, seeded(index + 8) * Math.PI, (seeded(index + 75) - 0.5) * 0.24);
      const scale = 0.65 + seeded(index + 93) * 1.1;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      grass.setMatrixAt(index, dummy.matrix);
    }
    grass.castShadow = true;
    grass.receiveShadow = true;
    this.root.add(grass);

    const stoneMaterial = this.material(0x6f6b5d, { roughness: 0.96 });
    for (let index = 0; index < 22; index += 1) {
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + seeded(index) * 0.45, 0), stoneMaterial);
      const side = seeded(index + 31) > 0.5 ? 1 : -1;
      stone.position.set(side * (3.1 + seeded(index + 46) * 6.5), 0.18, -12 + seeded(index + 71) * 27);
      stone.scale.y = 0.48 + seeded(index + 89) * 0.35;
      stone.rotation.set(seeded(index) * 0.4, seeded(index + 2) * Math.PI, seeded(index + 7) * 0.25);
      stone.castShadow = true;
      stone.receiveShadow = true;
      this.root.add(stone);
    }
  }

  addAtmosphere() {
    const count = innerWidth < 760 ? 90 : 180;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (seeded(index) - 0.5) * 34;
      positions[index * 3 + 1] = 0.8 + seeded(index + 30) * 7;
      positions[index * 3 + 2] = -18 + seeded(index + 60) * 35;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.pollen = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ color: 0xffe4a9, size: 0.035, transparent: true, opacity: 0.62, depthWrite: false })
    );
    this.root.add(this.pollen);
  }

  async init() {
    const [robot, table, monitor, startButton, walls, treeA, treeB, treeC, log, stumpA, stumpB, nature] = await Promise.all([
      this.load("models/guide-robot.glb"),
      this.load("intro/table.glb"),
      this.load("intro/monitor.glb"),
      this.load("models/start-button.glb"),
      this.load("intro/ruin-walls.glb"),
      this.load("intro/intro-tree-a.glb"),
      this.load("intro/intro-tree-b.glb"),
      this.load("intro/intro-tree-c.glb"),
      this.load("intro/intro-log.glb"),
      this.load("intro/intro-stump-a.glb"),
      this.load("intro/intro-stump-b.glb"),
      this.load("intro/nature-kit.glb")
    ]);

    this.addRobot(robot);
    this.addTerminal(table, monitor, startButton);
    this.addRuin(walls);
    this.addVegetation({ treeA, treeB, treeC, log, stumpA, stumpB, nature });
    this.mode = "explore";
    this.callbacks.onProgress?.(1);
    this.callbacks.onReady?.();
    this.animate();
  }

  addRobot(model) {
    const normalized = this.normalize(model, 1.18, "y");
    this.robot = new GuideRobot(normalized, new THREE.Color("#b8392c"));
    this.robot.root.position.set(0, 1.08, 11.2);
    this.robot.home.copy(this.robot.root.position);
    this.robot.targetPosition.copy(this.robot.root.position);
    this.robot.hubPosition.copy(this.robot.root.position);
    this.robot.baseY = this.robot.root.position.y;
    this.robot.movementSpeed = 4.35;
    this.robot.wake();
    this.robot.lookAt(this.terminalPosition);
    this.root.add(this.robot.root);
  }

  addTerminal(tableModel, monitorModel, buttonModel) {
    const table = this.normalize(tableModel, 5.25, "x");
    table.position.set(0, 0, -6.4);
    table.rotation.y = Math.PI;
    this.root.add(table);
    table.updateMatrixWorld(true);
    const tabletopY = new THREE.Box3().setFromObject(table).max.y;

    const monitor = this.normalize(monitorModel, 1.75, "y");
    monitor.position.set(0, tabletopY + 0.02, -6.27);
    monitor.rotation.y = Math.PI;
    this.root.add(monitor);

    const buttonTop = buttonModel.getObjectByName("o_button2_Cylinder001");
    if (buttonTop?.isMesh) {
      buttonTop.material = this.material(0xb8392c, { roughness: 0.3, metalness: 0.24, emissive: 0x7b1d16, emissiveIntensity: 1.15 });
    }
    const button = this.normalize(buttonModel, 0.92, "x");
    button.position.set(1.58, tabletopY + 0.045, -5.43);
    button.rotation.y = -0.18;
    this.root.add(button);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.42, 1.48, 0.15),
      this.material(0x171816, { roughness: 0.35, metalness: 0.58 })
    );
    frame.position.set(0, tabletopY + 0.75, -5.91);
    frame.castShadow = true;
    this.root.add(frame);

    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 608;
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.colorSpace = THREE.SRGBColorSpace;
    this.screenMaterial = new THREE.MeshBasicMaterial({ map: this.screenTexture, color: 0xffffff, toneMapped: false });
    this.screen = new THREE.Mesh(new THREE.PlaneGeometry(2.22, 1.27), this.screenMaterial);
    this.screen.position.set(0, tabletopY + 0.75, -5.825);
    this.screen.userData.action = "enter";
    this.root.add(this.screen);
    this.drawScreen(0);

    const terminalLight = new THREE.PointLight(0xffc47f, 0, 7, 2);
    terminalLight.position.set(0, tabletopY + 0.7, -4.95);
    this.terminalLight = terminalLight;
    this.root.add(terminalLight);
  }

  addRuin(source) {
    const findNode = (name) => source.getObjectByName(name) || source.getObjectByName(name.replaceAll(" ", "_"));
    const placements = [
      ["Wall A", 6.2, [-4.35, 0, -10.35], 0.03],
      ["Wall B", 7.0, [4.05, 0, -10.65], -0.05],
      ["Corner A", 4.7, [-7.4, 0, -8.45], Math.PI / 2.35],
      ["Brick", 1.15, [5.75, 0.1, -5.85], 0.45]
    ];
    placements.forEach(([name, height, position, rotation]) => {
      const node = findNode(name);
      if (!node) return;
      const piece = this.normalize(node.clone(true), height, "y");
      piece.position.fromArray(position);
      piece.rotation.y = rotation;
      this.root.add(piece);
    });
  }

  addVegetation({ treeA, treeB, treeC, log, stumpA, stumpB, nature }) {
    const trees = [
      [treeA, 8.8, [-9.2, 0, -7.5], 0.15],
      [treeB, 7.1, [8.8, 0, -8.2], -0.22],
      [treeC, 9.8, [-10.8, 0, 4.8], 0.45],
      [treeA, 6.7, [10.6, 0, 5.7], -0.5],
      [treeB, 5.6, [7.1, 0, 12.8], 0.18],
      [treeC, 6.3, [-7.2, 0, 13.6], -0.2]
    ];
    trees.forEach(([source, height, position, rotation]) => {
      const tree = this.normalize(source.clone(true), height, "y");
      tree.position.fromArray(position);
      tree.rotation.y = rotation;
      this.root.add(tree);
    });

    const logObject = this.normalize(log, 3.5, "x");
    logObject.position.set(-5.5, 0.05, -2.1);
    logObject.rotation.y = 0.65;
    this.root.add(logObject);

    const stumpOne = this.normalize(stumpA, 0.85, "y");
    stumpOne.position.set(5.2, 0, 2.8);
    this.root.add(stumpOne);
    const stumpTwo = this.normalize(stumpB, 0.62, "y");
    stumpTwo.position.set(-4.3, 0, 7.3);
    stumpTwo.rotation.y = 0.8;
    this.root.add(stumpTwo);

    const naturePlacements = [
      ["conifer3_Cylinder.001", 5.2, [12.5, 0, -4.5]],
      ["conifer5_Cylinder.004", 4.2, [-12.8, 0, -3.2]],
      ["stone_with_moss_1.001", 1.1, [-4.6, 0, -5.5]],
      ["stone_with_moss_3.001", 0.8, [5.2, 0, -1.8]],
      ["Rock Type4 02 mesh.001", 0.75, [3.8, 0, 7.8]]
    ];
    naturePlacements.forEach(([name, height, position]) => {
      const node = nature.getObjectByName(name) || nature.getObjectByName(name.replaceAll(" ", "_"));
      if (!node) return;
      const object = this.normalize(node.clone(true), height, "y");
      object.position.fromArray(position);
      object.rotation.y = seeded(name.length) * Math.PI;
      this.root.add(object);
    });
  }

  drawScreen(energy) {
    if (!this.screenCanvas) return;
    const context = this.screenCanvas.getContext("2d");
    const glow = Math.round(18 + energy * 24);
    context.fillStyle = `rgb(${8 + glow}, ${15 + glow}, ${13 + glow})`;
    context.fillRect(0, 0, this.screenCanvas.width, this.screenCanvas.height);
    context.strokeStyle = `rgba(255, 231, 187, ${0.14 + energy * 0.65})`;
    context.lineWidth = 3;
    context.strokeRect(40, 40, 944, 528);
    context.fillStyle = `rgba(255, 245, 223, ${0.32 + energy * 0.68})`;
    context.font = "600 30px monospace";
    context.fillText("MATTEO / PORTFÓLIO", 72, 105);
    context.font = "600 88px Georgia";
    context.fillText(energy > 0.45 ? "Explore meu mundo!" : "Sistema em espera", 70, 290);
    context.fillStyle = `rgba(255, 245, 223, ${0.18 + energy * 0.66})`;
    context.font = "500 26px monospace";
    context.fillText(energy > 0.45 ? "CLIQUE OU PRESSIONE E PARA ENTRAR" : "APROXIME-SE DO TERMINAL", 72, 390);
    context.fillStyle = "#b8392c";
    context.fillRect(72, 450, 90 + energy * 610, 5);
    this.screenTexture.needsUpdate = true;
  }

  setPointer(clientX, clientY) {
    this.pointerTarget.set(
      (clientX / Math.max(innerWidth, 1)) * 2 - 1,
      -(clientY / Math.max(innerHeight, 1)) * 2 + 1
    );
  }

  setTouchDirection(x, z) {
    this.touchDirection.set(x, z);
  }

  hasMovementInput() {
    return ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].some((code) => this.keys.has(code)) || this.touchDirection.lengthSq() > 0;
  }

  movement() {
    return {
      x: Number(this.keys.has("KeyD") || this.keys.has("ArrowRight")) - Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft")) + this.touchDirection.x,
      z: Number(this.keys.has("KeyS") || this.keys.has("ArrowDown")) - Number(this.keys.has("KeyW") || this.keys.has("ArrowUp")) + this.touchDirection.y
    };
  }

  updateMovement(delta) {
    if (this.mode !== "explore" || !this.robot) return;
    const direction = this.movement();
    const length = Math.hypot(direction.x, direction.z);
    if (length > 0.01) {
      direction.x /= length;
      direction.z /= length;
      this.robot.targetPosition.x += direction.x * this.robot.movementSpeed * delta;
      this.robot.targetPosition.z += direction.z * this.robot.movementSpeed * delta;
      this.robot.targetPosition.x = THREE.MathUtils.clamp(this.robot.targetPosition.x, -6.2, 6.2);
      this.robot.targetPosition.z = THREE.MathUtils.clamp(this.robot.targetPosition.z, -4.25, 13.5);
      this.robot.targetYaw = Math.atan2(direction.x, direction.z);
      this.robot.manualStrength = 1;
    }

    const distance = Math.hypot(this.robot.root.position.x - this.terminalPosition.x, this.robot.root.position.z - this.terminalPosition.z);
    const nextProximity = distance < 5.25;
    if (nextProximity !== this.proximity) {
      this.proximity = nextProximity;
      this.callbacks.onProximity?.(nextProximity);
    }
    if (!length && nextProximity) this.robot.lookAt(new THREE.Vector3(0, 2.2, -7));
  }

  async enter(skip = false) {
    if (!["explore", "loading"].includes(this.mode)) return;
    this.mode = "entering";
    this.keys.clear();
    this.touchDirection.set(0, 0);
    this.callbacks.onTransition?.();

    if (skip || this.reducedMotion || !this.robot) {
      await new Promise((resolve) => setTimeout(resolve, 180));
      return;
    }

    const startPosition = this.camera.position.clone();
    const startLook = this.robot.root.position.clone();
    const screenY = this.screen?.position.y ?? 2.35;
    const endPosition = new THREE.Vector3(0, screenY, -4.05);
    const endLook = new THREE.Vector3(0, screenY, -5.83);
    const control = startPosition.clone().lerp(endPosition, 0.52);
    control.y += 1.8;
    const curve = new THREE.QuadraticBezierCurve3(startPosition, control, endPosition);
    this.transition = { elapsed: 0, duration: 1.65, curve, startLook, endLook };
    await new Promise((resolve) => { this.transitionResolve = resolve; });
  }

  pick(clientX, clientY) {
    if (this.mode !== "explore" || !this.proximity) return;
    const rect = this.canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
      -((clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1
    );
    this.raycaster.setFromCamera(pointer, this.camera);
    if (this.raycaster.intersectObject(this.screen, false).length) this.callbacks.onActivate?.();
  }

  bind() {
    this.onResize = () => this.resize();
    this.onPointerMove = (event) => this.setPointer(event.clientX, event.clientY);
    this.onCanvasClick = (event) => this.pick(event.clientX, event.clientY);
    this.onKeyDown = (event) => {
      const movementKeys = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"];
      if (movementKeys.includes(event.code) && this.mode === "explore") {
        event.preventDefault();
        this.keys.add(event.code);
      }
      if ((event.code === "KeyE" || event.code === "Enter") && this.mode === "explore" && this.proximity) {
        event.preventDefault();
        this.callbacks.onActivate?.();
      }
    };
    this.onKeyUp = (event) => this.keys.delete(event.code);
    this.onBlur = () => {
      this.keys.clear();
      this.touchDirection.set(0, 0);
    };
    addEventListener("resize", this.onResize, { passive: true });
    addEventListener("pointermove", this.onPointerMove, { passive: true });
    addEventListener("keydown", this.onKeyDown);
    addEventListener("keyup", this.onKeyUp);
    addEventListener("blur", this.onBlur);
    this.canvas.addEventListener("click", this.onCanvasClick);
  }

  resize() {
    const width = Math.max(1, this.canvas.clientWidth || innerWidth);
    const height = Math.max(1, this.canvas.clientHeight || innerHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update(delta, elapsed) {
    this.pointer.x = damp(this.pointer.x, this.pointerTarget.x, 3.3, delta);
    this.pointer.y = damp(this.pointer.y, this.pointerTarget.y, 3.3, delta);
    this.updateMovement(delta);
    this.robot?.update(delta, elapsed);

    const targetEnergy = this.proximity || this.mode === "entering" ? 1 : 0.08;
    const previousEnergy = this.screenEnergy;
    this.screenEnergy = damp(this.screenEnergy, targetEnergy, 3.8, delta);
    if (Math.abs(previousEnergy - this.screenEnergy) > 0.005) this.drawScreen(this.screenEnergy);
    if (this.terminalLight) this.terminalLight.intensity = 2 + this.screenEnergy * 22;

    if (this.transition) {
      this.transition.elapsed += delta;
      const raw = Math.min(1, this.transition.elapsed / this.transition.duration);
      const progress = ease(raw);
      this.camera.position.copy(this.transition.curve.getPoint(progress));
      const look = this.transition.startLook.clone().lerp(this.transition.endLook, progress);
      this.camera.lookAt(look);
      if (raw >= 1) {
        this.transition = null;
        this.transitionResolve?.();
        this.transitionResolve = null;
      }
    } else if (this.robot) {
      const robotPosition = this.robot.root.position;
      const desired = new THREE.Vector3(
        robotPosition.x * 0.56 + this.pointer.x * 0.75,
        4.05 + this.pointer.y * 0.24,
        robotPosition.z + 6.25
      );
      this.camera.position.lerp(desired, 1 - Math.exp(-4.1 * delta));
      const look = robotPosition.clone();
      look.y += 0.15 + this.pointer.y * 0.22;
      look.x += this.pointer.x * 0.45;
      look.z -= 1.25;
      this.camera.lookAt(look);
    }

    if (this.pollen) this.pollen.rotation.y += delta * 0.012;
  }

  animate() {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.05);
      this.update(delta, this.clock.elapsedTime);
      this.renderer.render(this.scene, this.camera);
      this.frame = requestAnimationFrame(tick);
    };
    tick();
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    removeEventListener("resize", this.onResize);
    removeEventListener("pointermove", this.onPointerMove);
    removeEventListener("keydown", this.onKeyDown);
    removeEventListener("keyup", this.onKeyUp);
    removeEventListener("blur", this.onBlur);
    this.canvas.removeEventListener("click", this.onCanvasClick);
    this.scene.traverse((object) => {
      object.geometry?.dispose?.();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.filter(Boolean).forEach((material) => {
        Object.values(material).forEach((value) => value?.isTexture && value.dispose());
        material.dispose?.();
      });
    });
    this.renderer.dispose();
  }
}
