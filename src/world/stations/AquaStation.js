import * as THREE from "three";
import { addMonitorStem, pedestal } from "./shared.js";

export async function buildAquaStation(world, root, project, index) {
  const model = await world.loadModel("models/aqua-pipes.glb");
  // O GLB contém duas redes completas. Usamos o primeiro conjunto até a
  // segunda válvula, suficiente para ler a tubulação sem invadir os monitores.
  const visibleParts = new Set([
    "tube2001", "tube_turn001", "tube_wheel001", "tube2002",
    "tube_turn002", "tube_turn003", "tube_turn004", "tube_turn005",
    "tube001", "tube_turn006", "tube_split001", "tube_turn007",
    "tube_turn008", "tube_wheel002"
  ]);
  [...model.children].forEach((child) => {
    if (!visibleParts.has(child.name)) child.removeFromParent();
  });
  const pipeMaterial = world.material(0x3d9fa2, { roughness: 0.3, metalness: 0.58, emissive: 0x0b3b3c, emissiveIntensity: 0.38 });
  const valveMaterial = world.material(0xc95a48, { roughness: 0.34, metalness: 0.46, emissive: 0x45140f, emissiveIntensity: 0.22 });
  pipeMaterial.side = THREE.DoubleSide;
  valveMaterial.side = THREE.DoubleSide;
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.material = child.name.toLowerCase().includes("wheel") ? valveMaterial : pipeMaterial;
    child.castShadow = true;
    child.receiveShadow = true;
    if (child.name.toLowerCase().includes("wheel")) root.userData.valves.push(child);
  });
  const pipes = world.normalizeModel(model, 2.18, "y");
  pipes.position.set(-0.92, 0.63, 1.05);
  pipes.rotation.y = -0.18;
  root.add(pipes);

  const pipeLight = new THREE.PointLight(new THREE.Color(project.color), 8, 4.2, 2);
  pipeLight.position.set(-1.2, 2.3, 2.35);
  root.add(pipeLight);

  const meter = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.18, 32),
    world.material(0xd2c6b5, { roughness: 0.42, metalness: 0.34 })
  );
  body.rotation.x = Math.PI / 2;
  meter.add(body);
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.34, 32),
    new THREE.MeshPhysicalMaterial({ color: 0xbbe9e7, transmission: 0.15, transparent: true, opacity: 0.9, roughness: 0.16 })
  );
  face.position.z = 0.11;
  meter.add(face);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.25, 0.016), valveMaterial);
  needle.position.z = 0.125;
  needle.rotation.z = -0.5;
  meter.add(needle);
  meter.position.set(0.5, 1.5, 1.35);
  root.add(meter);
  root.userData.needles.push(needle);

  const stand = pedestal(world, 1.7, 0.66, 1.1);
  stand.position.set(1.35, 0.42, 1.72);
  root.add(stand);
  const map = world.screen(project.gallery[2].src, 1.5, 0.84, index, 2);
  map.position.set(1.34, 2.55, 0.52);
  map.rotation.y = -0.09;
  root.add(map);
  addMonitorStem(world, root, map, 0.66);
  const indicators = world.screen(project.gallery[3].src, 1.28, 0.72, index, 3);
  indicators.position.set(1.38, 1.46, 0.82);
  indicators.rotation.y = -0.12;
  root.add(indicators);

  const flowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.72, 0.92, 1.7),
    new THREE.Vector3(-1.18, 1.15, 1.7),
    new THREE.Vector3(-0.98, 2.05, 1.62),
    new THREE.Vector3(-0.35, 2.82, 1.45)
  ]);
  const dots = [];
  for (let dotIndex = 0; dotIndex < 9; dotIndex += 1) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0x72ffff, transparent: true, opacity: 0.72, toneMapped: false })
    );
    root.add(dot);
    dots.push(dot);
  }
  root.userData.flows.push({ curve: flowCurve, dots, speed: 0.08 });
}
