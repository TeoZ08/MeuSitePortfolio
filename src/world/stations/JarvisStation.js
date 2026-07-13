import * as THREE from "three";
import { addEdgeLight, addMonitorStem, pedestal } from "./shared.js";

export async function buildJarvisStation(world, root, project, index) {
  const desk = pedestal(world, 3.75, 0.74, 1.3);
  desk.position.set(0.25, 0.48, 1.72);
  root.add(desk);

  const chat = world.screen(project.gallery[0].src, 1.82, 1.03, index, 0);
  chat.position.set(-0.1, 2.18, 0.53);
  chat.rotation.y = 0.05;
  root.add(chat);
  addMonitorStem(world, root, chat, 0.68);

  const evidence = world.screen(project.gallery[2].src, 1.35, 0.76, index, 2);
  evidence.position.set(1.45, 1.83, 0.8);
  evidence.rotation.y = -0.14;
  root.add(evidence);
  addMonitorStem(world, root, evidence, 0.56);

  const scanner = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.18, 0.68),
    world.material(0x262322, { roughness: 0.5, metalness: 0.38 })
  );
  scanner.position.set(-1.45, 1.02, 1.95);
  root.add(scanner);
  for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
    const page = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.012, 0.78),
      world.material(0xeadfc9, { roughness: 0.96, metalness: 0 })
    );
    page.position.set(-1.45 + pageIndex * 0.015, 1.14 + pageIndex * 0.014, 1.7 - pageIndex * 0.028);
    page.rotation.y = 0.08 - pageIndex * 0.025;
    root.add(page);
  }
  addEdgeLight(world, root, project.color, [0.72, 1.02, 2.39]);

  const evaScene = await world.loadModel("models/jarvis-eva.glb");
  evaScene.getObjectByName("Plane001")?.removeFromParent();
  world.prepareModel(evaScene);
  evaScene.traverse((child) => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.filter(Boolean).forEach((material) => {
      material.side = THREE.DoubleSide;
      material.roughness = Math.max(material.roughness ?? 0.4, 0.32);
      if (material.name === "Putih") material.color?.set(0xe9e6e2);
      if (["Material.006", "Material.002"].includes(material.name)) material.color?.set(0x0b0b10);
      if (material.name === "Material.001") {
        material.color?.set(0x171420);
        material.metalness = 0.42;
        material.roughness = 0.2;
      }
      if (material.name === "Material.004") {
        material.color?.set(project.color);
        material.emissive = new THREE.Color(project.color);
        material.emissiveIntensity = 1.1;
      }
    });
  });
  const eva = world.normalizeModel(evaScene, 1.28, "y");
  eva.position.set(-1.48, 1.18, 1.1);
  eva.rotation.y = 0.06;
  root.add(eva);
  root.userData.floatables.push({ object: eva, baseY: eva.position.y, amount: 0.045, speed: 1.05 });
  root.userData.rotators.push({ object: eva, base: eva.rotation.y, amount: 0.055, speed: 0.48 });

  const evaLight = new THREE.PointLight(new THREE.Color(project.color), 8, 2.8, 2);
  evaLight.position.set(-1.48, 2.0, 1.75);
  root.add(evaLight);
}
