import { ticker } from '../core';
import { clamp } from '../utils';

/**
 *
 *
 * Utility to run
 * functions over time
 *
 *
 */

export class Duration {
  constructor({
    duration, update, complete, reverse = false,
  }) {
    this.config = {
      complete,
      update,
      duration,
      reverse,
    };

    this.destroy = this.pause;

    this.init();
  }

  init = () => {
    this.completed = false;
    this.elapsed = this.config.reverse ? this.config.duration : 0;
    this.progress = this.config.reverse ? 1 : 0;
    this.paused = true;
    this.play();
  };

  run = (delta = ticker.delta) => {
    const c = this.config;

    if (
      (this.progress >= 1 && !c.reverse)
      || (this.progress <= 0 && c.reverse)
    ) {
      // Duration complete
      this.pause();
      this.completed = true;
      c.complete && c.complete();
    } else {
      // Duration in progress
      this.elapsed += c.reverse ? -delta : delta;
      this.progress = clamp(this.elapsed / c.duration, 0, 1);

      if (c.update) {
        c.update({ progress: this.progress, elapsed: this.elapsed });
      }
    }
  };

  play = () => {
    // extra check to avoid accidentally
    // adding to ticker multiple times
    if (!this.paused) return;
    this.paused = false;
    this.id = ticker.add({
      update: this.run,
    });
  };

  pause = () => {
    // extra check to avoid accidentally
    // removing the incorrect ID
    if (this.paused) return;
    this.paused = true;
    ticker.remove(this.id);
  };

  restart = () => {
    this.pause();
    this.init();
  };

  reverse = () => {
    this.config.reverse = !this.config.reverse;
  };
}
