import * as THREE from "three";

const damp = (current, target, speed, delta) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

export const FOLDER_PHYSICS = Object.freeze({
  width: 3.9,
  depth: 2.38,
  halfWidth: 2.01,
  halfDepth: 1.215,
  halfHeight: 0.075,
  slotPitch: 0.17,
  minimumGap: 0.02,
  extractionDistance: 2.72
});

function seededRandom(seed) {
  let value = seed || 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createPaperTexture(color, seed) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const random = seededRandom(seed + 31);
  const base = new THREE.Color(color);

  context.fillStyle = base.getStyle();
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 520; index += 1) {
    const alpha = 0.018 + random() * 0.05;
    const light = random() > 0.48;
    context.fillStyle = light
      ? `rgba(255, 246, 224, ${alpha})`
      : `rgba(38, 20, 15, ${alpha})`;
    const size = 0.4 + random() * 1.8;
    context.fillRect(random() * 256, random() * 256, size, size);
  }

  context.globalAlpha = 0.08;
  context.strokeStyle = "#3e211a";
  context.lineWidth = 0.5;
  for (let index = 0; index < 18; index += 1) {
    const y = random() * 256;
    context.beginPath();
    context.moveTo(random() * 50, y);
    context.bezierCurveTo(70, y + random() * 3, 190, y - random() * 3, 256, y);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.35, 1.1);
  return texture;
}

function createLabelTexture(project) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 360;
  const context = canvas.getContext("2d");
  context.fillStyle = "#efe2cc";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(42, 25, 20, 0.42)";
  context.lineWidth = 3;
  context.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

  context.fillStyle = "#a92e22";
  context.font = "600 44px monospace";
  context.fillText(project.index, 58, 76);
  context.fillStyle = "#1a1210";
  context.font = "700 104px Georgia, serif";
  context.fillText(project.shortTitle, 54, 205);
  context.fillStyle = "#55443c";
  context.font = "500 25px monospace";
  context.fillText(project.kind.toUpperCase(), 58, 278);

  context.strokeStyle = "rgba(169, 46, 34, 0.38)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(58, 310);
  context.lineTo(420, 310);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(256, 128, 18, 256, 128, 244);
  gradient.addColorStop(0, "rgba(13, 7, 5, 0.38)");
  gradient.addColorStop(0.55, "rgba(13, 7, 5, 0.17)");
  gradient.addColorStop(1, "rgba(13, 7, 5, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 256);
  return new THREE.CanvasTexture(canvas);
}

function addEdges(mesh, opacity = 0.28) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, 24),
    new THREE.LineBasicMaterial({ color: 0x2b1813, transparent: true, opacity })
  );
  edges.raycast = () => {};
  mesh.add(edges);
}

