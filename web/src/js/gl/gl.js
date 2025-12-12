import { Plane } from 'ogl';
import { Athena } from './athena';
import { Media } from './media';

import {
  ticker, ro,
} from '../hermes';
import { Store } from '../store';
import { Manager } from './manager';

class GL extends Athena {
  constructor() {
    super();

    this.needsUpdate = true;
    this.media = [];

    this.createGeometry();

    this.responsive = {
      sm: {
        slider: { w: 335, h: 200, g: 20 },
        grid: { w: 335, h: 375, g: 20 },
      },
      md: {
        slider: { w: 335, h: 200, g: 20 },
        grid: { w: 335, h: 375, g: 20 },
      },
      lg: {
        slider: { w: 920, h: 543, g: 278 },
        // slider: { w: 450, h: 800, g: 70 },
        grid: { w: 529, h: 375, g: 70 },
        // grid: { w: 529, h: 375, g: 70 },
      },
    };

    this.settings = {
      planeDims: {
        slider: { o: { w: 1, h: 1, g: 1 }, c: { w: 1, h: 1, g: 1 } },
        grid: { o: { w: 1, h: 1, g: 1 }, c: { w: 1, h: 1, g: 1 } },
      },
      mode: 'slider',
    };

    this.state = {
      mode: this.settings.mode,
    };

    window.gl = this;
  }

  init = () => {
    this.sortMedia();
    this.manager = new Manager({ gl: this });

    this.resize();

    ticker.add({ update: this.update });
    ro.add({ update: this.resize });
  };

  createGeometry = () => {
    this.planeGeometry = new Plane(this.gl, {
      widthSegments: 1,
      heightSegments: 1,
    });
  };

  createMedia = (source, index, options = { type: 'img' }) => {
    this.media.push(
      new Media({
        [options.type]: source,
        geometry: this.planeGeometry,
        gl: this.gl,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        planeDims: { w: window.innerWidth, h: window.innerHeight },
        index,
        options,
      }),
    );
    // this.update();
  };

  sortMedia = () => {
    this.mediaL = this.media.length;
    this.media.sort((a, b) => (a.index > b.index ? 1 : -1));
  };

  resize = ({ vw, vh } = { vw: window.innerWidth, vh: window.innerHeight }) => {
    super.resize();

    const { grid, slider } = this.settings.planeDims;

    const mode = this.responsive[ro.mode];

    slider.o = mode.slider;
    grid.o = mode.grid;

    slider.c.w = Store.fluidW(slider.o.w);
    slider.c.h = Store.fluidW(slider.o.h);
    slider.c.g = Store.fluidW(slider.o.g);

    grid.c.w = Store.fluidW(grid.o.w);
    grid.c.h = Store.fluidW(grid.o.h);
    grid.c.g = Store.fluidW(grid.o.g);

    if (!this.media) return;

    const c = { ...this.settings.planeDims[this.state.mode].c };

    this.media.forEach((media, i) => {
      media.planeDims = c;
      media.resize({ screen: this.screen, viewport: this.viewport });
    });
    this.manager?.resize();

    this.needsUpdate = true;
  };

  update = () => {
    if (!this.media) return;

    this.manager?.update();

    if (!this.needsUpdate) return;
    super.update();
    this.needsUpdate = false;
  };
}

export const gl = new GL();
