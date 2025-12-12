import { Throttle, Conductor } from '../utils';
import { iris } from '../iris';

class RO extends Conductor {
  constructor() {
    super();

    this.throttledUpdate = Throttle({ update: this.update, onlyAtEnd: true });
    this.bounds = { vw: window.innerWidth, vh: window.innerHeight };
    this.listen();
    this.internalUpdate();
  }

  listen = () => {
    iris.add(window, 'resize', this.throttledUpdate);
    iris.add(window, 'orientationchange', this.throttledUpdate);
  };

  update = () => {
    this.bounds = { vw: window.innerWidth, vh: window.innerHeight };
    this.internalUpdate();

    for (let i = 0, n = this.train.length; i < n; i++) {
      this.train[i].update(this.bounds);
    }
  };

  internalUpdate = () => {
    this.mode = this.bounds.vw <= 375 ? 'sm' : this.bounds.vw <= 850 ? 'md' : 'lg';
    this.breakpoint = this.bounds.vw <= 375 ? 375 : this.bounds.vw <= 850 ? 850 : 1440;

    // set css vh for consistency
    document.documentElement.style.setProperty(
      '--1vh',
      `${this.bounds.vh / 100}px`,
    );
  };
}

export const ro = new RO();
