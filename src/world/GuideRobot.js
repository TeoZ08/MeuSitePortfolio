import * as THREE from "three";

const damp = (current, target, speed, delta) => THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

export class GuideRobot {
  constructor(object, accent = new THREE.Color("#b8392c")) {
    this.root = new THREE.Group();
    this.model = object;
    this.root.add(object);
    this.root.position.set(0, 1.28, 2.2);
    this.home = this.root.position.clone();
    this.hubPosition = this.home.clone();
    this.targetPosition = this.home.clone();
    this.baseY = this.root.position.y;
    this.pointer = new THREE.Vector2();
    // O olho do GLB aponta para +Z. A rotação anterior de PI exibia sempre a
    // parte traseira do robô para quem entrava na sala.
    this.targetYaw = 0;
    this.awake = 0;
    this.targetAwake = 0.12;
    this.targetScale = 1;
    this.manualStrength = 0;
    this.movementSpeed = 4.2;
    this.accent = accent.clone();
    this.targetAccent = accent.clone();
    this.light = new THREE.PointLight(accent, 0, 5.5, 2);
    this.light.position.set(0, 0.58, 0.45);
    this.root.add(this.light);

    this.eye = object.getObjectByName("eye");
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach((material) => {
        const name = material.name?.toLowerCase() ?? "";
        material.side = THREE.DoubleSide;
        if (name === "armor") {
          material.color?.set(0xe6e2dc);
          material.roughness = 0.36;
          material.metalness = 0.22;
        }
        if (name === "body") material.color?.set(0x24242b);
        if (name === "glass") {
          material.color?.set(0x172334);
          material.roughness = 0.08;
          material.metalness = 0.18;
          material.transparent = true;
          material.opacity = 0.34;
          material.depthWrite = false;
          child.renderOrder = 2;
        }
        if (name.includes("eye") || name.includes("light")) {
          material.color?.set(0x120806);
          material.emissive = this.accent.clone();
          material.emissiveIntensity = 0.5;
          material.depthWrite = false;
          child.renderOrder = 3;
        }
      });
    });
  }

  wake() {
    this.targetAwake = 1;
  }

  sleep() {
    this.targetAwake = 0.12;
  }

  setPointer(pointer) {
    this.pointer.copy(pointer);
  }

  lookAt(worldPosition) {
    const direction = worldPosition.clone().sub(this.root.position);
    this.targetYaw = Math.atan2(direction.x, direction.z);
  }

  setDestination(position, accent) {
    this.targetPosition.copy(position);
    if (accent) this.targetAccent.set(accent);
  }

  rememberHubPosition() {
    this.hubPosition.copy(this.targetPosition);
  }

  returnToHubPosition() {
    this.targetPosition.copy(this.hubPosition);
    this.targetAccent.set("#b8392c");
  }

  setPresentationMode(active) {
    this.targetScale = active ? 0.62 : 1;
  }

  move(directionX, directionZ, delta, center, maxRadius = 8.6) {
    const length = Math.hypot(directionX, directionZ);
    if (length < 0.001) return false;

    const x = directionX / length;
    const z = directionZ / length;
    this.targetPosition.x += x * this.movementSpeed * delta;
    this.targetPosition.z += z * this.movementSpeed * delta;
    this.targetPosition.y = this.home.y;

    const offset = new THREE.Vector2(
      this.targetPosition.x - center.x,
      this.targetPosition.z - center.z
    );
    if (offset.length() > maxRadius) {
      offset.setLength(maxRadius);
      this.targetPosition.x = center.x + offset.x;
      this.targetPosition.z = center.z + offset.y;
    }

    this.hubPosition.copy(this.targetPosition);
    this.targetYaw = Math.atan2(x, z);
    this.manualStrength = 1;
    return true;
  }

  update(delta, elapsed) {
    this.awake = damp(this.awake, this.targetAwake, 3.4, delta);
    this.manualStrength = damp(this.manualStrength, 0, 3.5, delta);
    const movementDamping = 3.2 + this.manualStrength * 7.5;
    this.root.position.x = damp(this.root.position.x, this.targetPosition.x, movementDamping, delta);
    this.root.position.z = damp(this.root.position.z, this.targetPosition.z, movementDamping, delta);
    this.baseY = damp(this.baseY, this.targetPosition.y, movementDamping, delta);
    this.root.position.y = this.baseY + Math.sin(elapsed * 1.25) * 0.055 * this.awake;
    this.root.rotation.y = damp(this.root.rotation.y, this.targetYaw + this.pointer.x * 0.12, 3.6, delta);
    this.root.rotation.z = Math.sin(elapsed * 0.72) * 0.025 * this.awake;
    const scale = damp(this.root.scale.x, this.targetScale, 5, delta);
    this.root.scale.setScalar(scale);
    this.accent.lerp(this.targetAccent, 1 - Math.exp(-3.4 * delta));
    this.light.color.copy(this.accent);
    this.light.intensity = damp(this.light.intensity, 10 * this.awake, 4, delta);

    this.model.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach((material) => {
        if (!material.name?.toLowerCase().match(/eye|light/)) return;
        material.emissive?.copy(this.accent);
        material.emissiveIntensity = 0.25 + this.awake * 2.1;
      });
    });
  }
}
