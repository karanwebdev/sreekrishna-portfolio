import {
  iris, clamp, ro, Iris,
} from '../../hermes';
import { CoreScroll } from '../../scroller';

export class Grid {
  constructor({ gl, manager }) {
    this.gl = gl;
    this.media = gl.media;
    this.manager = manager;
    this.mediaL = gl.mediaL;

    this.settings = {
      dragSpeed: 3,
      inertia: 0.075,
      hover: true,
      activePlay: false,
      hoverPlay: true,
      opacity: { low: 0.5, mid: 0.75, high: 1 },
    };

    this.state = {
      idx: 0,
      dragging: false,
      wasDragging: false,
      scrolling: false,
      pos: {
        sy: 0, // start
        cy: 0, // current
        ly: 0, // last
      },
      active: false,
    };

    this.scroll = new CoreScroll();

    window.grid = this;
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

    pos.sy = Iris.getXY(e).y;
    pos.ly = pos.cy;
  };

  onMove = (e) => {
    const { x, y } = Iris.getXY(e);
    this.manager.setCursorPos(x, y);

    if (!this.state.dragging) return;

    const { pos } = this.state;

    const delta = pos.sy - y;
    if (Math.abs(delta) < 5) return;

    pos.cy = pos.ly + delta * this.settings.dragSpeed;
    pos.cy = this.clamp(pos.cy);
    this.state.wasDragging = true;
  };

  onUp = () => {
    this.state.dragging = false;
    this.snap();
  };

  onKey = (e) => {
    if (e.code === 'ArrowDown') {
      this.next();
    } else if (e.code === 'ArrowUp') {
      this.prev();
    } else if (e.code === 'Enter') {
      if (this.manager.state.hover >= 0) {
        this.state.idx = this.manager.state.hover;
      }
      this.manager.goto('slider');
    }
  };

  onScroll = ({ deltaY }) => {
    const { pos } = this.state;
    pos.cy -= deltaY;
    pos.cy = this.clamp(pos.cy);
    this.state.scrolling = true;
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

    this.state.idx = this.manager.state.hover;
    this.manager.goto('slider');
  };

  next = () => {
    const { pos, idx } = this.state;
    pos.cy = (Math.floor(idx / 3) + 1) * this.manager.vspan;
    pos.cy = this.clamp(pos.cy);
  };

  prev = () => {
    const { pos, idx } = this.state;
    pos.cy = (Math.floor(idx / 3) - 1) * this.manager.vspan;
    pos.cy = this.clamp(pos.cy);
  };

  // goto = (idx) => {
  //   const { pos } = this.state;
  //   pos.cy = Math.floor(idx / 3) * this.manager.vspan;
  //   pos.cy = this.clamp(pos.cy);
  // }

  snap = () => {
    const idx = this.getIdx();
    this.state.pos.cy = Math.floor(idx / 3) * this.manager.vspan;
  };

  clamp = (val) => {
    const max = (this.manager.vspan) * Math.floor((this.mediaL - 1) / 3);
    return clamp(val, 0, max);
  };

  // return idx of middle item in grid
  getIdx = () => {
    const { pos } = this.state;
    // take min because sometimes middle item does not exist
    return Math.min(Math.round(pos.cy / this.manager.vspan) * 3 + 1, this.mediaL - 1);
  };

  on = () => {
    // console.log('Grid: On');
    this.listen();
    this.state.pos.cy = Math.floor(this.manager.active / 3) * this.manager.vspan;
    this.state.active = true;
  };

  off = () => {
    // console.log('Grid: Off');
    this.unlisten();
    this.state.active = false;
  };

  in = () => {
    this.on();
  };

  out = () => {
    this.off();

    const idx = this.getIdx();
    const activeRow = Math.ceil((idx + 1) / 3) - 1;
    this.state.pos.cy = idx * this.manager.span;

    const s2 = this.gl.settings.planeDims[this.gl.state.mode].c.h / 2;
    const { g } = this.gl.settings.planeDims[this.gl.state.mode].c;
    const r2 = ro.bounds.vh / 2;

    const outTop = -r2 - s2 - g;
    const outBottom = r2 + s2 + g;

    this.manager.rects.forEach((rect, i) => {
      const row = Math.ceil((i + 1) / 3) - 1;

      if (row >= activeRow) {
        rect.y.cur = outTop;
      } else {
        rect.y.cur = outBottom;
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
    const { vspan } = this.manager;

    this.state.idx = this.getIdx();
    this.manager.active = this.state.idx;

    const y = this.clamp(pos.cy);

    // update planes
    this.manager.rects.forEach((rect, idx) => {
      const col = (idx % 3) - 1;
      const row = Math.ceil((idx + 1) / 3) - 1;

      rect.x.cur = span * (col);
      rect.y.cur = (-vspan * row) + y;

      rect.w.cur = this.gl.settings.planeDims.grid.c.w;
      rect.h.cur = this.gl.settings.planeDims.grid.c.h;

      if (this.manager.state.hover < 0) {
        rect.o.cur = this.settings.opacity.mid;
      } else if (idx === this.manager.state.hover) {
        rect.o.cur = this.settings.opacity.high;
      } else {
        rect.o.cur = this.settings.opacity.mid;
      }
    });
  };
}
