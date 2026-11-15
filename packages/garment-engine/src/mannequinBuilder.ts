import * as THREE from 'three';
import { AvatarConfiguration } from '@fashion-studio/garment-schema';

/**
 * Builds a clean, minimal stylized studio mannequin for virtual fitting visualization.
 */
export function buildMannequin(config: AvatarConfiguration): THREE.Group {
  const mannequinGroup = new THREE.Group();
  mannequinGroup.name = 'StudioMannequin';

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.skinTone || '#4a4036'),
    roughness: 0.65,
    metalness: 0.15,
    wireframe: false
  });

  // 1. Head / Neck
  const headGeo = new THREE.SphereGeometry(0.11, 24, 20);
  headGeo.scale(0.85, 1.15, 0.95);
  const head = new THREE.Mesh(headGeo, mat);
  head.position.set(0, 0.58, -0.02);
  mannequinGroup.add(head);

  const neckGeo = new THREE.CylinderGeometry(0.062, 0.075, 0.14, 20);
  const neck = new THREE.Mesh(neckGeo, mat);
  neck.position.set(0, 0.42, -0.01);
  mannequinGroup.add(neck);

  // 2. Torso core
  const torsoGeo = new THREE.CylinderGeometry(0.22, 0.19, 0.65, 24);
  torsoGeo.scale(1.15, 1.0, 0.75);
  const torso = new THREE.Mesh(torsoGeo, mat);
  torso.position.set(0, 0.05, 0);
  mannequinGroup.add(torso);

  // 3. Shoulders
  const shoulderGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.48, 16);
  shoulderGeo.rotateZ(Math.PI / 2);
  const shoulders = new THREE.Mesh(shoulderGeo, mat);
  shoulders.position.set(0, 0.32, 0);
  mannequinGroup.add(shoulders);

  // 4. Arms (Relaxed pose)
  const armGeoL = new THREE.CylinderGeometry(0.045, 0.055, 0.56, 16);
  armGeoL.rotateZ(THREE.MathUtils.degToRad(-38));
  armGeoL.translate(-0.35, 0.05, 0);
  const armL = new THREE.Mesh(armGeoL, mat);
  mannequinGroup.add(armL);

  const armGeoR = new THREE.CylinderGeometry(0.045, 0.055, 0.56, 16);
  armGeoR.rotateZ(THREE.MathUtils.degToRad(38));
  armGeoR.translate(0.35, 0.05, 0);
  const armR = new THREE.Mesh(armGeoR, mat);
  mannequinGroup.add(armR);

  // 5. Minimal Stand / Base
  const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 16);
  const poleMat = new THREE.MeshStandardMaterial({ color: '#27272a', metalness: 0.8, roughness: 0.2 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(0, -0.65, 0);
  mannequinGroup.add(pole);

  const baseGeo = new THREE.CylinderGeometry(0.24, 0.25, 0.03, 32);
  const base = new THREE.Mesh(baseGeo, poleMat);
  base.position.set(0, -1.0, 0);
  mannequinGroup.add(base);

  mannequinGroup.visible = config.visible;
  return mannequinGroup;
}