export class ArchiveFolder {
  constructor(project, index, renderer) {
    this.project = project;
    this.index = index;
    this.renderer = renderer;
    this.group = new THREE.Group();
    this.group.name = `folder-${project.id}`;
    this.raycastMeshes = [];
    this.previewTexture = null;
    this.previewPromise = null;
    this.explored = false;

    this.basePosition = new THREE.Vector3(
      (index - 1.5) * 0.022,
      0.01 - index * FOLDER_PHYSICS.slotPitch,
      -0.045 - index * 0.022
    );
    this.group.position.copy(this.basePosition);
    this.baseRotationY = (index - 1.5) * 0.009;
    this.baseRotationZ = 0;
    this.group.rotation.set(0, this.baseRotationY, this.baseRotationZ);

    this.collisionHalfSize = new THREE.Vector3(
      FOLDER_PHYSICS.halfWidth,
      FOLDER_PHYSICS.halfHeight,
      FOLDER_PHYSICS.halfDepth
    );
    this.collisionBox = new THREE.Box3();

    const folderTexture = createPaperTexture(project.folder, index + 5);
    folderTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    this.folderTexture = folderTexture;

    this.folderMaterial = new THREE.MeshStandardMaterial({
      map: folderTexture,
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0.015,
      envMapIntensity: 0.22
    });
    this.foldMaterial = this.folderMaterial.clone();
    this.foldMaterial.color.set(0xe8d9c0);
    this.paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xeadbc2,
      roughness: 0.97,
      metalness: 0,
      side: THREE.DoubleSide
    });

    this.shadowTexture = createShadowTexture();
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.45, 2.72),
      new THREE.MeshBasicMaterial({
        map: this.shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.42
      })
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(0, -0.052, 0.12);
    this.group.add(this.shadow);

    this.base = new THREE.Mesh(
      new THREE.BoxGeometry(FOLDER_PHYSICS.width, 0.075, FOLDER_PHYSICS.depth),
      this.folderMaterial
    );
    this.base.castShadow = true;
    this.base.receiveShadow = true;
    this.addRaycastMesh(this.base);
    addEdges(this.base, 0.32);
    this.group.add(this.base);

    this.innerSheet = new THREE.Mesh(new THREE.PlaneGeometry(3.56, 2.02), this.paperMaterial);
    this.innerSheet.rotation.x = -Math.PI / 2;
    this.innerSheet.position.set(0, 0.04, 0.08);
    this.innerSheet.receiveShadow = true;
    this.group.add(this.innerSheet);

    this.previewMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.preview = new THREE.Mesh(new THREE.PlaneGeometry(3.26, 1.76), this.previewMaterial);
    this.preview.rotation.x = -Math.PI / 2;
    this.preview.position.set(0, 0.046, 0.12);
    this.group.add(this.preview);

    this.coverPivot = new THREE.Group();
    this.coverPivot.position.set(0, 0.044, -1.18);
    this.group.add(this.coverPivot);

    this.cover = new THREE.Mesh(
      new THREE.BoxGeometry(FOLDER_PHYSICS.width, 0.05, FOLDER_PHYSICS.depth),
      this.folderMaterial
    );
    this.cover.position.set(0, 0.025, 1.19);
    this.cover.castShadow = true;
    this.cover.receiveShadow = true;
    this.addRaycastMesh(this.cover);
    addEdges(this.cover, 0.34);
    this.coverPivot.add(this.cover);

    this.tab = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.055, 0.42), this.folderMaterial);
    this.tab.position.set(-1.32 + index * 0.72, 0.029, 0.18);
    this.tab.castShadow = true;
    this.addRaycastMesh(this.tab);
    addEdges(this.tab, 0.28);
    this.coverPivot.add(this.tab);

    this.labelBackingMaterial = new THREE.MeshBasicMaterial({ color: 0xe8d9c0, side: THREE.DoubleSide });
    this.labelRestColor = new THREE.Color(0xe8d9c0);
    this.labelActiveColor = new THREE.Color(0xfff4df);
    this.labelBacking = new THREE.Mesh(new THREE.PlaneGeometry(3.05, 1.03), this.labelBackingMaterial);
    this.labelBacking.rotation.x = -Math.PI / 2;
    this.labelBacking.position.set(-0.12, 0.052, 1.2);
    this.coverPivot.add(this.labelBacking);

    this.labelTexture = createLabelTexture(project);
    this.labelTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    this.labelMaterial = new THREE.MeshBasicMaterial({
      map: this.labelTexture,
      transparent: false,
      depthTest: true,
      depthWrite: true,
      side: THREE.DoubleSide
    });
    this.label = new THREE.Mesh(new THREE.PlaneGeometry(2.92, 0.91), this.labelMaterial);
    this.label.rotation.x = -Math.PI / 2;
    this.label.position.set(-0.12, 0.053, 1.2);
    this.addRaycastMesh(this.label);
    this.coverPivot.add(this.label);

    this.progressTrack = new THREE.Mesh(
      new THREE.PlaneGeometry(2.72, 0.055),
      new THREE.MeshBasicMaterial({ color: 0x2a1814, transparent: true, opacity: 0.24, side: THREE.DoubleSide })
    );
    this.progressTrack.rotation.x = -Math.PI / 2;
    this.progressTrack.position.set(-0.1, 0.055, 1.65);
    this.progressTrack.visible = false;
    this.coverPivot.add(this.progressTrack);

    this.progressBar = new THREE.Mesh(
      new THREE.PlaneGeometry(2.72, 0.055),
      new THREE.MeshBasicMaterial({ color: 0xa92e22, side: THREE.DoubleSide })
    );
    this.progressBar.rotation.x = -Math.PI / 2;
    this.progressBar.position.set(-1.46, 0.056, 1.65);
    this.progressBar.scale.x = 0.001;
    this.progressBar.visible = false;
    this.coverPivot.add(this.progressBar);

    this.stamp = new THREE.Mesh(
      new THREE.RingGeometry(0.13, 0.16, 32),
      new THREE.MeshBasicMaterial({ color: 0x8f281f, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
    );
    this.stamp.rotation.x = -Math.PI / 2;
    this.stamp.position.set(1.38, 0.057, 1.47);
    this.stamp.visible = false;
    this.coverPivot.add(this.stamp);
  }

  addRaycastMesh(mesh) {
    mesh.userData.projectId = this.project.id;
    this.raycastMeshes.push(mesh);
  }

  ensurePreview() {
    if (this.previewTexture) return Promise.resolve(this.previewTexture);
    if (this.previewPromise) return this.previewPromise;
    this.previewPromise = new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        this.project.images[0].src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 4);
          this.previewTexture = texture;
          this.previewMaterial.map = texture;
          this.previewMaterial.needsUpdate = true;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
    return this.previewPromise;
  }

  setExplored(value = true) {
    this.explored = value;
    this.stamp.visible = value;
  }

  getCollisionBox(position = this.group.position) {
    this.collisionBox.min.copy(position).sub(this.collisionHalfSize);
    this.collisionBox.max.copy(position).add(this.collisionHalfSize);
    return this.collisionBox;
  }

  update(delta, context) {
    const {
      active,
      hover,
      pull,
      hero,
      dragX,
      open,
      influence,
      activeIndex,
      state,
      targetPosition
    } = context;

    const isManipulated = active && (state === "dragging" || state === "extracting" || state === "open" || state === "returning");
    const hoverAmount = active && !isManipulated ? hover : 0;
    let targetX = targetPosition?.x ?? this.basePosition.x;
    let targetY = targetPosition?.y ?? this.basePosition.y;
    let targetZ = targetPosition?.z ?? this.basePosition.z;
    let targetScale = 1;
    let targetRotationZ = this.baseRotationZ;
    let targetRotationY = this.baseRotationY;

    if (active) {
      const clearOfBox = THREE.MathUtils.smoothstep(hero, 0.72, 1);
      targetScale = 1 + clearOfBox * 0.09;
      targetRotationZ = -dragX * 0.012 * (1 - clearOfBox);
      targetRotationY = this.baseRotationY * (1 - hero);
    }

    const speed = state === "returning" ? 10 : state === "extracting" ? 11 : 13;
    this.group.position.x = damp(this.group.position.x, targetX, speed, delta);
    this.group.position.y = damp(this.group.position.y, targetY, speed, delta);
    this.group.position.z = damp(this.group.position.z, targetZ, speed, delta);
    this.group.rotation.z = damp(this.group.rotation.z, targetRotationZ, 11, delta);
    this.group.rotation.y = damp(this.group.rotation.y, targetRotationY, 11, delta);
    const scale = damp(this.group.scale.x, targetScale, 10, delta);
    this.group.scale.setScalar(scale);

    this.coverPivot.rotation.x = damp(this.coverPivot.rotation.x, -open * 1.08, 10, delta);
    this.previewMaterial.opacity = damp(this.previewMaterial.opacity, open, 10, delta);
    this.labelBackingMaterial.color.lerpColors(
      this.labelRestColor,
      this.labelActiveColor,
      THREE.MathUtils.clamp(hoverAmount + pull * 0.7, 0, 1)
    );

    const progressVisible = active && (state === "dragging" || state === "extracting");
    this.progressTrack.visible = progressVisible;
    this.progressBar.visible = progressVisible;
    const progress = THREE.MathUtils.clamp(pull, 0.001, 1);
    this.progressBar.scale.x = progress;
    this.progressBar.position.x = -1.46 + 1.36 * progress;

    this.shadow.material.opacity = damp(this.shadow.material.opacity, active ? 0.28 - hero * 0.14 : 0.4, 8, delta);
    this.stamp.visible = this.explored && open < 0.2;
  }

  resetImmediate() {
    this.group.position.copy(this.basePosition);
    this.group.rotation.set(0, this.baseRotationY, this.baseRotationZ);
    this.group.scale.setScalar(1);
    this.coverPivot.rotation.x = 0;
    this.previewMaterial.opacity = 0;
    this.progressTrack.visible = false;
    this.progressBar.visible = false;
  }

  dispose() {
    this.previewTexture?.dispose();
    this.folderTexture.dispose();
    this.labelTexture.dispose();
    this.shadowTexture.dispose();
  }
}
