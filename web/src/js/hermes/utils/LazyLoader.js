import { select } from './Dom';
import { Observer } from '..';

// TODO
// Use Intersection?
export class LazyLoader {
  constructor() {
    this.observer = Observer.create({
      callback: this.handleIntersect,
      threshold: 0.1,
    });
  }

  load(selector = '.fade-in--img') {
    this.observer.disconnect();
    this.els = select(selector);
    this.observer.observe(this.els);
  }

  handleIntersect = (node, isIntersecting) => {
    if (isIntersecting) {
      node.classList.add('media-ready');
      this.observer.unobserve(node);
    }
  };
}

export const lazyloader = new LazyLoader();
