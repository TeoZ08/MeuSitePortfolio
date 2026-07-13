import * as THREE from "three";

export function pedestal(world, width = 1.8, height = 0.72, depth = 1.1, color = 0x46352e) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    world.material(color, { roughness: 0.72, metalness: 0.16 })
  );
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

export function addMonitorStem(world, root, screen, length = 0.68) {
  const stem = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, length, 0.1),
    world.material(0x8f857b, { roughness: 0.25, metalness: 0.78 })
  );
  stem.position.set(screen.position.x, screen.position.y - length * 0.76, screen.position.z - 0.04);
  root.add(stem);
  return stem;
}

export function addEdgeLight(world, root, color, position, size = [1.4, 0.045, 0.045]) {
  const light = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color), toneMapped: false })
  );
  light.position.fromArray(position);
  root.add(light);
  return light;
}
