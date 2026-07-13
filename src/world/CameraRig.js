import * as THREE from "three";

const damp = (current, target, speed, delta) => THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));
const ease = (value) => 1 - Math.pow(1 - value, 3);

export class CameraRig {
  constructor(camera, reducedMotion = false) {
    this.camera = camera;
    this.reducedMotion = reducedMotion;
    // A abertura olha para o botão, e não para a sala inteira. O movimento de
    // entrada então revela o hub como uma segunda cena.
    this.position = new THREE.Vector3(0, 3.45, 15.9);
    this.look = new THREE.Vector3(0, 1.65, 9.1);
    this.currentPosition = this.position.clone();
    this.currentLook = this.look.clone();
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    this.playerPosition = new THREE.Vector3(0, 1.28, 2.2);
    this.mode = "start";
    this.transition = null;
    this.camera.position.copy(this.position);
    this.camera.lookAt(this.look);
  }

  setMode(mode) {
    this.mode = mode;
  }

  setPointer(x, y) {
    this.pointerTarget.set(x, y);
  }

  setPlayerPosition(position) {
    this.playerPosition.copy(position);
  }

  snap(position, look) {
    this.position.copy(position);
    this.look.copy(look);
    this.currentPosition.copy(position);
    this.currentLook.copy(look);
    this.camera.position.copy(position);
    this.camera.lookAt(look);
  }

  moveTo(position, look, duration = 1.35, lift = 1.7) {
    if (this.reducedMotion) {
      this.snap(position, look);
      return Promise.resolve();
    }

    if (this.transition?.resolve) this.transition.resolve();
    const start = this.currentPosition.clone();
    const startLook = this.currentLook.clone();
    const control = start.clone().lerp(position, 0.5);
    control.y = Math.max(start.y, position.y) + lift;
    control.z += Math.max(0, (start.z - position.z) * 0.08);
    const curve = new THREE.QuadraticBezierCurve3(start, control, position.clone());

    return new Promise((resolve) => {
      this.transition = {
        elapsed: 0,
        duration,
        curve,
        startLook,
        endLook: look.clone(),
        resolve
      };
    });
  }

  update(delta, elapsed) {
    this.pointer.x = damp(this.pointer.x, this.pointerTarget.x, 4.2, delta);
    this.pointer.y = damp(this.pointer.y, this.pointerTarget.y, 4.2, delta);

    if (this.transition) {
      this.transition.elapsed += delta;
      const raw = Math.min(1, this.transition.elapsed / this.transition.duration);
      const progress = ease(raw);
      this.currentPosition.copy(this.transition.curve.getPoint(progress));
      this.currentLook.copy(this.transition.startLook).lerp(this.transition.endLook, progress);

      if (raw >= 1) {
        this.position.copy(this.currentPosition);
        this.look.copy(this.currentLook);
        const { resolve } = this.transition;
        this.transition = null;
        resolve();
      }
    } else {
      const startDrift = this.mode === "start" ? Math.sin(elapsed * 0.18) * 0.16 : 0;
      this.currentPosition.x = damp(this.currentPosition.x, this.position.x + startDrift, 3.6, delta);
      this.currentPosition.y = damp(this.currentPosition.y, this.position.y, 3.6, delta);
      this.currentPosition.z = damp(this.currentPosition.z, this.position.z, 3.6, delta);
      this.currentLook.lerp(this.look, 1 - Math.exp(-3.6 * delta));
    }

    const hub = this.mode === "hub";
    const project = this.mode === "project";
    const amountX = hub ? 0.58 : project ? 0.15 : this.mode === "start" ? 0.18 : 0.04;
    const amountY = hub ? 0.22 : project ? 0.07 : 0.04;
    const lookX = hub ? 0.92 : project ? 0.2 : 0.12;
    const lookY = hub ? 0.32 : project ? 0.08 : 0.05;
    const playerX = hub ? this.playerPosition.x : 0;
    const playerZ = hub ? this.playerPosition.z - 2.2 : 0;
    const followCameraX = playerX * 0.12;
    const followCameraZ = playerZ * 0.045;

    this.camera.position.set(
      this.currentPosition.x + this.pointer.x * amountX + followCameraX,
      this.currentPosition.y + this.pointer.y * amountY,
      this.currentPosition.z + followCameraZ
    );
    const target = this.currentLook.clone();
    target.x += this.pointer.x * lookX + playerX * 0.22;
    target.y += this.pointer.y * lookY;
    target.z += playerZ * 0.12;
    this.camera.lookAt(target);
  }
}
