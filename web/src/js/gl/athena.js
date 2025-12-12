import { Camera, Renderer, Transform } from 'ogl';
import { qs } from '../hermes';

export class Athena {
  constructor() {
    // create renderer
    this.renderer = new Renderer({
      canvas: qs('#gl'),
      alpha: false,
      dpr: Math.min(1.5, window.devicePixelRatio),
      antialias: false,
      powerPreference: 'high-performance',
    });

    this.gl = this.renderer.gl;
    this.gl.clearColor(17 / 255, 18 / 255, 16 / 255, 1);

    // create camera
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 5;

    // create scene
    this.scene = new Transform();
    this.resize();
  }

  resize({ vw, vh } = { vw: window.innerWidth, vh: window.innerHeight }) {
    this.screen = {
      height: vh,
      width: vw,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      height,
      width,
    };
  }

  update() {
    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    });
  }
}
