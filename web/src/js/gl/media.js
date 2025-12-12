import { Mesh, Program, Texture } from 'ogl';

import { fragment } from './shaders/fragment';
import { vertex } from './shaders/vertex';

import { Store } from '../store';
import { ro } from '../hermes';

export class Media {
  constructor({
    img,
    video,
    geometry,
    gl,
    planeDims,
    scene,
    screen,
    viewport,
    index,
    basePos = {
      x: 0,
      y: 0,
      offset: { cur: -ro.bounds.vw, target: -ro.bounds.vw, inertia: 0.075 },
    },
    options,
  }) {
    Object.assign(this, {
      img,
      video,
      geometry,
      gl,
      scene,
      screen,
      viewport,
      planeDims,
      index,
      basePos,
      options,
    });

    if (img) {
      this.createTexture();
    } else {
      this.createVideoTexture();
    }

    this.createMesh();
    this.resize();
  }

  createTexture = () => {
    if (Store.textures[this.img.src]) {
      this.texture = Store.textures[this.img.src];
    } else {
      this.texture = new Texture(this.gl, {
        image: this.img,
        generateMipmaps: false,
        minFilter: this.gl.LINEAR,
      });
      Store.textures[this.img.src] = this.texture;
    }
  };

  createVideoTexture = () => {
    this.texture = new Texture(this.gl, {
      generateMipmaps: false,
      minFilter: this.gl.LINEAR,
    });

    this.img = {
      naturalHeight: this.options.height,
      naturalWidth: this.options.width,
    };

    this.createVideoCover();
    this.setVideoCover();
  };

  updateVideo = () => {
    if (this.video.readyState >= this.video.HAVE_ENOUGH_DATA) {
      this.texture.image = this.video;
      this.texture.needsUpdate = true;
    }
  };

  createVideoCover = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = this.setVideoCover;
    img.src = this.options.cover;

    this.videoCoverImg = img;
  };

  setVideoCover = () => {
    this.texture.image = this.videoCoverImg;
    this.texture.needsUpdate = true;
  };

  createMesh = () => {
    const program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uTexture: { value: this.texture },
        uPlaneSizes: { value: [this.planeDims.w, this.planeDims.h] },
        uImageSizes: { value: [this.img.naturalWidth, this.img.naturalHeight] },
        uAlpha: { value: 1 },
        uMono: { value: 0 },
        uInvert: { value: 0 },
      },
      transparent: true,
    });

    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program,
    });

    this.plane.setParent(this.scene);
  };

  convertY = (val) => (this.viewport.height * val) / this.screen.height;

  convertX = (val) => (this.viewport.width * val) / this.screen.width;

  scale = ({ x = this.planeDims.w, y = this.planeDims.h }) => {
    this.planeDims.w = x;
    this.planeDims.h = y;

    this.plane.scale.x = this.convertX(x);
    this.plane.scale.y = this.convertY(y);

    this.plane.program.uniforms.uPlaneSizes.value = [x, y];
  };

  translate = ({ x = this.plane.position.x, y = this.plane.position.y }) => {
    this.plane.position.x = this.convertX(x);
    this.plane.position.y = this.convertY(y);
  };

  uniform = (name, value) => {
    this.plane.program.uniforms[name].value = value;
  };

  resize = ({ viewport, screen } = {}) => {
    if (viewport) this.viewport = viewport;
    if (screen) this.screen = screen;

    this.ratio = {
      x: this.viewport.width / this.screen.width,
      y: this.viewport.height / this.screen.height,
    };

    this.scale({ x: this.planeDims.w, y: this.planeDims.h });
  };
}
