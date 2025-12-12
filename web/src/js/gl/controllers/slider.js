import { CoreScroll } from '../../scroller';
import {
  iris, clamp, ro, Iris,
} from '../../hermes';

export class Slider {
  constructor({ gl, manager }) {
    this.gl = gl;
    this.manager = manager;
    this.media = gl.media;
    this.mediaL = gl.mediaL;

    this.settings = {
      dragSpeed: 3,
      inertia: 0.075,
      activePlay: true,
      hover: true,
      opacity: { low: 0.5, mid: 0.75, high: 1 },
    };

    this.state = {
      idx: 0,
      dragging: false,
      wasDragging: false,
      scrolling: false,
      pos: {
        sx: 0, // start
        cx: 0, // current
        lx: 0, // last
      },
      active: false,
    };

    this.scroll = new CoreScroll();

    window.slider = this;
    window.iris = iris;
  }

  listen = () => {
    this.unlisten();
    const { down, up, move } = iris.events;

    this.unDown = iris.add(this.gl.gl.canvas, down, this.onDown);
    this.unMove = iris.add(window, move, this.onMove);
    this.unUp = iris.add(window, up, this.onUp);
    this.unKey = iris.key(this.onKey);
    this.unClick = iris.add(this.gl.gl.canvas, 'click', this.onClick);
    this.scrollID = this.scroll.add({ update: this.onScroll });
  };

  unlisten = () => {
    this.unDown && this.unDown();
    this.unUp && this.unUp();
    this.unClick && this.unClick();
    this.unKey && this.unKey();
    this.scrollID && this.scroll.remove(this.scrollID);

    this.unDown = false;
    this.unUp = false;
    this.unClick = false;
    this.unKey = false;
    this.scrollID = false;
  };

  onDown = (e) => {
    this.state.dragging = true;
    const { pos } = this.state;

    pos.sx = Iris.getXY(e).x;
    pos.lx = pos.cx;
  };

  onMove = (e) => {
    const { x, y } = Iris.getXY(e);
    this.manager.setCursorPos(x, y);

    if (!this.state.dragging) return;
    const { pos } = this.state;

    const delta = pos.sx - x;
    if (Math.abs(delta) < 5) return;

    pos.cx = pos.lx + delta * this.settings.dragSpeed;
    pos.cx = this.clamp(pos.cx);
    this.state.wasDragging = true;
  };

  onUp = () => {
    this.state.dragging = false;
    this.snap();
  };

  onKey = (e) => {
    if (e.code === 'ArrowRight') {
      this.next();
    } else if (e.code === 'ArrowLeft') {
      this.prev();
    } else if (e.code === 'Escape') {
      this.manager.goto('grid');
    }
  };

  onClick = (e) => {
    if (this.state.wasDragging) {
      this.state.wasDragging = false;
      return;
    }

    if (!this.settings.hover) {
      const { x, y } = Iris.getXY(e);
      this.manager.setCursorPos(x, y);
      this.manager.updateCursor();
    }

    if (this.manager.state.hover < 0) return;

    this.goto(this.manager.state.hover);
  };

  onScroll = ({ deltaX, deltaY }) => {
    const { pos } = this.state;
    pos.cx -= Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    pos.cx = this.clamp(pos.cx);
    this.state.scrolling = true;
  };

  next = () => {
    this.goto(this.state.idx + 1);
  };

  prev = () => {
    this.goto(this.state.idx - 1);
  };

  goto = (idx) => {
    const { pos } = this.state;
    pos.cx = idx * this.manager.span;
    pos.cx = this.clamp(pos.cx);
  };

  snap = () => {
    const idx = this.getIdx();
    this.state.pos.cx = idx * this.manager.span;
  };

  clamp = (val) => {
    const max = (this.manager.span) * (this.media.length - 1);
    return clamp(val, 0, max);
  };

  getIdx = () => {
    const { pos } = this.state;
    return Math.round(pos.cx / this.manager.span);
  };

  on = () => {
    // console.log('Slider: On');
    this.listen();
    this.state.pos.cx = this.manager.active * this.manager.span;
    this.state.active = true;
  };

  off = () => {
    // console.log('Slider: Off');
    this.unlisten();
    this.state.active = false;
  };

  in = () => {
    this.on();
  };

  out = () => {
    this.off();

    const idx = this.getIdx();
    this.state.pos.cx = idx * this.manager.span;

    const s2 = this.gl.settings.planeDims[this.gl.state.mode].c.w / 2;
    const r2 = ro.bounds.vw / 2;
    const g = this.gl.settings.planeDims[this.gl.state.mode].c.g / 2;

    const outLeft = -r2 - s2 - g;
    const outRight = r2 + s2 + g;

    this.manager.rects.forEach((rect, i) => {
      if (i <= idx) {
        rect.x.cur = outLeft;
      } else {
        rect.x.cur = outRight;
      }
    });
  };

  // eslint-disable-next-line class-methods-use-this
  resize = () => {
    // this.update();
  };

  update = () => {
    if (!this.state.active) return;

    const { pos } = this.state;
    const { span } = this.manager;

    this.state.idx = this.getIdx();
    this.manager.active = this.state.idx;

    // update planes
    this.manager.rects.forEach((rect, idx) => {
      const base = span * idx;
      const x = base - pos.cx;

      rect.x.cur = x;
      rect.y.cur = 0;
      rect.w.cur = this.gl.settings.planeDims.slider.c.w;
      rect.h.cur = this.gl.settings.planeDims.slider.c.h;

      if (idx === this.state.idx) {
        rect.o.cur = this.settings.opacity.high;
      } else if (idx === this.manager.state.hover) {
        rect.o.cur = this.settings.opacity.mid;
      } else {
        rect.o.cur = this.settings.opacity.low;
      }
    });
  };
}
