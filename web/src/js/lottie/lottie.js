import bodymovin from './lib_light';
import { select, Observer, qs } from '../hermes';

export const LottieLoader = (dataArr) => {
  dataArr.forEach((el, i) => {
    el.data.assets.forEach((asset) => {
      asset.u = `/static/lottie/${el.path}/images/`;
    });
  });
};

/**
 *
 * Expected markup
 *
 * <div id="hero-anim">
     <canvas id="hero-anim--canvas"></canvas>
  </div>
 *
 *
 */

export class Lottie {
  constructor({
    target, data, lazy = false, observe = true,
  }) {
    [this.target] = select(target);
    this.canvas = qs('canvas', this.target);
    this.data = data;
    this.shouldObserve = observe;

    Object.assign(this.canvas.style, {
      width: '100%',
      height: '100%',
      transformOrigin: '0 0 0',
      contain: 'content',
    });

    this.ctx = this.canvas.getContext('2d');

    if (lazy) {
      idly(this.init);
    } else {
      this.init();
    }
  }

  init = () => {
    this.anim = bodymovin.loadAnimation({
      wrapper: this.canvas,
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData: this.data,
      rendererSettings: {
        context: this.ctx,
        clearCanvas: true,
        scaleMode: 'noScale',
      },
    });

    this.shouldObserve && this.observe();
  };

  change = (node, isIntersecting, unobserve) => {
    if (isIntersecting) {
      this.anim.play();
    } else {
      this.anim.pause();
    }
  };

  destroy = () => {
    this.anim.destroy();
    this.o?.disconnect();
  };

  observe = () => {
    this.o = Observer.create({
      callback: this.change,
    });
    this.o.observe(this.target);
  };
}

export { bodymovin };
