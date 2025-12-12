import { Raycast, Vec2 } from 'ogl';
import { Slider } from './controllers/slider';
import { Grid } from './controllers/grid';
import {
  iris, LerpController, Conductor,
} from '../hermes';
import { nav } from '../components/nav';

export class Manager {
  constructor({ gl }) {
    this.gl = gl;
    this.media = gl.media;
    this.mesh = gl.media.map((el) => el.plane);
    this.mediaL = gl.mediaL;

    this.ray = new Raycast(gl.gl);
    this.gap = { cur: 0, target: 0, inertia: 0.075 };
    this.rects = gl.media.map((media) => ({
      x: { cur: 0, target: 0.1, inertia: 0.075 },
      y: { cur: 0, target: 0.1, inertia: 0.075 },
      w: { cur: 0, target: 0.1, inertia: 0.075 },
      h: { cur: 0, target: 0.1, inertia: 0.075 },
      o: { cur: 1, target: 0.1, inertia: 0.1 },
    }));

    this.lerp = {
      gap: new LerpController(this.gap),
      rects: this.rects.map((rect) => ({
        x: new LerpController(rect.x),
        y: new LerpController(rect.y),
        w: new LerpController(rect.w),
        h: new LerpController(rect.h),
        o: new LerpController(rect.o),
      })),
    };

    this.controllers = {
      grid: new Grid({ gl, manager: this }),
      slider: new Slider({ gl, manager: this }),
    };

    this.state = {
      active: 0,
      span: {
        vert: 1,
        hori: 1,
      },
      mouse: new Vec2(),
      hover: -1,
    };

    this.idxChangeQ = new Conductor();
    this.modeChangeQ = new Conductor();

    window.manager = this;
    this.test();
  }

  intro = () => {
    this.controllers[this.mode].on();
  };

  test = () => {
    iris.key((e) => {
      if (e.key === 'g' && this.mode !== 'grid') {
        this.goto('grid');
      } else if (e.key === 's' && this.mode !== 'slider') {
        this.goto('slider');
      }
    });
  };

  common = () => {
    const planeDims = this.gl.settings.planeDims[this.mode].c;
    this.gap.cur = planeDims.g;
    this.state.span.hori = planeDims.w + this.gap.cur;
    this.state.span.vert = planeDims.h + this.gap.cur;
  };

  goto = (mode) => {
    this.active = this.controllers[this.mode].state.idx;
    this.controllers[this.mode].off();

    if (mode !== this.mode) {
      this.mode = mode;
      this.onModeChange(mode);
    }

    this.common();

    this.controllers[mode].on();
  };

  resize = () => {
    this.common();

    this.controllers.slider.resize();
    this.controllers.grid.resize();

    this.gl.needsUpdate = true;
  };

  get needsUpdate() {
    if (this.lerp.gap.needsUpdate()) return true;

    const activeController = this.controllers[this.mode];
    const activeSettings = activeController.settings;
    const needsHover = activeSettings.hover;
    const needsActive = activeSettings.activePlay;
    const isActive = activeController.state.active;

    if (needsHover && this.state.hover > -1) {
      // hovering over a video
      if (isActive && this.media[this.state.hover].options.type === 'video') {
        return true;
      }
    } else if (isActive && needsActive && this.media[this.state.active].options.type === 'video') {
      // active case item is video
      return true;
    }

    for (let i = 0; i < this.lerp.rects.length; i++) {
      const rect = this.lerp.rects[i];
      if (
        rect.x.needsUpdate()
        || rect.y.needsUpdate()
        || rect.w.needsUpdate()
        || rect.h.needsUpdate()
        || rect.o.needsUpdate()
      ) {
        return true;
      }
    }

    return false;
  }

  get mode() {
    return this.gl.state.mode;
  }

  set mode(mode) {
    this.gl.state.mode = mode;
  }

  get span() {
    return this.state.span.hori;
  }

  get vspan() {
    return this.state.span.vert;
  }

  get active() {
    return this.state.active;
  }

  set active(idx) {
    if (idx === this.active) return;
    this.state.active = idx;
    this.onIdxChange();
  }

  onIdxChange = () => {
    this.idxChangeQ.train.forEach(({ update }) => update(this.active));
  };

  onModeChange = () => {
    this.modeChangeQ.train.forEach(({ update }) => update(this.mode));

    // special side effect
    nav.toggle(this.mode);
  };

  setCursorPos = (x, y) => {
    this.state.mouse.set(
      2.0 * (x / this.gl.renderer.width) - 1.0,
      2.0 * (1.0 - y / this.gl.renderer.height) - 1.0,
    );
  };

  updateCursor = () => {
    this.state.hover = this.rayCast();
  };

  rayCast = () => {
    // cast mouse and check for hover on GL
    this.ray.castMouse(this.gl.camera, this.state.mouse);
    let newidx = -1;

    // loop through visible meshes
    for (let i = 0; i < this.mediaL; i++) {
      const mesh = this.mesh[i];
      const hits = this.ray.intersectBounds(mesh);

      if (hits.length) {
        newidx = i;
        break;
      }
    }

    return newidx;
  };

  in = () => {
    this.controllers[this.mode].in();
  };

  out = () => {
    this.controllers[this.mode].out();
  };

  update = () => {
    const activeController = this.controllers[this.mode];

    activeController.update();

    if (activeController.settings.hover && !activeController.state.wasDragging) {
      this.updateCursor();
    } else {
      this.state.hover = -1;
    }

    if (!this.gl.needsUpdate && !this.needsUpdate) return;

    this.gl.needsUpdate = true;

    this.lerp.gap.update();

    // TODO: Test for intersection with viewport?
    this.media.forEach((media, i) => {
      // const offset = 1 - Math.abs(i - this.state.active) / this.mediaL;
      // const offsetInertia = lerp(0.025, 0.075, offset);

      const isVideo = !!media.video;
      const isActive = activeController.settings.activePlay && i === this.state.active;
      const isHovered = activeController.settings.hoverPlay && i === this.state.hover;

      if (isVideo && (isActive || isHovered)) {
        media.video.paused && media.video.play();
        media.updateVideo();
      } else if (media.video) {
        media.video.paused || media.video.pause();
      }

      const rect = this.rects[i];
      const rectlerp = this.lerp.rects[i];

      // const offset = clamp(rectlerp.delta, 0, 1);
      // const offsetInertia = lerp(0.025, 0.075, offset);

      // rectlerp.x.obj.inertia = offsetInertia;
      // rectlerp.y.obj.inertia = offsetInertia;
      // rectlerp.w.obj.inertia = offsetInertia;
      // rectlerp.h.obj.inertia = offsetInertia;

      rectlerp.x.update();
      rectlerp.y.update();
      rectlerp.w.update();
      rectlerp.h.update();
      rectlerp.o.update();

      media.translate({
        x: rect.x.target,
        y: rect.y.target,
      });
      media.scale({
        x: rect.w.target,
        y: rect.h.target,
      });

      media.uniform('uAlpha', rect.o.target);
      media.uniform('uMono', 1 - rect.o.target);
      media.uniform('uInvert', 1 - rect.o.target);
    });
  };
}
