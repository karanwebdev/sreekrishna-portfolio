import {
  qs,
  qsa,
  select,
  bounds,
  ticker,
  ro,
  iris,
  clamp,
  lerp,
  round,
  Sniff,
} from '../../hermes';
import { scroller } from '../../scroller';

//
// Slider
// =======
// Todo:
// + Implement generic logic class
// + Clean up state
//
export class Slider {
  constructor({
    container = '.carousel-container',
    slider = '.carousel-slider',
    slides = '.carousel-slide',
    inertia = 0.1,
    dragSpeed = 1.5,
    arrows,
    active = 0,
  }) {
    [this.container] = select(container);
    this.slider = qs(slider, this.container);
    this.counter = qs('#carousel-active');
    if (arrows) {
      this.arrows = {};
      arrows.left && (this.arrows.left = select(arrows.left));
      arrows.right && (this.arrows.right = select(arrows.right));
    }
    this.slides = [];

    qsa(slides, this.slider).forEach((dom, i) => {
      this.slides[i] = {
        dom,
        visible: true,
        x: 0,
      };
    });
    Object.assign(this, {
      inertia,
      dragSpeed,
    });

    this.state = {
      active,
      oldActive: 0,
      dragging: false,
      sx: 0, // start
      cx: 0, // current
      tx: 0, // target
      lx: 0, // last
      fx: 0, // final
      max: 0,
      min: 0,
      direction: 1, // +ve is right
      slideWidth: 0,
      sliderWidth: 0,
      containerWidth: 0,
      threshold: 0,
      progress: 0,
    };
    this.syncTrain = [];

    this.resize();
    this.detect();
    this.listeners();

    this.roID = ro.add({
      update: this.resize,
    });

    this.tickID = ticker.add({
      update: this.update,
    });
  }

  detect = () => {
    let type = 'pointer';
    let down = 'down';
    let up = 'up';

    if (Sniff.touchDevice) {
      type = 'touch';
      down = 'start';
      up = 'end';
    }

    this.events = {
      type,
      up,
      down,
    };
  };

  clamp = (val = 0) => clamp(val, this.state.min, this.state.max);

  listeners = () => {
    const { type, up, down } = this.events;
    const { state } = this;

    this.removeDown = iris.add(this.container, `${type}${down}`, (e) => {
      this.container.classList.add('active');
      state.dragging = true;
      state.sx = Iris.getXY(e).x;
      state.lx = state.tx;
      scroller.lock();
    });

    this.removeWheel = iris.add(this.container, 'wheel', (e) => {
      const delta = e.deltaX;
      state.direction = delta > 0 ? 1 : -1;
      state.cx += delta * this.dragSpeed;
      state.cx = this.clamp(state.cx);
      state.active = Math.floor(state.cx / state.slideWidth + 0.5);
    });

    this.removeMove = iris.add(window, `${type}move`, (e) => {
      if (!state.dragging) return;
      const delta = state.sx - Iris.getXY(e).x;
      state.direction = delta > 0 ? 1 : -1;
      state.cx = state.lx + delta * this.dragSpeed;
      state.cx = this.clamp(state.cx);
      state.active = Math.floor(state.cx / state.slideWidth + 0.5);
    });

    this.removeUp = iris.add(window, `${type}${up}`, (e) => {
      state.dragging = false;
      state.cx = this.clamp(state.active * state.slideWidth);
      // state.cx = state.active * state.slideWidth;
      scroller.unlock();
      this.container.classList.remove('active');
    });

    if (this.arrows && this.arrows.left) {
      iris.add(this.arrows.left, 'click', () => {
        this.arrow('left');
      });
    }

    if (this.arrows && this.arrows.right) {
      iris.add(this.arrows.right, 'click', () => {
        this.arrow('right');
      });
    }
  };

  resize = (o = { vw: window.innerWidth, vh: window.innerHeight }) => {
    this.bounds = o;
    const { state } = this;

    state.slideWidth = this.slides[0].dom.offsetWidth;
    state.sliderWidth = this.slider.offsetWidth;
    state.containerWidth = this.container.offsetWidth;

    state.max = 0;
    this.slides.forEach((slide, i) => {
      state.max += slide.dom.offsetWidth;
      const { left } = bounds(slide.dom);
      slide.left = left;
      // slide.dom.style.transform = `translate3d(${state.slideWidth}px, 0, 0)`;
    });
    state.max -= state.sliderWidth;

    state.cx = state.active * state.slideWidth;
    state.cx = this.clamp(state.active * state.slideWidth);
    // state.cx = 0;
    // state.tx = 0.5;
    state.active = Math.floor(state.cx / state.slideWidth + 0.5);

    if (this.state.oldActive !== this.state.active) {
      this.state.oldActive = this.state.active;
      this.syncTrain.forEach((fn) => {
        fn(this.state.active);
      });
    }

    // this.update();
  };

  get shouldAnimate() {
    return Math.abs(this.state.tx - this.state.cx) > 0.01;
  }

  sync = (fn) => {
    this.syncTrain.push(fn);
  };

  arrow = (dir) => {
    if (dir === 'right') {
      this.state.active += 1;
      this.state.active %= this.slides.length;
    } else {
      this.state.active -= 1;
      if (this.state.active === -1) {
        this.state.active = this.slides.length - 1;
      }
    }
    this.state.cx = this.state.slideWidth * this.state.active;
  };

  update = (t, ct) => {
    if (!this.shouldAnimate) return;

    this.state.tx = lerp(this.state.tx, this.state.cx, this.inertia);
    // this.state.tx = round(this.state.tx);

    this.slider.style.transform = `translate3d(${round(
      -this.state.tx,
    )}px, 0, 0)`;

    // this.slides.forEach((slide, i) => {
    //   slide.dom.style.transform = `translate3d(${-this.state.tx}px, 0, 0)`;
    // });

    if (this.state.oldActive !== this.state.active) {
      this.state.oldActive = this.state.active;
      this.syncTrain.forEach((fn) => {
        fn(this.state.active);
      });
    }

    // this.counter.innerText = this.state.active + 1;
  };

  destroy = () => {
    this.removeDown();
    this.removeUp();
    this.removeMove();
    this.removeWheel();

    ticker.remove(this.tickID);
    ro.remove(this.roID);
  };
}
