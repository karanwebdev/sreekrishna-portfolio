import {
  Duration, select, ro, iris, qs,
} from '../hermes';
import { Reveal } from './reveal';

export class TextSlider {
  constructor({
    targets, delay = 700, stagger = 0, arrows,
  }) {
    //   create slider
    this.slides = select(targets);
    this.delay = delay;
    this.stagger = stagger;
    this.reveals = new Array(this.slides.length);
    this.slides.forEach((slide, i) => {
      this.reveals[i] = new Reveal({
        duration: 800,
        targets: slide,
        stagger: this.stagger,
        auto: false,
      });
    });

    this.anim = { completed: true };
    this.active = 0;
    this.show();

    this.arrows && this.listen();

    ro.add({
      update: this.resize,
    });
  }

  show = (id = this.active) => {
    //   show {id} slide

    if (!this.anim.completed) {
      this.anim.destroy();
    }

    this.active = id;
    this.anim = new Duration({
      duration: this.delay,
      complete: () => {
        this.reveals[this.active].play({
          easing: 'o6',
          to: 0,
          from: 102,
          duration: 1250,
        });
      },
    });
  };

  hide = (id = this.active) => {
    this.reveals[this.active].playTo({
      easing: 'i3',
      to: -110,
      duration: 800,
    });
  };

  resize = () => {
    this.reveals.forEach((reveal, i) => {
      if (i === this.active) return;
      reveal.play({ from: 101, to: 102 });
    });
  };

  handleClick = (prev = false) => {
    this.hide();

    this.active = prev ? this.active - 1 : this.active + 1;
    this.active %= this.slides.length;
    this.active === -1 && (this.active = this.slides.length - 1);

    this.show();
  };

  destroy = () => {
    this.anim.destroy();
    this.reveals.forEach((reveal) => {
      reveal.destroy();
    });
  };
}
