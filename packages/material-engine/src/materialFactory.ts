import * as THREE from 'three';
import { FabricMaterial } from '@fashion-studio/garment-schema';
import { getProceduralNormalMap } from './fabricTextures';

export function createPhysicalFabricMaterial(
  fabric: FabricMaterial,
  artworkTexture?: THREE.Texture | null,
  wireframe: boolean = false
): THREE.MeshPhysicalMaterial {
  const normalMap = getProceduralNormalMap(fabric.texturePattern, fabric.weaveRepeat);

  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(fabric.color),
    roughness: fabric.roughness,
    metalness: fabric.metalness,
    sheen: fabric.sheen,
    sheenRoughness: fabric.sheenRoughness,
    sheenColor: new THREE.Color(fabric.color).lerp(new THREE.Color('#ffffff'), 0.3),
    normalMap: normalMap,
    normalScale: new THREE.Vector2(fabric.normalScale, fabric.normalScale),
    wireframe: wireframe,
    side: THREE.DoubleSide
  });

  if (artworkTexture) {
    mat.map = artworkTexture;
    mat.needsUpdate = true;
  }

  return mat;
}

export function updatePhysicalFabricMaterial(
  material: THREE.MeshPhysicalMaterial,
  fabric: FabricMaterial,
  artworkTexture?: THREE.Texture | null,
  wireframe: boolean = false
): void {
  material.color.set(fabric.color);
  material.roughness = fabric.roughness;
  material.metalness = fabric.metalness;
  material.sheen = fabric.sheen;
  material.sheenRoughness = fabric.sheenRoughness;
  material.sheenColor.set(fabric.color).lerp(new THREE.Color('#ffffff'), 0.3);
  material.wireframe = wireframe;

  material.normalMap = getProceduralNormalMap(fabric.texturePattern, fabric.weaveRepeat);
  material.normalScale.set(fabric.normalScale, fabric.normalScale);

  if (artworkTexture) {
    material.map = artworkTexture;
  }
  material.needsUpdate = true;
}
