import {
  qs, qsa, Vau, iris,
} from '../hermes';
import { TextSlider } from '.';

/**
 *
 * TODO:
 * Use Reveal's play method to animate extra targets?
 *
 */

export class SliderManager {
  constructor() {
    this.arrows = {
      prev: qs('.slider-btn--prev'),
      next: qs('.slider-btn--next'),
    };

    this.init();
    this.listen();
  }

  init = () => {
    this.t = new TextSlider({
      targets: qsa('.testimonial-item'),
      stagger: 100,
    });
    this.names = qsa('.testimonial-name .l-line');
    this.titles = qsa('.testimonial-title .l-line');

    this.targets = [];
    this.names.forEach((el, i) => {
      const t = [el, this.titles[i]];
      this.targets.push(t);
    });

    this.tweens = [];

    this.in();
  };

  listen = () => {
    const u1 = iris.add(this.arrows.next, 'click', this.next);
    const u2 = iris.add(this.arrows.prev, 'click', this.prev);

    this.unlisten = () => {
      u1();
      u2();
    };
  };

  in = () => {
    // new one

    this.tweens[this.t.active] = new Vau({
      targets: this.targets[this.t.active],
      transform: {
        y: [110, 0],
        yu: '%',
      },
      easing: 'o6',
      duration: 1250,
      delay: 800,
    });
  };

  out = () => {
    // old stuff

    const o = this.tweens[this.t.active];
    o.destroy();

    this.tweens[this.t.active] = new Vau({
      targets: this.targets[this.t.active],
      transform: {
        y: [o.cur[0], -110],
        yu: '%',
      },
      duration: 800,
      easing: 'i3',
    });
  };

  next = () => {
    this.out();

    this.t.handleClick(false);

    this.in();
  };

  prev = () => {
    this.out();

    this.t.handleClick(true);

    this.in();
  };

  destroy = () => {
    this.unlisten();
    this.tweens.forEach((t) => t.destroy());
    this.t.destroy();
  };
}
