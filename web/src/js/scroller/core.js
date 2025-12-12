import { Conductor, Sniff } from '../hermes';

// const keyCodes = {
//   LEFT: 37,
//   UP: 38,
//   RIGHT: 39,
//   DOWN: 40,
//   SPACE: 32,
//   PAGEUP: 33,
//   PAGEDOWN: 34,
// };

export class CoreScroll extends Conductor {
  constructor(options) {
    super();

    this.dom = window;

    if (options && options.dom) {
      this.dom = options.dom;
    }

    this.options = {
      mouseMultiplier: 1,
      touchMultiplier: 1,
      firefoxMultiplier: 50,
      // keyStep: 120,
      // preventTouch: false,
      // unpreventTouchClass: "vs-touchmove-allowed",
      // useKeyboard: true,
      ...options,
    };

    this.current = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
    };

    this.touchStart = {
      x: 0,
      y: 0,
    };

    this.scroll = {
      x: 0,
      y: 0,
    };

    this.listen();
  }

  notify = (e) => {
    const evt = this.current;
    evt.x += evt.deltaX;
    evt.y += evt.deltaY;

    const data = {
      x: evt.x,
      y: evt.y,
      deltaX: evt.deltaX,
      deltaY: evt.deltaY,
      originalEvent: e,
    };

    this.train.forEach((item) => {
      item.update && item.update(data);
    });
  };

  onWheel = (e) => {
    const { options } = this;
    const evt = this.current;

    evt.deltaX = -e.deltaX;
    evt.deltaY = -e.deltaY;

    if (Sniff.firefox && e.deltaMode === 1) {
      evt.deltaX *= options.firefoxMultiplier;
      evt.deltaY *= options.firefoxMultiplier;
    }

    evt.deltaX *= options.mouseMultiplier;
    evt.deltaY *= options.mouseMultiplier;

    this.notify(e);
  };

  onScroll = (e) => {
    const evt = this.current;

    evt.deltaX = window.pageXOffset - this.scroll.x;
    evt.deltaY = -window.pageYOffset + this.scroll.y;

    this.scroll.x = window.pageXOffset;
    this.scroll.y = window.pageYOffset;

    this.notify(e);
  };

  onTouchStart = (e) => {
    const t = e.targetTouches ? e.targetTouches[0] : e;
    this.touchStart.x = t.pageX;
    this.touchStart.y = t.pageY;
  };

  onTouchMove = (e) => {
    const { options } = this;

    const evt = this.current;

    const t = e.targetTouches ? e.targetTouches[0] : e;

    evt.deltaX = (t.pageX - this.touchStart.x) * options.touchMultiplier;
    evt.deltaY = (t.pageY - this.touchStart.y) * options.touchMultiplier;

    this.touchStart.x = t.pageX;
    this.touchStart.y = t.pageY;

    this.notify(e);
  };

  // onKeyDown = (e) => {
  //   const evt = this.current;
  //   evt.deltaX = evt.deltaY = 0;
  //   let windowHeight;

  //   if (e.target.nodeName === "INPUT" || e.target.nodeName === "TEXTAREA")
  //     return;

  //   switch (e.keyCode) {
  //     case keyCodes.LEFT:
  //     case keyCodes.UP:
  //       windowHeight = window.innerHeight - 40;
  //       evt.deltaY = this.options.keyStep;
  //       this.notify(e);
  //       break;

  //     case keyCodes.RIGHT:
  //     case keyCodes.DOWN:
  //       windowHeight = window.innerHeight - 40;
  //       evt.deltaY = -this.options.keyStep;
  //       this.notify(e);
  //       break;

  //     case keyCodes.SPACE:
  //       windowHeight = window.innerHeight - 40;
  //       evt.deltaY = windowHeight * (e.shiftKey ? 1 : -1);
  //       this.notify(e);
  //       break;

  //     case keyCodes.PAGEDOWN:
  //       windowHeight = window.innerHeight - 40;
  //       evt.deltaY = -windowHeight;
  //       this.notify(e);
  //       break;

  //     case keyCodes.PAGEUP:
  //       windowHeight = window.innerHeight - 40;
  //       evt.deltaY = windowHeight;
  //       this.notify(e);
  //       break;

  //     default:
  //       return;
  //   }
  // };

  listen = () => {
    if (Sniff.touchDevice) {
      document.addEventListener('scroll', this.onScroll, {
        passive: true,
      });
      if (Sniff.safari) {
        this.dom.addEventListener('touchstart', this.onTouchStart, {
          passive: true,
        });
        this.dom.addEventListener('touchmove', this.onTouchMove, {
          passive: true,
        });
      }
    } else {
      this.dom.addEventListener('wheel', this.onWheel, { passive: true });
      // document.addEventListener("keydown", this.onKeyDown);
    }
  };

  unlisten = () => {
    if (Sniff.touchDevice) {
      document.removeEventListener('scroll', this.onScroll);

      if (Sniff.safari) {
        this.dom.removeEventListener('touchstart', this.onTouchStart);
        this.dom.removeEventListener('touchmove', this.onTouchMove);
      }
    } else {
      this.dom.removeEventListener('wheel', this.onWheel);
      // document.removeEventListener("keydown", this.onKeyDown);
    }
  };

  destroy = () => {
    this.unlisten();
  };
}

export const corescroller = new CoreScroll();
