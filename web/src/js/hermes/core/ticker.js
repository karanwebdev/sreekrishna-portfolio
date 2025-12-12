import { Conductor } from '../utils';

/**
 *
 * Global ticker to reduce
 * memory overhead
 *
 */

class Ticker extends Conductor {
  constructor() {
    super();

    this.instance = {
      lastFrameTime: 0,
      nextFrame: null,
      targetFPS: 60,
    };

    this.targetDelta = 1000 / this.instance.targetFPS;
    this.delta = this.targetDelta;
    this.maxDelta = this.targetDelta * 2;

    // this.listeners();
    // this.paused = true;

    this.run();
  }

  run = (elapsedTime = 0) => {
    this.delta = elapsedTime - (this.instance.lastFrameTime || 0);
    this.instance.nextFrame = requestAnimationFrame(this.run);
    this.instance.lastFrameTime = elapsedTime;

    this.delta = Math.min(this.delta, this.maxDelta);

    for (let i = 0, n = this.train.length; i < n; i++) {
      this.train[i]?.update(this.delta, elapsedTime);
    }
  };

  // pause = () => {
  //   if (this.paused) return;
  //   if (!this.instance) return;
  //   cancelAnimationFrame(this.instance.nextFrame);
  //   this.instance.nextFrame = null;
  //   this.paused = true;
  // }

  // play = () => {
  //   if (!this.paused) return;
  //   this.paused = false;
  //   this.instance.lastFrameTime = performance.now();
  //   this.instance.nextFrame = requestAnimationFrame(this.run);
  // }

  // listeners = () => {
  //   iris.add(document, "visibilitychange", () => {
  //     document.visibilityState === "hidden" ? this.pause() : this.play();
  //   });

  //   !Sniff.safari && iris.add(window, "pagehide", this.pause);
  // }
}

// Global ticker
export const ticker = new Ticker();
