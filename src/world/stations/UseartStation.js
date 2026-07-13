import * as THREE from "three";
import { addEdgeLight, pedestal } from "./shared.js";

export async function buildUseartStation(world, root, project, index) {
  const display = pedestal(world, 1.75, 0.68, 1.35);
  display.position.set(-1.05, 0.45, 1.62);
  root.add(display);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.025, 10, 64),
    new THREE.MeshBasicMaterial({ color: project.color, transparent: true, opacity: 0.46, toneMapped: false })
  );
  halo.position.set(-1.05, 2.05, 0.22);
  root.add(halo);

  const product = world.screen(project.gallery[1].src, 1.55, 0.87, index, 1);
  product.position.set(1.25, 2.55, 0.42);
  product.rotation.y = -0.09;
  root.add(product);

  const checkout = world.screen(project.gallery[3].src, 1.3, 0.73, index, 3);
  checkout.position.set(1.38, 1.37, 0.75);
  checkout.rotation.y = -0.14;
  root.add(checkout);
  addEdgeLight(world, root, project.color, [1.36, 0.96, 1.22], [1.45, 0.04, 0.04]);

  const model = await world.loadModel("models/useart-shirt.glb");
  world.prepareModel(model);
  const shirt = world.normalizeModel(model, 2.48, "y");
  shirt.position.set(-1.05, 0.76, 1.6);
  shirt.rotation.y = -0.18;
  root.add(shirt);
  root.userData.floatables.push({ object: shirt, baseY: shirt.position.y, amount: 0.035, speed: 0.82 });
  root.userData.rotators.push({ object: shirt, base: shirt.rotation.y, amount: 0.08, speed: 0.3 });
}
