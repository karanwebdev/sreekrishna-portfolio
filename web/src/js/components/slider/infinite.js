import {
  qsa, select, bounds, ticker, ro, round, Observer,
} from '../../hermes';

export class InfiniteSlider {
  constructor({
    container = '.carousel-container',
    slides = '.carousel-slide',
    speed = 1,
  }) {
    [this.container] = select(container);
    this.slides = qsa(slides, this.container);
    this.speed = speed * 0.1;
    this.visible = false;

    this.o = Observer.create({
      callback: this.change,
    });
    this.o.observe(this.container);

    this.resize();

    this.tick = ticker.add({ update: this.update });
    this.ro = ro.add({ update: this.resize });
  }

  update = (t) => {
    for (let i = 0, n = this.cache.length; i < n; i++) {
      const el = this.cache[i];
      el.x += t * this.speed;
      el.p = el.x + el.left;
      if (el.p > this.maxWidth) {
        el.x -= this.totalWidth;
      }
      if (el.p < this.maxWidth && el.p + el.width > 0) {
        el.style.transform = `translate3d(${round(el.x)}px, 0, 0)`;
      }
    }
  };

  resize = () => {
    this.cache = [];
    this.maxWidth = bounds(this.container).width;
    this.totalWidth = 0;
    this.slides.forEach((el) => {
      el.style.transform = 'translate3d(0, 0, 0)';
    });
    this.slides.forEach((el) => {
      const b = bounds(el);
      this.cache.push({
        style: el.style,
        left: b.left,
        width: b.width,
        x: 0,
        p: 0,
      });
      this.totalWidth += b.width;
    });
  };

  pause = () => {
    ticker.remove(this.tick);
  };

  play = () => {
    this.tick = ticker.add({ update: this.update });
  };

  destroy = () => {
    ticker.remove(this.tick);
    ro.remove(this.ro);
    this.o.disconnect();
  };

  change = (node, isIntersecting, unobserve) => {
    isIntersecting ? this.play() : this.pause();
  };
}
