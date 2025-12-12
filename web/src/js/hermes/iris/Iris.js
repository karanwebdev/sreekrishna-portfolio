import { Conductor } from '../utils';
import { select } from '../utils/Dom';
import { Sniff } from '../utils/Sniff';

export class Iris {
  constructor() {
    /**
     *
     * By default, let events have a
     * passive event handler
     *
     */
    this.defaultOpts = {
      passive: true,
      once: false,
    };

    this.init();
    this.detect();
  }

  init = () => {
    this.keyQ = new Conductor();
    !Sniff.touchDevice
      && this.add(document, 'keydown', this.onKey, { passive: false });
  };

  // Add events
  add = (el, type, callback, opts = {}) => {
    const targets = select(el);

    // attach event listeners to all targets
    for (let i = 0, n = targets.length; i < n; i++) {
      targets[i].addEventListener(type, callback, { ...this.defaultOpts, ...opts });
    }

    // return a remove function for convenience
    return () => {
      Iris.remove(targets, type, callback);
    };
  };

  // Remove events
  static remove = (el, type, callback) => {
    const targets = select(el);
    for (let i = 0, n = targets.length; i < n; i++) {
      targets[i].removeEventListener(type, callback, false);
    }
  };

  static controller = () => new AbortController();

  detect = () => {
    let type = 'pointer';
    let down = 'down';
    let up = 'up';

    if (Sniff.touchDevice) {
      type = 'touch';
      down = 'start';
      up = 'end';
    }

    this.events = {
      down: `${type}${down}`,
      up: `${type}${up}`,
      move: `${type}move`,
      enter: `${type}enter`,
      leave: `${type}leave`,
    };
  };

  static getXY = (e) => ({
    x: e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
    y: e.changedTouches ? e.changedTouches[0].clientY : e.clientY,
  });

  key = (handler) => {
    const id = this.keyQ.add({ update: handler });

    return () => {
      this.keyQ.remove(id);
    };
  };

  onKey = (e) => {
    this.keyQ.train.forEach((item) => item.update && item.update(e));
  };
}

/**
 *
 * Global Iris instance
 *
 */

export const iris = new Iris();
