import * as THREE from "three";

const damp = (current, target, speed, delta) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

function addEdges(mesh, opacity = 0.3) {
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, 24),
    new THREE.LineBasicMaterial({ color: 0x130b09, transparent: true, opacity })
  );
  lines.raycast = () => {};
  mesh.add(lines);
}

export class ArchiveBox {
  constructor(root) {
    this.group = new THREE.Group();
    this.group.name = "archive-box";
    root.add(this.group);

    const charcoal = new THREE.MeshStandardMaterial({
      color: 0x211512,
      roughness: 0.86,
      metalness: 0.08,
      envMapIntensity: 0.26
    });
    const inner = new THREE.MeshStandardMaterial({
      color: 0x3b2821,
      roughness: 0.93,
      metalness: 0.02
    });
    const paperEdge = new THREE.MeshStandardMaterial({
      color: 0xb8a384,
      roughness: 0.98,
      metalness: 0
    });

    this.base = new THREE.Mesh(new THREE.BoxGeometry(4.72, 0.2, 2.82), inner);
    this.base.position.set(0, -0.78, -0.04);
    this.base.receiveShadow = true;
    this.base.castShadow = true;
    addEdges(this.base, 0.38);
    this.group.add(this.base);

    this.back = new THREE.Mesh(new THREE.BoxGeometry(4.72, 0.9, 0.18), charcoal);
    this.back.position.set(0, -0.38, -1.43);
    this.back.castShadow = true;
    this.back.receiveShadow = true;
    addEdges(this.back, 0.36);
    this.group.add(this.back);

    this.left = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.82, 2.78), charcoal);
    this.left.position.set(-2.27, -0.43, -0.04);
    this.left.castShadow = true;
    addEdges(this.left, 0.36);
    this.group.add(this.left);

    this.right = this.left.clone();
    this.right.material = charcoal;
    this.right.position.x = 2.27;
    this.group.add(this.right);

    // A borda frontal fica abaixo do canal de extração; não intercepta o volume da pasta inferior.
    this.frontLip = new THREE.Mesh(new THREE.BoxGeometry(4.72, 0.18, 0.15), charcoal);
    this.frontLip.position.set(0, -0.79, 1.34);
    this.frontLip.castShadow = true;
    addEdges(this.frontLip, 0.34);
    this.group.add(this.frontLip);

    const foldGeometry = new THREE.BoxGeometry(0.12, 0.78, 0.12);
    for (const x of [-2.16, 2.16]) {
      const fold = new THREE.Mesh(foldGeometry, paperEdge);
      fold.position.set(x, -0.43, 1.25);
      fold.rotation.z = x < 0 ? -0.045 : 0.045;
      this.group.add(fold);
    }

  }

  update(delta, { influence, dragX }) {
    const controlledLean = THREE.MathUtils.clamp(dragX, -0.42, 0.42);
    this.group.rotation.z = damp(this.group.rotation.z, -controlledLean * influence * 0.012, 7, delta);
    this.group.rotation.x = damp(this.group.rotation.x, -influence * 0.01, 7, delta);
  }
}
