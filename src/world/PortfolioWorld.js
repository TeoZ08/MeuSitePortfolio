import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CameraRig } from "./CameraRig.js";
import { GuideRobot } from "./GuideRobot.js";
import { buildUseartStation } from "./stations/UseartStation.js";
import { buildJarvisStation } from "./stations/JarvisStation.js";
import { buildAquaStation } from "./stations/AquaStation.js";
import { buildUnapiStation } from "./stations/UnapiStation.js";

const damp = (current, target, speed, delta) => THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const builders = [buildUseartStation, buildJarvisStation, buildAquaStation, buildUnapiStation];

export class PortfolioWorld {
  constructor(canvas, projects, callbacks = {}) {
    this.canvas = canvas;
    this.projects = projects;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.mode = "loading";
    this.activeIndex = -1;
    this.hoverIndex = -1;
    this.stationHitboxes = [];
    this.screenHitboxes = [];
    this.stations = [];
    this.keys = new Set();
    this.touchDirection = new THREE.Vector2();
    this.robotIdle = 0;
    this.hubCenter = new THREE.Vector3(0, 1.28, 1.5);
    this.startHover = 0;
    this.startHoverTarget = 0;
    this.startPressed = 0;
    this.startPressedTarget = 0;
    this.startScale = 1;
    this.startRing = null;
    this.renderingEnabled = callbacks.initialActive ?? true;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080605);
    this.scene.fog = new THREE.FogExp2(0x080605, 0.025);

