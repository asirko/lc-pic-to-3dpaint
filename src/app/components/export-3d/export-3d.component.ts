import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, viewChild } from '@angular/core';
import { Step } from '../step.abstract';
import { AmbientLight, BoxGeometry, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'lc-export-3d',
  imports: [],
  templateUrl: './export-3d.component.html',
  styleUrl: './export-3d.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Export3dComponent extends Step {
  readonly #destroyRef = inject(DestroyRef);
  readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  #renderer: WebGLRenderer | null = null;
  #scene: Scene | null = null;
  #camera: PerspectiveCamera | null = null;
  #controls: OrbitControls | null = null;
  #animationFrameId: number | null = null;
  #resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();

    afterNextRender(() => this.#initScene());

    effect(() => {
      if (this.isActive()) {
        this.#startLoop();
      } else {
        this.#stopLoop();
      }
    });

    this.#destroyRef.onDestroy(() => this.#dispose());
  }

  #initScene(): void {
    const canvas = this.canvasRef().nativeElement;
    const container = canvas.parentElement!;

    this.#scene = new Scene();

    this.#camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.#camera.position.set(0, 2, 5);

    this.#renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.#renderer.setPixelRatio(devicePixelRatio);
    this.#renderer.setSize(container.clientWidth, container.clientHeight);

    this.#scene.add(new AmbientLight(0xffffff, 0.6));
    const dirLight = new DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    this.#scene.add(dirLight);

    const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial({ color: 0x4488ff }));
    this.#scene.add(mesh);

    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;
    this.#controls.dampingFactor = 0.05;

    this.#resizeObserver = new ResizeObserver(() => this.#handleResize());
    this.#resizeObserver.observe(container);

    if (this.isActive()) {
      this.#startLoop();
    }
  }

  #startLoop(): void {
    if (this.#animationFrameId != null || !this.#renderer) return;

    const animate = () => {
      this.#animationFrameId = requestAnimationFrame(animate);
      this.#controls!.update();
      this.#renderer!.render(this.#scene!, this.#camera!);
    };
    animate();
  }

  #stopLoop(): void {
    if (this.#animationFrameId != null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }
  }

  #handleResize(): void {
    if (!this.#renderer || !this.#camera) return;

    const container = this.canvasRef().nativeElement.parentElement!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
    this.#renderer.setSize(width, height);
  }

  #dispose(): void {
    this.#stopLoop();
    this.#resizeObserver?.disconnect();
    this.#controls?.dispose();
    this.#renderer?.dispose();

    this.#scene?.traverse(obj => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.#renderer = null;
    this.#scene = null;
    this.#camera = null;
    this.#controls = null;
    this.#resizeObserver = null;
  }
}
