import { Observer } from '../../hermes';

class FXManager {
  constructor() {
    this.o = Observer.create({ callback: FXManager.change });
  }

  static change = (node, isIntersecting, unobserve) => {
    requestAnimationFrame(() => {
      if (isIntersecting) {
        node.classList.add('fx-on');
        if (node.classList.contains('fx-once')) {
          unobserve(node);
        }
      } else {
        node.classList.remove('fx-on');
      }
    });
  };

  add = (target = '.fx') => {
    this.o.observe(target);
  };

  remove = (target) => {
    this.o.unobserve(target);
  };

  destroy = () => {
    this.o.disconnect();
  };
}

export const fx = new FXManager();
