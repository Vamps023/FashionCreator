import * as THREE from 'three';

export interface ArrangementPoint {
  id: string;
  name: string;
  position: [number, number, number]; // [x, y, z] in meters
  rotationEuler: [number, number, number]; // [rx, ry, rz] in radians
  curvatureRadius: number; // in meters
  category: 'torso' | 'arm' | 'leg' | 'head' | 'waist';
}

export const AVATAR_ARRANGEMENT_POINTS: Record<string, ArrangementPoint> = {
  chest_front: {
    id: 'chest_front',
    name: 'Chest (Front)',
    position: [0, 0.18, 0.165],
    rotationEuler: [0, 0, 0],
    curvatureRadius: 0.22,
    category: 'torso'
  },
  chest_back: {
    id: 'chest_back',
    name: 'Chest (Back)',
    position: [0, 0.18, -0.165],
    rotationEuler: [0, Math.PI, 0],
    curvatureRadius: 0.22,
    category: 'torso'
  },
  arm_left_upper: {
    id: 'arm_left_upper',
    name: 'Left Arm (Bicep)',
    position: [-0.30, 0.22, 0],
    rotationEuler: [0, -Math.PI / 2, 0],
    curvatureRadius: 0.075,
    category: 'arm'
  },
  arm_right_upper: {
    id: 'arm_right_upper',
    name: 'Right Arm (Bicep)',
    position: [0.30, 0.22, 0],
    rotationEuler: [0, Math.PI / 2, 0],
    curvatureRadius: 0.075,
    category: 'arm'
  },
  waist_front: {
    id: 'waist_front',
    name: 'Waist (Front)',
    position: [0, -0.12, 0.155],
    rotationEuler: [0, 0, 0],
    curvatureRadius: 0.18,
    category: 'waist'
  },
  waist_back: {
    id: 'waist_back',
    name: 'Waist (Back)',
    position: [0, -0.12, -0.155],
    rotationEuler: [0, Math.PI, 0],
    curvatureRadius: 0.18,
    category: 'waist'
  },
  skirt_front: {
    id: 'skirt_front',
    name: 'Skirt (Front Flare)',
    position: [0, -0.26, 0.175],
    rotationEuler: [0, 0, 0],
    curvatureRadius: 0.26,
    category: 'waist'
  },
  skirt_back: {
    id: 'skirt_back',
    name: 'Skirt (Back Flare)',
    position: [0, -0.26, -0.175],
    rotationEuler: [0, Math.PI, 0],
    curvatureRadius: 0.26,
    category: 'waist'
  },
  leg_left_upper: {
    id: 'leg_left_upper',
    name: 'Left Thigh',
    position: [-0.11, -0.42, 0],
    rotationEuler: [0, -Math.PI / 2, 0],
    curvatureRadius: 0.095,
    category: 'leg'
  },
  leg_right_upper: {
    id: 'leg_right_upper',
    name: 'Right Thigh',
    position: [0.11, -0.42, 0],
    rotationEuler: [0, Math.PI / 2, 0],
    curvatureRadius: 0.095,
    category: 'leg'
  },
  neck_cowl: {
    id: 'neck_cowl',
    name: 'Neck / Collar',
    position: [0, 0.44, 0],
    rotationEuler: [0, 0, 0],
    curvatureRadius: 0.075,
    category: 'head'
  },
  hood_left: {
    id: 'hood_left',
    name: 'Hood (Left)',
    position: [-0.12, 0.52, -0.04],
    rotationEuler: [0, -Math.PI / 2, 0],
    curvatureRadius: 0.14,
    category: 'head'
  },
  hood_right: {
    id: 'hood_right',
    name: 'Hood (Right)',
    position: [0.12, 0.52, -0.04],
    rotationEuler: [0, Math.PI / 2, 0],
    curvatureRadius: 0.14,
    category: 'head'
  }
};
