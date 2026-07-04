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

function createCord(material, points, radius = 0.028) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, "centripetal");
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 72, radius, 8, false), material);
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

    this.cordMaterial = new THREE.MeshStandardMaterial({
      color: 0xa92e22,
      roughness: 0.5,
      metalness: 0.02,
      emissive: 0x260300,
      emissiveIntensity: 0.22
    });
    this.cordGroup = new THREE.Group();
    this.cordGroup.position.set(0, -0.02, 0.04);
    this.group.add(this.cordGroup);

    this.cordGroup.add(
      createCord(this.cordMaterial, [
        [-2.35, -0.42, 1.05],
        [-1.55, -0.12, 1.3],
        [-0.4, 0.05, 1.2],
        [0.7, -0.03, 1.3],
        [2.34, -0.38, 1.02]
      ]),
      createCord(this.cordMaterial, [
        [-2.2, -0.26, -1.33],
        [-1.1, -0.04, -1.48],
        [0.2, 0.03, -1.42],
        [1.25, -0.08, -1.5],
        [2.2, -0.3, -1.28]
      ], 0.022)
    );

    this.knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.11, 0.032, 48, 8), this.cordMaterial);
    this.knot.position.set(1.55, -0.02, 1.25);
    this.knot.scale.set(1, 0.62, 1);
    this.cordGroup.add(this.knot);
  }

  update(delta, { influence, dragX, open }) {
    const controlledLean = THREE.MathUtils.clamp(dragX, -0.42, 0.42);
    this.group.rotation.z = damp(this.group.rotation.z, -controlledLean * influence * 0.012, 7, delta);
    this.group.rotation.x = damp(this.group.rotation.x, -influence * 0.01, 7, delta);
    this.cordGroup.rotation.z = damp(this.cordGroup.rotation.z, controlledLean * influence * 0.045, 8, delta);
    this.cordGroup.position.y = damp(this.cordGroup.position.y, influence * 0.12 - open * 0.08, 9, delta);
    this.cordGroup.scale.z = damp(this.cordGroup.scale.z, 1 + influence * 0.14, 8, delta);
    this.knot.rotation.y += delta * influence * 0.9;
    this.cordMaterial.emissiveIntensity = damp(this.cordMaterial.emissiveIntensity, 0.22 + influence * 0.28, 6, delta);
  }
}
