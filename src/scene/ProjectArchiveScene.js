import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ArchiveFolder, FOLDER_PHYSICS } from "./ArchiveFolder.js";
import { ArchiveBox } from "./ArchiveBox.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const damp = (current, target, speed, delta) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));
const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
const smoothstep = (min, max, value) => {
  const normalized = clamp((value - min) / (max - min), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
};

export class ProjectArchiveScene {
  constructor(canvas, shell, projects) {
    this.canvas = canvas;
    this.shell = shell;
    this.projects = projects;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.pageVisible = !document.hidden;
    this.inViewport = true;
    this.active = true;
    this.frame = null;
    this.clock = new THREE.Clock();

    this.state = "idle";
    this.activeId = projects[0]?.id;
    this.hoverId = projects[0]?.id;
    this.activeIndex = 0;
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.dragPointerId = null;
    this.dragStart = new THREE.Vector2();
    this.dragRaw = 0;
    this.dragTarget = 0;
    this.dragX = 0;
    this.pull = 0;
    this.pullVelocity = 0;
    this.hero = 0;
    this.openAmount = 0;
    this.extractionTime = 0;
    this.extractionStartPull = 0;
    this.returnTime = 0;
    this.threshold = 0.7;
    this.didDrag = false;
    this.activeFolderVisible = true;
    this.archiveBounds = {
      minX: -2.17,
      maxX: 2.17,
      floor: -0.675,
      ceiling: 0.22,
      back: -1.34,
      front: 1.25
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    this.camera.position.set(0, 3.8, 7.2);
    this.cameraTarget = new THREE.Vector3(0, -0.12, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 960 ? 1.25 : 1.5));

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.environment;
    pmrem.dispose();

    this.root = new THREE.Group();
    this.root.rotation.set(-0.025, -0.1, -0.025);
    this.scene.add(this.root);

    this.addLights();
    this.addDesk();
    this.archiveBox = new ArchiveBox(this.root);
    this.addFolders();
    this.bindEvents();
    this.resize();
    this.select(this.activeId, { emit: true });
    this.emitState("idle");
    this.start();
  }

  emit(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  emitState(state) {
    this.emit("archive:state", { state, id: this.activeId });
  }

  addLights() {
    this.hemisphere = new THREE.HemisphereLight(0xffefd7, 0x20100c, 1.95);
    this.scene.add(this.hemisphere);

    this.keyLight = new THREE.DirectionalLight(0xffecd0, 4.5);
    this.keyLight.position.set(-4.5, 7.2, 5.4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.camera.left = -6;
    this.keyLight.shadow.camera.right = 6;
    this.keyLight.shadow.camera.top = 6;
    this.keyLight.shadow.camera.bottom = -6;
    this.keyLight.shadow.bias = -0.0007;
    this.scene.add(this.keyLight);

    this.emberLight = new THREE.PointLight(0xc63b2b, 22, 15, 2);
    this.emberLight.position.set(4.2, 1.1, 3.7);
    this.scene.add(this.emberLight);

    this.fillLight = new THREE.PointLight(0xe2b27b, 13, 12, 2);
    this.fillLight.position.set(-3.8, -0.2, 3.8);
    this.scene.add(this.fillLight);
  }

  addDesk() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x241714,
      roughness: 0.94,
      metalness: 0.01
    });
    this.desk = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), material);
    this.desk.rotation.x = -Math.PI / 2;
    this.desk.position.y = -0.91;
    this.desk.receiveShadow = true;
    this.scene.add(this.desk);

    const grain = new THREE.GridHelper(14, 28, 0x4a3028, 0x332019);
    grain.position.y = -0.902;
    grain.material.transparent = true;
    grain.material.opacity = 0.16;
    this.scene.add(grain);
  }

  addFolders() {
    this.folders = this.projects.map((project, index) => {
      const folder = new ArchiveFolder(project, index, this.renderer);
      this.root.add(folder.group);
      return folder;
    });
    this.folderById = new Map(this.folders.map((folder) => [folder.project.id, folder]));
    this.folderMeshes = this.folders.flatMap((folder) => folder.raycastMeshes);
    this.folderTargets = this.folders.map((folder) => folder.basePosition.clone());
    this.folderById.get(this.activeId)?.ensurePreview().catch(() => {});
  }

  select(id, { emit = false } = {}) {
    if (!this.folderById.has(id) || !["idle", "settling"].includes(this.state)) return false;
    this.activeId = id;
    this.hoverId = id;
    this.activeIndex = this.projects.findIndex((project) => project.id === id);
    this.folderById.get(id)?.ensurePreview().catch(() => {});
    if (emit) this.emit("archive:hover", { id });
    if (this.reducedMotion) this.renderOnce();
    return true;
  }

  extract(id) {
    if (this.reducedMotion || !this.folderById.has(id) || !["idle", "settling"].includes(this.state)) return false;
    this.select(id, { emit: true });
    this.pull = Math.max(this.pull, 0.22);
    this.dragRaw = 1;
    this.beginExtraction("keyboard");
    return true;
  }

  beginExtraction(source = "drag") {
    if (["extracting", "extracted", "open", "returning"].includes(this.state)) return;
    this.state = "extracting";
    this.extractionTime = 0;
    this.extractionStartPull = Math.max(this.pull, source === "drag" ? 0.58 : 0.22);
    this.dragTarget = 1;
    this.pullVelocity = 0;
    this.canvas.style.cursor = "progress";
    this.folderById.get(this.activeId)?.ensurePreview().catch(() => {});
    this.emitState("extracting");
    this.emit("archive:extractstart", { id: this.activeId, source });
    this.start();
  }

  setCaseOpen() {
    this.state = "open";
    this.emitState("open");
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.renderOnce();
  }

  setActiveFolderVisible(value) {
    const folder = this.folderById.get(this.activeId);
    if (!folder) return;
    this.activeFolderVisible = value;
    folder.group.visible = value;
    this.renderOnce();
  }

  returnFolder() {
    if (!["open", "extracted"].includes(this.state)) return false;
    this.setActiveFolderVisible(true);
    this.state = "returning";
    this.returnTime = 0;
    this.canvas.style.cursor = "wait";
    this.emitState("returning");
    this.start();
    return true;
  }

  getHit(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.folderMeshes, false)[0]?.object?.userData?.projectId || null;
  }

  updatePointerTarget(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerTarget.set(
      clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1),
      clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1)
    );
  }

  handleHover(event) {
    if (this.state !== "idle") return;
    this.updatePointerTarget(event);
    const id = this.getHit(event);
    this.canvas.style.cursor = id ? "grab" : "default";
    if (id && id !== this.hoverId) this.select(id, { emit: true });
  }

  handleDrag(event) {
    if (this.state !== "dragging" || event.pointerId !== this.dragPointerId) return;
    event.preventDefault();
    this.updatePointerTarget(event);
    const rect = this.canvas.getBoundingClientRect();
    const distance = Math.max(130, rect.height * 0.28);
    const deltaY = this.dragStart.y - event.clientY;
    const deltaX = event.clientX - this.dragStart.x;
    const raw = clamp(deltaY / distance, 0, 1);
    const resisted = 1 - Math.pow(1 - raw, 0.78);
    this.dragRaw = raw;
    this.dragTarget = resisted;
    this.dragX = clamp(deltaX / distance, -0.42, 0.42);
    if (Math.abs(deltaY) + Math.abs(deltaX) > 6) this.didDrag = true;
    this.emit("archive:progress", { id: this.activeId, progress: raw, threshold: this.threshold });

    if (raw >= this.threshold) {
      try {
        this.canvas.releasePointerCapture(event.pointerId);
      } catch {}
      this.dragPointerId = null;
      this.beginExtraction("drag");
    }
  }

  settleFolder() {
    this.state = "settling";
    this.pullVelocity = -Math.max(0.75, this.pull * 2.4);
    this.dragTarget = 0;
    this.dragRaw = 0;
    this.emitState("settling");
    this.emit("archive:progress", { id: this.activeId, progress: 0, threshold: this.threshold });
    this.canvas.style.cursor = "grab";
    this.start();
  }

  bindEvents() {
    this.handleResize = () => this.resize();
    this.handleVisibility = () => {
      this.pageVisible = !document.hidden;
      if (this.pageVisible) this.start();
    };
    this.handlePointerMove = (event) => {
      if (this.state === "dragging") this.handleDrag(event);
      else this.handleHover(event);
    };
    this.handlePointerDown = (event) => {
      if (this.state !== "idle" || event.button !== 0) return;
      const id = this.getHit(event);
      if (!id) return;
      event.preventDefault();
      this.select(id, { emit: true });
      this.state = "dragging";
      this.dragPointerId = event.pointerId;
      this.dragStart.set(event.clientX, event.clientY);
      this.dragRaw = 0;
      this.dragTarget = 0;
      this.dragX = 0;
      this.didDrag = false;
      this.canvas.setPointerCapture?.(event.pointerId);
      this.canvas.style.cursor = "grabbing";
      this.emitState("dragging");
      this.emit("archive:dragstart", { id });
      this.start();
    };
    this.handlePointerUp = (event) => {
      if (this.state !== "dragging" || event.pointerId !== this.dragPointerId) return;
      try {
        this.canvas.releasePointerCapture(event.pointerId);
      } catch {}
      this.dragPointerId = null;
      if (this.dragRaw >= this.threshold) this.beginExtraction("drag");
      else this.settleFolder();
    };
    this.handlePointerCancel = (event) => {
      if (this.state !== "dragging" || event.pointerId !== this.dragPointerId) return;
      try {
        this.canvas.releasePointerCapture(event.pointerId);
      } catch {}
      this.dragPointerId = null;
      this.settleFolder();
    };
    this.handleLostPointerCapture = (event) => {
      if (this.state !== "dragging" || event.pointerId !== this.dragPointerId) return;
      this.dragPointerId = null;
      this.settleFolder();
    };
    this.handlePointerLeave = () => {
      if (this.state === "idle") {
        this.pointerTarget.set(0, 0);
        this.canvas.style.cursor = "default";
      }
    };

    window.addEventListener("resize", this.handleResize, { passive: true });
    document.addEventListener("visibilitychange", this.handleVisibility);
    if (!this.reducedMotion) {
      this.canvas.addEventListener("pointermove", this.handlePointerMove);
      this.canvas.addEventListener("pointerdown", this.handlePointerDown);
      this.canvas.addEventListener("pointerup", this.handlePointerUp);
      this.canvas.addEventListener("pointercancel", this.handlePointerCancel);
      this.canvas.addEventListener("lostpointercapture", this.handleLostPointerCapture);
      this.canvas.addEventListener("pointerleave", this.handlePointerLeave);
    } else {
      this.canvas.style.pointerEvents = "none";
    }

    this.viewportObserver = new IntersectionObserver(
      ([entry]) => {
        this.inViewport = entry.isIntersecting;
        if (this.inViewport) this.start();
      },
      { rootMargin: "16% 0px" }
    );
    this.viewportObserver.observe(this.shell);
  }

  updateState(delta) {
    if (this.state === "dragging") {
      this.pull = damp(this.pull, this.dragTarget, 10, delta);
      return null;
    }

    if (this.state === "settling") {
      const acceleration = -this.pull * 72 - this.pullVelocity * 10.5;
      this.pullVelocity += acceleration * delta;
      this.pull = clamp(this.pull + this.pullVelocity * delta, -0.025, 1);
      this.dragX = damp(this.dragX, 0, 8, delta);
      if (Math.abs(this.pull) < 0.003 && Math.abs(this.pullVelocity) < 0.025) {
        this.pull = 0;
        this.pullVelocity = 0;
        this.dragX = 0;
        this.state = "idle";
        this.emitState("idle");
        this.canvas.style.cursor = "grab";
      }
      return null;
    }

    if (this.state === "extracting") {
      this.extractionTime += delta;
      const progress = clamp(this.extractionTime / 1.15, 0, 1);
      const eased = easeInOutCubic(progress);
      this.pull = THREE.MathUtils.lerp(this.extractionStartPull, 1, eased);
      this.hero = eased;
      this.openAmount = smoothstep(0.72, 1, progress);
      this.dragX = damp(this.dragX, 0, 6, delta);
      this.emit("archive:progress", { id: this.activeId, progress: Math.max(this.threshold, progress), threshold: this.threshold });
      if (progress >= 1) {
        this.state = "extracted";
        this.pull = 1;
        this.hero = 1;
        this.openAmount = 1;
        return "extracted";
      }
      return null;
    }

    if (this.state === "returning") {
      this.returnTime += delta;
      const progress = clamp(this.returnTime / 1.08, 0, 1);
      const eased = easeInOutCubic(progress);
      this.hero = 1 - eased;
      this.pull = 1 - eased;
      this.openAmount = 1 - smoothstep(0, 0.34, progress);
      this.dragX = damp(this.dragX, 0, 8, delta);
      if (progress >= 1) {
        this.state = "idle";
        this.pull = 0;
        this.hero = 0;
        this.openAmount = 0;
        this.dragX = 0;
        this.dragRaw = 0;
        this.folderById.get(this.activeId)?.setExplored(true);
        this.folders.forEach((folder) => folder.resetImmediate());
        return "returned";
      }
    }
    return null;
  }

  calculateFolderTargets() {
    const activePull = clamp(this.pull, -0.025, 1);
    const physicalPull = Math.max(0, activePull);
    const pressure = smoothstep(0.02, 0.24, physicalPull) * (1 - smoothstep(0.72, 1, physicalPull));

    this.folders.forEach((folder, index) => {
      const target = this.folderTargets[index];
      target.copy(folder.basePosition);

      if (index === this.activeIndex) {
        target.z += activePull * FOLDER_PHYSICS.extractionDistance;
        return;
      }

      // O conjunto reage como uma pilha compacta enquanto a pasta ainda ocupa a caixa.
      target.y += index < this.activeIndex ? pressure * 0.028 : -pressure * 0.018;
      target.z += pressure * 0.045;
    });

    this.folderTargets.forEach((target) => {
      target.x = clamp(
        target.x,
        this.archiveBounds.minX + FOLDER_PHYSICS.halfWidth,
        this.archiveBounds.maxX - FOLDER_PHYSICS.halfWidth
      );
      target.y = clamp(
        target.y,
        this.archiveBounds.floor + FOLDER_PHYSICS.halfHeight,
        this.archiveBounds.ceiling - FOLDER_PHYSICS.halfHeight
      );
      target.z = Math.max(target.z, this.archiveBounds.back + FOLDER_PHYSICS.halfDepth);
    });

    // Mantém a distância vertical mínima enquanto os volumes ainda se sobrepõem em profundidade.
    const minimumCenterGap = FOLDER_PHYSICS.halfHeight * 2 + FOLDER_PHYSICS.minimumGap;
    for (let pass = 0; pass < 3; pass += 1) {
      for (let index = 0; index < this.folderTargets.length - 1; index += 1) {
        const upper = this.folderTargets[index];
        const lower = this.folderTargets[index + 1];
        const depthOverlap =
          Math.abs(upper.z - lower.z) < FOLDER_PHYSICS.halfDepth * 2 + FOLDER_PHYSICS.minimumGap;
        if (!depthOverlap) continue;
        const missing = minimumCenterGap - (upper.y - lower.y);
        if (missing <= 0) continue;

        if (index === this.activeIndex) {
          lower.y = Math.max(this.archiveBounds.floor + FOLDER_PHYSICS.halfHeight, lower.y - missing);
        } else if (index + 1 === this.activeIndex) {
          upper.y = Math.min(this.archiveBounds.ceiling - FOLDER_PHYSICS.halfHeight, upper.y + missing);
        } else {
          upper.y += missing * 0.5;
          lower.y -= missing * 0.5;
        }
      }
    }
  }

  updateObjects(delta) {
    const influence = clamp(Math.max(Math.abs(this.pull), this.hero), 0, 1);
    this.calculateFolderTargets();
    const pointerStrength = ["idle", "settling"].includes(this.state) ? 1 : 0.2;
    this.root.rotation.y = damp(this.root.rotation.y, -0.1 + this.pointerTarget.x * 0.075 * pointerStrength, 5, delta);
    this.root.rotation.x = damp(this.root.rotation.x, -0.025 + this.pointerTarget.y * 0.03 * pointerStrength - influence * 0.02, 5, delta);

    this.folders.forEach((folder, index) => {
      folder.update(delta, {
        active: folder.project.id === this.activeId,
        hover: folder.project.id === this.hoverId ? 1 : 0,
        pull: folder.project.id === this.activeId ? this.pull : 0,
        hero: folder.project.id === this.activeId ? this.hero : 0,
        dragX: this.dragX,
        open: folder.project.id === this.activeId ? this.openAmount : 0,
        influence,
        activeIndex: this.activeIndex,
        state: this.state,
        targetPosition: this.folderTargets[index]
      });
    });

    this.archiveBox.update(delta, { influence, dragX: this.dragX, open: this.openAmount });
    this.emberLight.intensity = damp(this.emberLight.intensity, 22 + influence * 13 - this.openAmount * 8, 5, delta);
    this.keyLight.position.x = damp(this.keyLight.position.x, -4.5 + this.pointerTarget.x * 0.8, 4, delta);

    const baseZ = this.shell.clientWidth < 820 ? 8.15 : 7.2;
    this.camera.position.z = damp(this.camera.position.z, baseZ - this.hero * 0.68, 5, delta);
    this.camera.position.y = damp(this.camera.position.y, (this.shell.clientWidth < 820 ? 4.2 : 3.8) - this.hero * 0.22, 5, delta);
    this.cameraTarget.y = damp(this.cameraTarget.y, -0.12 + this.hero * 0.34, 5, delta);
    this.cameraTarget.z = damp(this.cameraTarget.z, this.hero * 0.4, 5, delta);
    this.camera.lookAt(this.cameraTarget);
  }

  getActiveScreenRect() {
    const folder = this.folderById.get(this.activeId);
    const canvasRect = this.canvas.getBoundingClientRect();
    if (!folder) return canvasRect.toJSON();
    const position = new THREE.Vector3();
    folder.group.getWorldPosition(position);
    position.project(this.camera);
    const centerX = canvasRect.left + (position.x * 0.5 + 0.5) * canvasRect.width;
    const centerY = canvasRect.top + (-position.y * 0.5 + 0.5) * canvasRect.height;
    const width = Math.min(canvasRect.width * 0.82, 720);
    const height = width * 0.58;
    return {
      left: clamp(centerX - width / 2, canvasRect.left + 8, canvasRect.right - width - 8),
      top: clamp(centerY - height / 2, canvasRect.top + 8, canvasRect.bottom - height - 8),
      width,
      height
    };
  }

  resize() {
    const width = Math.max(1, this.canvas.clientWidth || this.shell.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight || 520);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.position.set(0, width < 820 ? 4.2 : 3.8, width < 820 ? 8.15 : 7.2);
    this.cameraTarget.set(0, -0.12, 0);
    this.camera.lookAt(this.cameraTarget);
    this.camera.updateProjectionMatrix();
    this.renderOnce();
  }

  renderOnce() {
    this.scene.updateMatrixWorld(true);
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.frame || !this.active || !this.pageVisible || !this.inViewport || this.state === "open") return;
    this.clock.start();
    const tick = () => {
      if (!this.active || !this.pageVisible || !this.inViewport || this.state === "open") {
        this.frame = null;
        return;
      }
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const completed = this.updateState(delta);
      this.updateObjects(delta);
      this.renderOnce();

      if (completed === "extracted") {
        this.canvas.style.cursor = "default";
        this.emitState("extracted");
        this.emit("archive:extracted", {
          id: this.activeId,
          rect: this.getActiveScreenRect()
        });
        this.frame = null;
        return;
      }
      if (completed === "returned") {
        this.canvas.style.cursor = "grab";
        this.emitState("idle");
        this.emit("archive:returncomplete", { id: this.activeId });
      }
      if (this.reducedMotion) {
        this.frame = null;
        return;
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  getDebugState() {
    const collision = this.getCollisionReport();
    return {
      state: this.state,
      activeId: this.activeId,
      pull: this.pull,
      progress: this.dragRaw,
      hero: this.hero,
      open: this.openAmount,
      pointerCaptured: this.dragPointerId !== null,
      activeFolderVisible: this.activeFolderVisible,
      collision,
      render: { ...this.renderer.info.render }
    };
  }

  getCollisionReport() {
    const boxes = this.folders.map((folder) => folder.getCollisionBox().clone());
    const overlaps = [];
    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        if (boxes[first].intersectsBox(boxes[second])) {
          overlaps.push([this.folders[first].project.id, this.folders[second].project.id]);
        }
      }
    }
    const outOfBounds = this.folders
      .filter((folder, index) => {
        if (index === this.activeIndex && this.pull > 0) return false;
        const box = boxes[index];
        return (
          box.min.x < this.archiveBounds.minX ||
          box.max.x > this.archiveBounds.maxX ||
          box.min.y < this.archiveBounds.floor ||
          box.max.y > this.archiveBounds.ceiling ||
          box.min.z < this.archiveBounds.back ||
          box.max.z > this.archiveBounds.front
        );
      })
      .map((folder) => folder.project.id);
    return {
      overlaps,
      outOfBounds,
      minimumGap: FOLDER_PHYSICS.minimumGap,
      slots: this.folders.map((folder, index) => ({
        id: folder.project.id,
        rest: folder.basePosition.toArray().map((value) => Number(value.toFixed(3))),
        current: folder.group.position.toArray().map((value) => Number(value.toFixed(3))),
        target: this.folderTargets[index].toArray().map((value) => Number(value.toFixed(3)))
      }))
    };
  }

  destroy() {
    this.active = false;
    cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
    this.canvas.removeEventListener("lostpointercapture", this.handleLostPointerCapture);
    this.canvas.removeEventListener("pointerleave", this.handlePointerLeave);
    this.viewportObserver?.disconnect();
    this.folders.forEach((folder) => folder.dispose());
    this.scene.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose?.();
    });
    this.environment?.dispose();
    this.renderer.dispose();
  }
}
