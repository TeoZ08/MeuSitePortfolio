import * as THREE from "three";
import { addMonitorStem, pedestal } from "./shared.js";

export async function buildUnapiStation(world, root, project, index) {
  const desk = pedestal(world, 3.9, 0.74, 1.55);
  desk.position.set(0, 0.47, 1.72);
  root.add(desk);

  const home = world.screen(project.gallery[0].src, 1.75, 0.99, index, 0);
  home.position.set(0.85, 2.28, 0.48);
  home.rotation.y = -0.08;
  root.add(home);
  addMonitorStem(world, root, home, 0.72);

  const practice = world.screen(project.gallery[1].src, 1.24, 0.7, index, 1);
  practice.position.set(-1.35, 2.18, 0.72);
  practice.rotation.y = 0.12;
  root.add(practice);
  addMonitorStem(world, root, practice, 0.54);

  const keyboardScene = await world.loadModel("models/unapi-keyboard.glb");
  // O arquivo trazia um plano de apresentação junto do teclado. Esse plano
  // crescia com a normalização e cobria todo o estande.
  keyboardScene.getObjectByName("Plane")?.removeFromParent();
  world.prepareModel(keyboardScene);
  keyboardScene.traverse((child) => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.filter(Boolean).forEach((material) => {
      material.side = THREE.DoubleSide;
      material.roughness = material.name === "TextKey" ? 0.48 : 0.62;
      material.metalness = material.name === "TextKey" ? 0.08 : 0.16;
      if (material.name === "Key") material.color?.set(0x99938a);
      if (material.name === "TextKey") material.color?.set(0xfffbf1);
    });
  });
  const keyboardMat = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.055, 1.42),
    world.material(0x171314, { roughness: 0.72, metalness: 0.16 })
  );
  keyboardMat.position.set(-0.34, 0.85, 2.02);
  root.add(keyboardMat);

  const keyboard = world.normalizeModel(keyboardScene, 3.12, "x");
  keyboard.position.set(-0.34, 0.9, 2.02);
  keyboard.rotation.x = 0.34;
  keyboard.rotation.z = -0.025;
  keyboard.userData.baseY = keyboard.position.y;
  root.add(keyboard);
  root.userData.keyboard = keyboard;

  const mouse = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.31, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62),
    world.material(0xd6d0c7, { roughness: 0.42, metalness: 0.12 })
  );
  shell.scale.set(0.72, 1.05, 1.08);
  shell.rotation.x = -Math.PI / 2;
  mouse.add(shell);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12), world.material(project.color, { roughness: 0.36 }));
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(0, 0.21, -0.06);
  mouse.add(wheel);
  mouse.position.set(1.48, 0.96, 2.05);
  root.add(mouse);

  const beacon = new THREE.PointLight(new THREE.Color(project.color), 5.5, 3.5, 2);
  beacon.position.set(-0.35, 1.15, 2.25);
  root.add(beacon);
  root.userData.beacon = beacon;
}