    this.camera = new THREE.PerspectiveCamera(43, 1, 0.1, 110);
    this.cameraRig = new CameraRig(this.camera, this.reducedMotion);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = innerWidth >= 760;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.05 : 1.45));

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    pmrem.dispose();

    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (_url, loaded, total) => this.callbacks.onProgress?.(loaded / Math.max(total, 1));
    this.manager.onError = (url) => console.warn(`Recurso 3D indisponível: ${url}`);
    this.managerDone = new Promise((resolve) => { this.manager.onLoad = resolve; });
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.modelLoader = new GLTFLoader(this.manager);
    this.modelLoader.setMeshoptDecoder(MeshoptDecoder);

    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.addLighting();
    this.addArchitecture();
    this.addAtmosphere();
    this.bind();
    this.resize();
    this.animate();
  }

  async init() {
    await Promise.all([
      this.addGuideRobot(),
      this.addStations()
    ]);
    await this.managerDone;
    this.mode = "start";
    this.cameraRig.setMode("start");
    this.callbacks.onProgress?.(1);
    this.callbacks.onReady?.();
  }

  asset(path) {
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
  }

  material(color, options = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.66,
      metalness: options.metalness ?? 0.14,
      emissive: options.emissive ?? 0x000000,
      emissiveIntensity: options.emissiveIntensity ?? 0,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1
    });
  }

  async loadModel(path) {
    const { scene } = await this.modelLoader.loadAsync(this.asset(path));
    return scene;
  }

  prepareModel(object) {
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach((material) => {
        if (material.map) material.map.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 4);
      });
    });
  }

  normalizeModel(object, target, axis = "y") {
    const wrapper = new THREE.Group();
    wrapper.add(object);
    const initial = new THREE.Box3().setFromObject(object);
    const size = initial.getSize(new THREE.Vector3());
    const scale = target / Math.max(size[axis], 0.001);
    object.scale.multiplyScalar(scale);
    const scaled = new THREE.Box3().setFromObject(object);
    const center = scaled.getCenter(new THREE.Vector3());
    object.position.x -= center.x;
    object.position.z -= center.z;
    object.position.y -= scaled.min.y;
    return wrapper;
  }

  addLighting() {
    this.scene.add(new THREE.HemisphereLight(0xffe4c6, 0x110908, 1.42));

    const key = new THREE.DirectionalLight(0xffd6aa, 3.1);
    key.position.set(-8, 13, 12);
    key.castShadow = true;
    key.shadow.mapSize.set(innerWidth < 760 ? 512 : 1536, innerWidth < 760 ? 512 : 1536);
    key.shadow.camera.left = -18;
    key.shadow.camera.right = 18;
    key.shadow.camera.top = 17;
    key.shadow.camera.bottom = -12;
    this.scene.add(key);

    const entry = new THREE.PointLight(0xf0b786, 34, 24, 2);
    entry.position.set(0, 6.2, 11);
    this.scene.add(entry);
  }

  addArchitecture() {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(19.5, 96),
      this.material(0x15100e, { roughness: 0.94, metalness: 0.04 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = 0.7;
    floor.receiveShadow = true;
    this.world.add(floor);

    const grid = new THREE.PolarGridHelper(18, 12, 14, 72, 0x6f3029, 0x33231f);
    grid.position.set(0, 0.014, 1.5);
    grid.material.transparent = true;
    grid.material.opacity = 0.32;
    this.world.add(grid);

    const center = new THREE.Vector3(0, 0, 1.5);
    const wallMaterial = this.material(0x211714, { roughness: 0.86, metalness: 0.06 });
    for (const degrees of [-78, -52, -26, 0, 26, 52, 78]) {
      const angle = THREE.MathUtils.degToRad(degrees);
      const panel = new THREE.Group();
      panel.position.set(15.2 * Math.sin(angle), 0, center.z - 15.2 * Math.cos(angle));
      panel.lookAt(center);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(4.7, 6.6, 0.24), wallMaterial);
      wall.position.y = 3.3;
      wall.receiveShadow = true;
      panel.add(wall);
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 6.25, 0.07),
        this.material(0x51433b, { roughness: 0.34, metalness: 0.72 })
      );
      seam.position.set(-2.22, 3.24, 0.16);
      panel.add(seam);
      this.world.add(panel);
    }

    const ceilingRing = new THREE.Mesh(
      new THREE.TorusGeometry(13.9, 0.075, 10, 120),
      this.material(0x4e3f38, { roughness: 0.3, metalness: 0.76 })
    );
    ceilingRing.rotation.x = Math.PI / 2;
    ceilingRing.position.set(0, 6.45, 1.5);
    this.world.add(ceilingRing);

    const centerPlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.15, 2.35, 0.16, 72),
      this.material(0x2a201c, { roughness: 0.58, metalness: 0.32 })
    );
    centerPlatform.position.set(0, 0.08, 2.1);
    centerPlatform.receiveShadow = true;
    this.world.add(centerPlatform);

    const centerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.63, 0.026, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0xb8392c, transparent: true, opacity: 0.45, toneMapped: false })
    );
    centerRing.rotation.x = Math.PI / 2;
    centerRing.position.set(0, 0.18, 2.1);
    this.world.add(centerRing);
  }

  addAtmosphere() {
    const count = innerWidth < 760 ? 100 : 280;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 36;
      positions[index * 3 + 1] = Math.random() * 7;
      positions[index * 3 + 2] = -15 + Math.random() * 31;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.dust = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ color: 0xffd5a6, size: 0.018, transparent: true, opacity: 0.28, depthWrite: false })
    );
    this.world.add(this.dust);
  }

  labelTexture(project) {
    const canvas = document.createElement("canvas");
    canvas.width = 1152;
    canvas.height = 250;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = project.color;
    context.fillRect(16, 30, 8, 182);
    context.fillStyle = "#fff5df";
    context.font = "600 88px Georgia, serif";
    context.fillText(project.title, 54, 126);
    context.fillStyle = "rgba(234,223,201,.62)";
    context.font = "600 25px IBM Plex Mono, monospace";
    context.fillText(`${project.number} / ${project.roomLabel}`.toUpperCase(), 58, 178);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 4);
    return texture;
  }

  screen(image, width, height, projectIndex, galleryIndex) {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.13),
      this.material(0x11100f, { roughness: 0.34, metalness: 0.62 })
    );
    frame.castShadow = true;
    group.add(frame);

    const material = new THREE.MeshBasicMaterial({ color: 0x2f2623, toneMapped: false });
    this.textureLoader.load(image, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 4);
      material.map = texture;
      material.color.set(0xffffff);
      material.needsUpdate = true;
    });
    const display = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    display.position.z = 0.071;
    display.userData.action = "screen";
    display.userData.projectIndex = projectIndex;
    display.userData.galleryIndex = galleryIndex;
    group.add(display);
    this.screenHitboxes.push(display);
    return group;
  }

  createStationShell(project, index, angle) {
    const root = new THREE.Group();
    root.userData.projectIndex = index;
    root.userData.floatables = [];
    root.userData.rotators = [];
    root.userData.valves = [];
    root.userData.needles = [];
    root.userData.flows = [];

    const center = new THREE.Vector3(0, 0, 1.5);
    const radius = 11.8;
    root.position.set(radius * Math.sin(angle), 0, center.z - radius * Math.cos(angle));
    root.lookAt(center);

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(4.45, 4.75, 0.22),
      this.material(0x251a17, { roughness: 0.84, metalness: 0.08 })
    );
    wall.position.set(0, 2.38, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    root.add(wall);

    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.18, 3.65),
      this.material(0x2d211d, { roughness: 0.7, metalness: 0.18 })
    );
    platform.position.set(0, 0.09, 1.72);
    platform.castShadow = true;
    platform.receiveShadow = true;
    root.add(platform);

    for (const x of [-2.14, 2.14]) {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.095, 4.95, 0.16),
        this.material(0x5b4a42, { roughness: 0.26, metalness: 0.78 })
      );
      frame.position.set(x, 2.42, 0.12);
      root.add(frame);
    }

    const accent = new THREE.Mesh(
      new THREE.BoxGeometry(4.18, 0.045, 0.06),
      new THREE.MeshBasicMaterial({ color: project.color, toneMapped: false })
    );
    accent.position.set(0, 4.5, 0.16);
    root.add(accent);

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(4.25, 0.92),
      new THREE.MeshBasicMaterial({ map: this.labelTexture(project), transparent: true, toneMapped: false, depthWrite: false })
    );
    label.position.set(0, 4.0, 0.17);
    root.add(label);

    const lamp = new THREE.SpotLight(new THREE.Color(project.color), 15, 9, 0.68, 0.62, 1.7);
    lamp.position.set(0, 5.25, 3.5);
    lamp.target.position.set(0, 1.5, 1.1);
    root.add(lamp, lamp.target);
    root.userData.lamp = lamp;

    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(4.65, 4.95, 3.72),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitbox.position.set(0, 2.38, 1.72);
    hitbox.userData.action = "station";
    hitbox.userData.projectIndex = index;
    root.add(hitbox);
    this.stationHitboxes.push(hitbox);

    root.userData.cameraAnchor = new THREE.Vector3(0.12, 3.08, 7.15);
    root.userData.lookAnchor = new THREE.Vector3(0.28, 2.22, 1.25);
    root.userData.robotAnchor = new THREE.Vector3(2.58, 1.12, 1.75);
    return root;
  }

  async addStations() {
    const angles = [-66, -22, 22, 66].map(THREE.MathUtils.degToRad);
    const jobs = this.projects.map((project, index) => {
      const station = this.createStationShell(project, index, angles[index]);
      this.world.add(station);
      this.stations.push(station);
      return builders[index](this, station, project, index);
    });
    await Promise.all(jobs);
  }

  async addStartButton() {
    const model = await this.loadModel("models/start-button.glb");
    this.prepareModel(model);
    const button = this.normalizeModel(model, 2.15, "x");
    const baseMesh = model.getObjectByName("o_button_1_Cube_Cube002");
    const topMesh = model.getObjectByName("o_button2_Cylinder001");
    if (baseMesh?.isMesh) baseMesh.material = this.material(0x31241f, { roughness: 0.36, metalness: 0.64 });
    if (topMesh?.isMesh) {
      topMesh.material = this.material(0xb8392c, { roughness: 0.3, metalness: 0.28, emissive: 0x8a2018, emissiveIntensity: 0.6 });
      this.startButtonTop = topMesh;
      this.startButtonTopY = topMesh.position.y;
    }

    const group = new THREE.Group();
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(1.38, 1.66, 0.24, 48),
      this.material(0x211916, { roughness: 0.48, metalness: 0.52 })
    );
    plinth.position.y = 0.12;
    plinth.castShadow = true;
    group.add(plinth);
    button.position.y = 0.25;
    group.add(button);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.58, 0.032, 10, 72),
      new THREE.MeshBasicMaterial({ color: 0xb8392c, transparent: true, opacity: 0.5, toneMapped: false })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.26;
    group.add(ring);
    this.startRing = ring;

    const startLight = new THREE.PointLight(0xb8392c, 18, 6, 2);
    startLight.position.set(0, 1.1, 0.2);
    group.add(startLight);

    group.position.set(0, 0, 9.1);
    this.world.add(group);
    this.startButton = group;
  }

  async addGuideRobot() {
    const model = await this.loadModel("models/guide-robot.glb");
    this.prepareModel(model);
    const robotModel = this.normalizeModel(model, 1.12, "y");
    this.guideRobot = new GuideRobot(robotModel);
    this.world.add(this.guideRobot.root);
  }

  setStartHover(value) {
    this.startHoverTarget = value ? 1 : 0;
  }

  isCompactViewport() {
    return innerWidth <= 700 || innerHeight > innerWidth;
  }

  getHubView() {
    if (this.isCompactViewport()) {
      return {
        position: new THREE.Vector3(0, 5.15, 17.35),
        look: new THREE.Vector3(0, 2.18, -3.7)
      };
    }
    return {
      position: new THREE.Vector3(0, 4.55, 14.8),
      look: new THREE.Vector3(0, 2.05, -4.3)
    };
  }

  getProjectView(station) {
    const position = station.localToWorld(station.userData.cameraAnchor.clone());
    const look = station.localToWorld(station.userData.lookAnchor.clone());
    if (!this.isCompactViewport()) return { position, look };

    // Em retrato, a âncora local recua e aponta ligeiramente à esquerda. Assim
    // o título, o objeto e as telas cabem no enquadramento de cada estande.
    return {
      position: station.localToWorld(new THREE.Vector3(-0.05, 3.75, 9.3)),
      look: station.localToWorld(new THREE.Vector3(-0.38, 2.34, 1.25))
    };
  }

  setCameraFraming() {
    this.camera.fov = this.isCompactViewport() ? 53 : 43;
    this.camera.updateProjectionMatrix();
  }

  async enterHub() {
    this.mode = "entering";
    this.cameraRig.setMode("entering");
    this.startPressedTarget = 1;
    this.guideRobot?.wake();
    await wait(this.reducedMotion ? 20 : 280);
    this.startScale = 0;
    const { position, look } = this.getHubView();
    await this.cameraRig.moveTo(position, look, 1.6, 1.25);
    this.cameraRig.position.copy(position);
    this.cameraRig.look.copy(look);
    this.mode = "hub";
    this.cameraRig.setMode("hub");
    this.startButton.visible = false;
  }

  activateHub() {
    const { position, look } = this.getHubView();
    this.mode = "hub";
    this.cameraRig.setMode("hub");
    this.cameraRig.snap(position, look);
    this.startScale = 0;
    if (this.startButton) this.startButton.visible = false;
    this.guideRobot?.wake();
    this.guideRobot?.lookAt(this.camera.position);
  }

  setActive(active) {
    this.renderingEnabled = active;
    if (active) this.clock.getDelta();
  }

  setTouchDirection(x, z) {
    if (this.mode !== "hub") {
      this.touchDirection.set(0, 0);
      return;
    }
    this.touchDirection.set(x, z);
  }

  async focus(index) {
    const station = this.stations[index];
    if (!station) return;
    this.mode = "traveling";
    this.activeIndex = index;
    this.hoverIndex = -1;
    this.keys.clear();
    this.touchDirection.set(0, 0);
    this.cameraRig.setMode("traveling");
    const { position, look } = this.getProjectView(station);
    const robotPosition = station.localToWorld(station.userData.robotAnchor.clone());
    this.guideRobot?.rememberHubPosition();
    this.guideRobot?.setPresentationMode(true);
    this.guideRobot?.setDestination(robotPosition, this.projects[index].color);
    this.guideRobot?.lookAt(look);
    await this.cameraRig.moveTo(position, look, 1.45, 1.85);
    this.cameraRig.position.copy(position);
    this.cameraRig.look.copy(look);
    this.mode = "project";
    this.cameraRig.setMode("project");
  }

  async overview() {
    this.mode = "returning";
    this.cameraRig.setMode("returning");
    this.touchDirection.set(0, 0);
    this.guideRobot?.setPresentationMode(false);
    this.guideRobot?.returnToHubPosition();
    const { position, look } = this.getHubView();
    await this.cameraRig.moveTo(position, look, 1.3, 2.0);
    this.cameraRig.position.copy(position);
    this.cameraRig.look.copy(look);
    this.activeIndex = -1;
    this.mode = "hub";
    this.cameraRig.setMode("hub");
    this.guideRobot?.lookAt(this.camera.position);
  }

  setPointer(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
      -((clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1
    );
    this.cameraRig.setPointer(this.pointer.x, this.pointer.y);
    this.guideRobot?.setPointer(this.pointer);
    if (this.mode === "hub" && innerWidth >= 700) this.updateHover();
  }

  updateHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.stationHitboxes, false)[0];
    const next = Number.isInteger(hit?.object?.userData?.projectIndex) ? hit.object.userData.projectIndex : -1;
    if (next === this.hoverIndex) return;
    this.hoverIndex = next;
    this.canvas.style.cursor = next >= 0 ? "pointer" : "grab";
    if (next >= 0) {
      const station = this.stations[next];
      this.guideRobot?.lookAt(station.localToWorld(new THREE.Vector3(0, 2.2, 1.1)));
    } else if (!this.hasMovementInput()) this.guideRobot?.lookAt(this.camera.position);
    this.callbacks.onHover?.(next);
  }

  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
      -((clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1
    );
    this.raycaster.setFromCamera(pointer, this.camera);

    if (this.mode === "hub") {
      const hit = this.raycaster.intersectObjects(this.stationHitboxes, false)[0];
      const raycastIndex = hit?.object?.userData?.projectIndex;
      // A câmera continua reagindo ao cursor entre o hover e o click. Preservar
      // o estande já destacado evita perder a seleção por alguns pixels.
      const index = Number.isInteger(raycastIndex) ? raycastIndex : this.hoverIndex;
      if (Number.isInteger(index)) this.callbacks.onSelect?.(index);
      return;
    }

    if (this.mode === "project") {
      const hits = this.raycaster.intersectObjects(this.screenHitboxes, false);
      const hit = hits.find((entry) => entry.object.userData.projectIndex === this.activeIndex);
      if (hit) this.callbacks.onOpenGallery?.(hit.object.userData.galleryIndex);
    }
  }

  bind() {
    this.onResize = () => this.resize();
    this.onKeyDown = (event) => {
      if (!["KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) return;
      if (this.mode !== "hub" || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      this.keys.add(event.code);
    };
    this.onKeyUp = (event) => this.keys.delete(event.code);
    this.onBlur = () => {
      this.keys.clear();
      this.touchDirection.set(0, 0);
    };
    addEventListener("resize", this.onResize, { passive: true });
    addEventListener("keydown", this.onKeyDown);
    addEventListener("keyup", this.onKeyUp);
    addEventListener("blur", this.onBlur);
  }

  hasMovementInput() {
    return ["KeyW", "KeyA", "KeyS", "KeyD"].some((code) => this.keys.has(code));
  }

  updateGuideMovement(delta) {
    if (this.mode !== "hub" || !this.guideRobot) return;
    const directionX = Number(this.keys.has("KeyD")) - Number(this.keys.has("KeyA")) + this.touchDirection.x;
    const directionZ = Number(this.keys.has("KeyS")) - Number(this.keys.has("KeyW")) + this.touchDirection.y;
    const moving = this.guideRobot.move(directionX, directionZ, delta, this.hubCenter, 8.6);
    if (moving) {
      this.robotIdle = 0;
      return;
    }
    this.robotIdle += delta;
    if (this.robotIdle > 0.55 && this.hoverIndex < 0) this.guideRobot.lookAt(this.camera.position);
  }

  resize() {
    const width = Math.max(1, this.canvas.clientWidth || innerWidth);
    const height = Math.max(1, this.canvas.clientHeight || innerHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.setCameraFraming();

    // Orientações podem mudar com a experiência em curso no iPhone. Reposiciona
    // somente vistas estacionárias; transições continuam até seu destino atual.
    if (this.mode === "hub") {
      const { position, look } = this.getHubView();
      this.cameraRig.snap(position, look);
    } else if (this.mode === "project" && this.stations[this.activeIndex]) {
      const { position, look } = this.getProjectView(this.stations[this.activeIndex]);
      this.cameraRig.snap(position, look);
    }
  }

  update(delta, elapsed) {
    this.updateGuideMovement(delta);
    this.startHover = damp(this.startHover, this.startHoverTarget, 7, delta);
    this.startPressed = damp(this.startPressed, this.startPressedTarget, 10, delta);

    if (this.startButton) {
      const targetScale = this.startScale;
      const scale = damp(this.startButton.scale.x, targetScale, 5, delta);
      this.startButton.scale.setScalar(scale);
      this.startButton.rotation.y = Math.sin(elapsed * 0.55) * 0.04;
    }
    if (this.startRing) {
      const pulse = 1 + Math.sin(elapsed * 1.65) * 0.045 + this.startHover * 0.08;
      this.startRing.scale.setScalar(pulse);
      this.startRing.material.opacity = 0.42 + Math.sin(elapsed * 1.65) * 0.12 + this.startHover * 0.28;
    }
    if (this.startButtonTop) {
      this.startButtonTop.position.y = this.startButtonTopY - this.startPressed * 0.09 + this.startHover * 0.025;
      this.startButtonTop.material.emissiveIntensity = 0.55 + this.startHover * 1.2;
    }

    this.guideRobot?.update(delta, elapsed);
    if (this.guideRobot) this.cameraRig.setPlayerPosition(this.guideRobot.root.position);
    this.cameraRig.update(delta, elapsed);
    this.stations.forEach((station, index) => {
      const emphasized = index === this.hoverIndex || index === this.activeIndex;
      const subdued = this.activeIndex >= 0 && index !== this.activeIndex;
      const targetScale = emphasized ? 1.018 : subdued ? 0.985 : 1;
      const stationScale = damp(station.scale.x, targetScale, 4.2, delta);
      station.scale.setScalar(stationScale);
      station.userData.lamp.intensity = damp(station.userData.lamp.intensity, emphasized ? 27 : subdued ? 6 : 13, 4, delta);

      station.userData.floatables.forEach(({ object, baseY, amount, speed }, itemIndex) => {
        object.position.y = baseY + Math.sin(elapsed * speed + itemIndex) * amount;
      });
      station.userData.rotators.forEach(({ object, base, amount, speed }, itemIndex) => {
        object.rotation.y = base + Math.sin(elapsed * speed + itemIndex) * amount;
      });
      station.userData.valves.forEach((valve, valveIndex) => {
        if (index === this.activeIndex) valve.rotation.z += delta * (0.12 + valveIndex * 0.025);
      });
      station.userData.needles.forEach((needle) => {
        needle.rotation.z = -0.62 + Math.sin(elapsed * 0.8) * 0.3;
      });
      station.userData.flows.forEach(({ curve, dots, speed }) => {
        dots.forEach((dot, dotIndex) => dot.position.copy(curve.getPoint((elapsed * speed + dotIndex / dots.length) % 1)));
      });
      if (station.userData.keyboard) station.userData.keyboard.position.y = station.userData.keyboard.userData.baseY + Math.sin(elapsed * 1.6) * 0.012;
      if (station.userData.beacon) station.userData.beacon.intensity = 7 + Math.sin(elapsed * 2) * 2;
    });

    if (this.dust) this.dust.rotation.y += delta * 0.008;
  }

  animate() {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.05);
      if (this.renderingEnabled) {
        this.update(delta, this.clock.elapsedTime);
        this.renderer.render(this.scene, this.camera);
      }
      this.frame = requestAnimationFrame(tick);
    };
    tick();
  }
}
