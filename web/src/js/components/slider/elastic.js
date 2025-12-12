import {
  qs,
  qsa,
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

export class Elastic {
  constructor({
    container = '.elastic-container',
    slides = '.elastic-slide',
    speed = 1.75,
    inertia = 0.075,
  }) {
    this.bounds = { vw: window.innerWidth };

    this.rsize = ro.add({ update: this.resize });
    this.tick = ticker.add({ update: this.run });

    this.start({
      container, slides, speed, inertia,
    });
  }

  start = ({
    container, slides, speed = 1.75, inertia = 0.075,
  }) => {
    this.state = {
      target: 0,
      current: -this.bounds.vw,
      pos: 0,
      diff: 0,
      on: 0,
      cancel: {
        x: 0,
        y: 0,
      },
      max: 0,
      notEnough: false,
      dragging: false,
      resizing: false,
      speed,
      inertia,
      locked: false,
    };

    this.container = qs(container);
    this.slides = qsa(slides, this.container);
    this.inners = this.slides.map((el) => qs('img', el));
    this.total = this.slides.length - 1;

    this.resize();
    this.listen();
  };

  listen = () => {
    if (this.unlisten) this.unlisten();

    let type = 'pointer';
    let down = 'down';
    let up = 'up';

    if (Sniff.touchDevice) {
      type = 'touch';
      down = 'start';
      up = 'end';
    }

    const u1 = iris.add(window, `${type}${up}`, this.up);
    const u2 = iris.add(this.container, `${type}${down}`, this.down);
    const u3 = iris.add(window, `${type}move`, this.move);

    let u4;
    if (!Sniff.touchDevice) {
      u4 = iris.add(this.container, 'wheel', this.scroll);
    }

    this.unlisten = () => {
      u1();
      u2();
      u3();
      u4 && u4();
    };
  };

  getCache = (vw = window.innerWidth) => {
    this.slides.forEach((el) => {
      el.style.transform = 'translate3d(0, 0, 0)';
    });

    this.cache = this.slides.map((el, i) => {
      const { left, right, width } = bounds(el);

      if (i === this.total) {
        this.state.max = right - vw + bounds(this.container).left;
        this.state.notEnough = right < this.bounds.vw;
      }

      return {
        el,
        inner: this.inners[i],
        left,
        width,
        start: left - vw - 100,
        end: right + 100,
        out: true,
      };
    });
  };

  down = (e) => {
    const { x, y } = scroller.getXY(e);

    const { state } = this;

    if (state.locked) return;

    state.dragging = true;

    state.cancel.x = x;
    state.cancel.y = y;

    state.on = state.target + x * this.state.speed;
  };

  move = (e) => {
    const { state } = this;

    if (!state.dragging || state.locked || state.notEnough) return;
    this.allowClick(false);

    const { cancel } = state;
    const { x, y } = scroller.getXY(e);

    if (Math.abs(x - cancel.x) > Math.abs(y - cancel.y)) {
      scroller.lock();
    }

    state.target = state.on - x * this.state.speed;
    this.clamp();
  };

  up = () => {
    if (!this.state.dragging || this.state.locked) return;
    this.state.dragging = false;
    scroller.unlock();
    this.allowClick(true);
  };

  scroll = (e) => {
    const { state } = this;
    if (state.locked || state.notEnough) return;

    state.target += e.deltaX * this.state.speed;
    this.clamp();
  };

  lock = (action = true) => {
    this.state.locked = action;
  };

  clamp = () => {
    const { state } = this;
    state.target = clamp(state.target, 0, state.max);
  };

  visible = ({
    start, end, width, left,
  }, current) => {
    const visible = current > start && current < end;
    const progress = visible
      ? clamp(1 + (current - left - width) / (this.bounds.vw + width), 0, 1)
      : 0;

    return {
      visible,
      progress,
    };
  };

  needsUpdate = () => Math.abs(this.state.current - this.state.target) > 0.1;

  allowClick = (action) => {
    this.container.style.pointerEvents = action ? 'all' : 'none';
  };

  run = () => {
    const { state } = this;

    if (!this.needsUpdate() || state.locked) {
      !state.dragging && this.allowClick(true);
      return;
    }

    state.current = lerp(state.current, state.target, state.inertia);
    state.pos = round(state.current);
    state.diff = (state.target - state.current) * 0.0075;
    state.diff = round(state.diff);

    this.transformSections();
  };

  transformSections = () => {
    const { state } = this;
    const current = state.pos;

    this.cache.forEach((c) => {
      const { visible, progress } = this.visible(c, current);

      if (visible || state.resizing) {
        c.out && (c.out = false);
        this.transform(c.el, c.inner, progress, current);
      } else if (!c.out) {
        c.out = true;
        this.transform(c.el, c.inner, progress, current);
      }
    });
  };

  transform = (el, inner, progress, current, diff = this.state.diff) => {
    const spread = clamp((-25 * progress + 25) * diff, -100, 100);
    const translate = -(current + spread);

    el.style.transform = `translate3d(${translate}px, 0, 0)`;
    inner.style.transform = `translate3d(${-(spread * 0.5)}px, 0, 0)`;
  };

  resize = (o = { vw: window.innerWidth }) => {
    this.state.resizing = true;

    this.bounds.vw = o.vw;

    this.getCache(o.vw);
    this.transformSections();

    this.state.resizing = false;
  };

  destroy = () => {
    ticker.remove(this.tick);
    ro.remove(this.rsize);
    this.unlisten();
  };
}
