import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Board } from './board';
import {
  Board3DOptions,
  CubeOptions,
  SphereOptions,
  CylinderOptions,
  ConeOptions,
  TorusOptions,
  PlaneOptions,
  Line3DOptions,
  Arrow3DOptions,
  CustomMeshOptions,
  AmbientLightOptions,
  DirectionalLightOptions,
  PointLightOptions,
  Animation3D,
  Base3DOptions
} from './types3d';

export class Board3D {
  private board: Board;
  private renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private controls: OrbitControls | null = null;
  private objects: Map<string, THREE.Object3D> = new Map();
  private animations: Map<string, Animation3D> = new Map();
  private animationFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();
  
  constructor(board: Board, options: Board3DOptions = {}) {
    this.board = board;
    this.scene = new THREE.Scene();
    
    // Set up camera
    const fov = options.cameraFov ?? 75;
    const aspect = board.canvas.width / board.canvas.height;
    const near = options.cameraNear ?? 0.1;
    const far = options.cameraFar ?? 1000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    const pos = options.cameraPosition ?? { x: 0, y: 0, z: 5 };
    this.camera.position.set(pos.x, pos.y, pos.z);
    
    // Set up renderer
    const initialWidth = board.canvas.parentElement?.clientWidth || board.canvas.width;
    const initialHeight = board.canvas.parentElement?.clientHeight || board.canvas.height;
    
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: options.alpha ?? true,
      antialias: true 
    });
    this.renderer.setSize(initialWidth, initialHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    const canvas3d = this.renderer.domElement;
    canvas3d.style.position = 'absolute';
    canvas3d.style.top = '0';
    canvas3d.style.left = '0';
    canvas3d.style.width = '100%';
    canvas3d.style.height = '100%';
    canvas3d.style.pointerEvents = options.orbitControls ? 'auto' : 'none';
    
    if (board.canvas.parentElement) {
      board.canvas.parentElement.style.position = 'relative';
      board.canvas.parentElement.appendChild(canvas3d);
    }
    
    if (options.orbitControls) {
      this.enableOrbitControls();
    }
    
    this.addAmbientLight({ intensity: 0.5 });
    this.addDirectionalLight({ position: { x: 5, y: 5, z: 5 }, intensity: 0.8 });
    
    if (board.canvas.parentElement) {
        const resizeObserver = new ResizeObserver(() => {
            const width = board.canvas.parentElement?.clientWidth || 0;
            const height = board.canvas.parentElement?.clientHeight || 0;
            if (width === 0 || height === 0) return;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            this.render();
        });
        resizeObserver.observe(board.canvas.parentElement);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private applyBaseOptions(mesh: THREE.Object3D, options: Base3DOptions) {
    if (options.position) mesh.position.set(options.position.x, options.position.y, options.position.z);
    if (options.rotation) mesh.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
    if (options.scale) mesh.scale.set(options.scale.x, options.scale.y, options.scale.z);
  }

  private getMaterial(options: Base3DOptions): THREE.Material {
    const color = options.color ?? 0xffffff;
    const material = new THREE.MeshStandardMaterial({ 
      color, 
      wireframe: options.wireframe ?? false,
      transparent: options.opacity !== undefined && options.opacity < 1,
      opacity: options.opacity ?? 1,
      roughness: 0.4,
      metalness: 0.1
    });
    return material;
  }

  addCube(options: CubeOptions): string {
    const id = options.id ?? this.generateId();
    const geometry = new THREE.BoxGeometry(options.width ?? 1, options.height ?? 1, options.depth ?? 1);
    const material = this.getMaterial(options);
    const mesh = new THREE.Mesh(geometry, material);
    
    this.applyBaseOptions(mesh, options);
    this.scene.add(mesh);
    this.objects.set(id, mesh);
    
    return id;
  }

  addSphere(options: SphereOptions): string {
    const id = options.id ?? this.generateId();
    const geometry = new THREE.SphereGeometry(
      options.radius ?? 1, 
      options.widthSegments ?? 32, 
      options.heightSegments ?? 16
    );
    const material = this.getMaterial(options);
    const mesh = new THREE.Mesh(geometry, material);
    
    this.applyBaseOptions(mesh, options);
    this.scene.add(mesh);
    this.objects.set(id, mesh);
    
    return id;
  }

  addCylinder(options: CylinderOptions): string {
    const id = options.id ?? this.generateId();
    const geometry = new THREE.CylinderGeometry(
      options.radiusTop ?? 1,
      options.radiusBottom ?? 1,
      options.height ?? 2,
      options.radialSegments ?? 32
    );
    const material = this.getMaterial(options);
    const mesh = new THREE.Mesh(geometry, material);
    
    this.applyBaseOptions(mesh, options);
    this.scene.add(mesh);
    this.objects.set(id, mesh);
    
    return id;
  }

  addCone(options: ConeOptions): string {
    const id = options.id ?? this.generateId();
    const geometry = new THREE.ConeGeometry(
      options.radius ?? 1,
      options.height ?? 2,
      options.radialSegments ?? 32
    );
    const material = this.getMaterial(options);
    const mesh = new THREE.Mesh(geometry, material);
    
    this.applyBaseOptions(mesh, options);
    this.scene.add(mesh);
    this.objects.set(id, mesh);
    
    return id;
  }

  addTorus(options: TorusOptions): string {
    const id = options.id ?? this.generateId();
    const geometry = new THREE.TorusGeometry(
      options.radius ?? 1,
      options.tube ?? 0.4,
      options.radialSegments ?? 12,
      options.tubularSegments ?? 48
    );
    const material = this.getMaterial(options);
    const mesh = new THREE.Mesh(geometry, material);
    
    this.applyBaseOptions(mesh, options);
    this.scene.add(mesh);
    this.objects.set(id, mesh);
    
    return id;
  }

  addPlane(options: PlaneOptions): string {
    const id = options.id ?? this.generateId();
    const geometry = new THREE.PlaneGeometry(
      options.width ?? 1,
      options.height ?? 1
    );
    const material = this.getMaterial(options);
    const mesh = new THREE.Mesh(geometry, material);
    
    this.applyBaseOptions(mesh, options);
    this.scene.add(mesh);
    this.objects.set(id, mesh);
    
    return id;
  }

  addLine3D(options: Line3DOptions): string {
    const id = options.id ?? this.generateId();
    const points = options.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: options.color ?? 0xffffff,
      linewidth: options.linewidth ?? 1
    });
    const line = new THREE.Line(geometry, material);
    
    this.applyBaseOptions(line, options);
    this.scene.add(line);
    this.objects.set(id, line);
    
    return id;
  }

  addArrow3D(options: Arrow3DOptions): string {
    const id = options.id ?? this.generateId();
    const dir = new THREE.Vector3(options.dir.x, options.dir.y, options.dir.z).normalize();
    const origin = options.origin ? new THREE.Vector3(options.origin.x, options.origin.y, options.origin.z) : new THREE.Vector3(0, 0, 0);
    const length = options.length ?? 1;
    const hex = options.color ?? 0xffff00;
    
    const arrowHelper = new THREE.ArrowHelper(
      dir, 
      origin, 
      length, 
      hex as number, 
      options.headLength, 
      options.headWidth
    );
    
    this.scene.add(arrowHelper);
    this.objects.set(id, arrowHelper);
    
    return id;
  }
  
  addAxesHelper(size: number = 5): string {
    const id = this.generateId();
    const axesHelper = new THREE.AxesHelper(size);
    this.scene.add(axesHelper);
    this.objects.set(id, axesHelper);
    return id;
  }

  addGridHelper(size: number = 10, divisions: number = 10): string {
    const id = this.generateId();
    const gridHelper = new THREE.GridHelper(size, divisions);
    this.scene.add(gridHelper);
    this.objects.set(id, gridHelper);
    return id;
  }

  addMesh(options: CustomMeshOptions): string {
    const id = options.id ?? this.generateId();
    const material = options.material ?? this.getMaterial(options);
    const mesh = new THREE.Mesh(options.geometry, material);
    
    this.applyBaseOptions(mesh, options);
    this.scene.add(mesh);
    this.objects.set(id, mesh);
    
    return id;
  }

  addAmbientLight(options: AmbientLightOptions = {}): string {
    const id = options.id ?? this.generateId();
    const light = new THREE.AmbientLight(options.color ?? 0xffffff, options.intensity ?? 1);
    this.scene.add(light);
    this.objects.set(id, light);
    return id;
  }

  addDirectionalLight(options: DirectionalLightOptions = {}): string {
    const id = options.id ?? this.generateId();
    const light = new THREE.DirectionalLight(options.color ?? 0xffffff, options.intensity ?? 1);
    if (options.position) light.position.set(options.position.x, options.position.y, options.position.z);
    this.scene.add(light);
    this.objects.set(id, light);
    return id;
  }

  addPointLight(options: PointLightOptions = {}): string {
    const id = options.id ?? this.generateId();
    const light = new THREE.PointLight(
      options.color ?? 0xffffff, 
      options.intensity ?? 1,
      options.distance ?? 0,
      options.decay ?? 2
    );
    if (options.position) light.position.set(options.position.x, options.position.y, options.position.z);
    this.scene.add(light);
    this.objects.set(id, light);
    return id;
  }

  setPosition(id: string, x: number, y: number, z: number): void {
    const obj = this.objects.get(id);
    if (obj) obj.position.set(x, y, z);
  }

  setRotation(id: string, x: number, y: number, z: number): void {
    const obj = this.objects.get(id);
    if (obj) obj.rotation.set(x, y, z);
  }

  setScale(id: string, x: number, y: number, z: number): void {
    const obj = this.objects.get(id);
    if (obj) obj.scale.set(x, y, z);
  }

  setColor(id: string, color: string | number): void {
    const obj = this.objects.get(id);
    if (obj && obj instanceof THREE.Mesh && obj.material && 'color' in obj.material) {
      (obj.material.color as THREE.Color).set(color);
    }
  }

  setOpacity(id: string, opacity: number): void {
    const obj = this.objects.get(id);
    if (obj && obj instanceof THREE.Mesh && obj.material) {
      obj.material.transparent = opacity < 1;
      obj.material.opacity = opacity;
    }
  }

  remove(id: string): void {
    const obj = this.objects.get(id);
    if (obj) {
      this.scene.remove(obj);
      this.objects.delete(id);
    }
  }

  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    if (this.controls) this.controls.update();
  }

  lookAt(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
    if (this.controls) {
      this.controls.target.set(x, y, z);
      this.controls.update();
    }
  }

  enableOrbitControls(): void {
    if (!this.controls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.renderer.domElement.style.pointerEvents = 'auto';
    }
  }
  
  disableOrbitControls(): void {
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
      this.renderer.domElement.style.pointerEvents = 'none';
    }
  }

  animate(id: string, animation: Animation3D): void {
    this.animations.set(id, animation);
  }

  render(): void {
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  startRenderLoop(): void {
    if (this.animationFrameId !== null) return;
    
    this.clock.start();
    const loop = () => {
      this.animationFrameId = requestAnimationFrame(loop);
      
      const time = this.clock.getElapsedTime();
      const delta = this.clock.getDelta();
      
      this.animations.forEach((anim, id) => {
        const obj = this.objects.get(id);
        if (!obj) return;
        
        if (anim.rotationSpeed) {
          obj.rotation.x += anim.rotationSpeed.x * delta;
          obj.rotation.y += anim.rotationSpeed.y * delta;
          obj.rotation.z += anim.rotationSpeed.z * delta;
        }
        
        if (anim.bounce) {
          const offset = anim.bounce.offset ?? 0;
          obj.position.y = offset + Math.sin(time * anim.bounce.speed) * anim.bounce.amount;
        }
        
        if (anim.orbit) {
          const angle = time * anim.orbit.speed;
          const target = anim.orbit.target;
          const radius = anim.orbit.radius;
          const axis = anim.orbit.axis ?? 'y';
          
          if (axis === 'y') {
            obj.position.x = target.x + Math.cos(angle) * radius;
            obj.position.z = target.z + Math.sin(angle) * radius;
          } else if (axis === 'x') {
            obj.position.y = target.y + Math.cos(angle) * radius;
            obj.position.z = target.z + Math.sin(angle) * radius;
          } else {
            obj.position.x = target.x + Math.cos(angle) * radius;
            obj.position.y = target.y + Math.sin(angle) * radius;
          }
        }
        
        if (anim.custom) {
          anim.custom(obj, time, delta);
        }
      });
      
      this.render();
    };
    
    loop();
  }

  stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  dispose(): void {
    this.stopRenderLoop();
    if (this.controls) this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.objects.clear();
    this.animations.clear();
  }
}
