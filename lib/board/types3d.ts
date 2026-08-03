import * as THREE from 'three';

export interface Base3DOptions {
  id?: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number }; // In radians
  scale?: { x: number; y: number; z: number };
  color?: string | number;
  opacity?: number;
  wireframe?: boolean;
}

export interface Board3DOptions {
  alpha?: boolean; // Default true (transparent background)
  cameraFov?: number; // Default 75
  cameraNear?: number; // Default 0.1
  cameraFar?: number; // Default 1000
  cameraPosition?: { x: number; y: number; z: number }; // Default {x: 0, y: 0, z: 5}
  orbitControls?: boolean; // Default false
}

export interface CubeOptions extends Base3DOptions {
  width?: number;
  height?: number;
  depth?: number;
}

export interface SphereOptions extends Base3DOptions {
  radius?: number;
  widthSegments?: number;
  heightSegments?: number;
}

export interface CylinderOptions extends Base3DOptions {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
}

export interface ConeOptions extends Base3DOptions {
  radius?: number;
  height?: number;
  radialSegments?: number;
}

export interface TorusOptions extends Base3DOptions {
  radius?: number;
  tube?: number;
  radialSegments?: number;
  tubularSegments?: number;
}

export interface PlaneOptions extends Base3DOptions {
  width?: number;
  height?: number;
}

export interface Line3DOptions extends Base3DOptions {
  points: { x: number; y: number; z: number }[];
  linewidth?: number;
}

export interface Arrow3DOptions extends Base3DOptions {
  dir: { x: number; y: number; z: number };
  origin?: { x: number; y: number; z: number };
  length?: number;
  headLength?: number;
  headWidth?: number;
  color?: string | number;
}

export interface Text3DOptions extends Base3DOptions {
  text: string;
  font?: string;
  size?: number;
  height?: number;
}

export interface CustomMeshOptions extends Base3DOptions {
  geometry: THREE.BufferGeometry;
  material?: THREE.Material;
}

export interface AmbientLightOptions {
  id?: string;
  color?: string | number;
  intensity?: number;
}

export interface DirectionalLightOptions {
  id?: string;
  color?: string | number;
  intensity?: number;
  position?: { x: number; y: number; z: number };
}

export interface PointLightOptions {
  id?: string;
  color?: string | number;
  intensity?: number;
  distance?: number;
  decay?: number;
  position?: { x: number; y: number; z: number };
}

export interface Animation3D {
  rotationSpeed?: { x: number; y: number; z: number };
  bounce?: { speed: number; amount: number; offset?: number };
  orbit?: { target: { x: number; y: number; z: number }; speed: number; radius: number; axis?: 'x' | 'y' | 'z' };
  custom?: (mesh: THREE.Object3D, time: number, delta: number) => void;
}
