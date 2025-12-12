import {
  Iris, iris, LerpController, qs, ticker,
} from '../../hermes';

export class Cursor {
  constructor() {
    this.dom = {
      wrapper: qs('#cursor'),
      bg: {
        x: qs('#crosshair-x'),
        y: qs('#crosshair-y'),
      },
      plus: {
        x: qs('#crosshair-plus--x'),
        y: qs('#crosshair-plus--y'),
      },
    };

    this.mouse = {
      x: { cur: 0, target: 0, inertia: 0.2 },
      y: { cur: 0, target: 0, inertia: 0.2 },
    };

    this.lerp = {
      x: new LerpController(this.mouse.x),
      y: new LerpController(this.mouse.y),
    };

    ticker.add({ update: this.update });
    this.listen();
  }

  listen = () => {
    const { move } = iris.events;
    iris.add(document, move, this.onMove);
  };

  onMove = (e) => {
    const { x, y } = Iris.getXY(e);
    this.mouse.x.cur = x;
    this.mouse.y.cur = y;
  };

  get needsUpdate() {
    return this.lerp.x.needsUpdate() || this.lerp.y.needsUpdate();
  }

  update = () => {
    if (!this.needsUpdate) return;

    this.lerp.x.update();
    this.lerp.y.update();

    // update logic

    this.dom.bg.x.style.transform = `translate3d(0, ${this.mouse.y.target}px, 0)`;
    this.dom.bg.y.style.transform = `translate3d(${this.mouse.x.target}px, 0, 0)`;

    this.dom.plus.x.style.transform = `translate3d(${this.mouse.x.target}px, ${this.mouse.y.target}px, 0)`;
    this.dom.plus.y.style.transform = `translate3d(${this.mouse.x.target}px, ${this.mouse.y.target}px, 0)`;
  };
}
