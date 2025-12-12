import {
  qs, ro, ticker, Tween, Sniff,
} from '../hermes';

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

class CameraLens {
  constructor() {
    this.canvas = qs('#twod');
    this.ctx = this.canvas.getContext('2d');
    this.unit = Sniff.mobile ? 'vw' : 'vh';

    this.bounds = { vw: window.innerWidth, vh: window.innerHeight };

    this.init();
  }

  init = () => {
    // debugger;
    this.paused = false;
    this.config = {
      intro: {
        progress: {
          inner: 0,
          outer: 0,
        },
      },
    };
    this.tickID = ticker.add({
      update: this.draw,
    });
    this.roID = ro.add({
      update: this.resize,
    });

    this.resize();
  };

  intro = () => {
    this.play();
    this.kill();
    const t1 = Tween({
      val: [0, 1],
      duration: 1500,
      easing: 'io6',
      update: ({ cur }) => {
        this.config.intro.progress.inner = cur;
      },
    });
    const t2 = Tween({
      val: [0, 1],
      duration: 1750,
      easing: 'io6',
      update: ({ cur }) => {
        this.config.intro.progress.outer = cur;
      },
      complete: () => {
        this.pause();
      },
    });
    this.tweens = [t1, t2];
  };

  reverse = () => {
    this.play();
    this.kill();
    const t1 = Tween({
      val: [1, 0],
      duration: 1500,
      easing: 'o6',
      update: ({ cur }) => {
        this.config.intro.progress.inner = cur;
      },
    });
    const t2 = Tween({
      val: [1, 0],
      duration: 1750,
      easing: 'o6',
      update: ({ cur }) => {
        this.config.intro.progress.outer = cur;
      },
      complete: () => {
        this.pause();
      },
    });
    this.tweens = [t1, t2];
  };

  kill = () => {
    if (this.tweens) {
      this.tweens.forEach((t) => t.destroy());
    }
  };

  draw = (t = 16.67) => {
    if (this.paused) return;
    // console.log("playing");

    this.ctx.strokeStyle = '#dbdbdb22';
    this.ctx.lineWidth = 1;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // inner circle
    const innerCircle = new Path2D();
    const iP = Math.PI * this.config.intro.progress.inner;
    innerCircle.arc(this.hvw, this.hvh, this.radius, iP, 3 * iP, false);
    this.ctx.stroke(innerCircle);

    // outer circle
    const outerCircle = new Path2D();
    const oP = Math.PI * this.config.intro.progress.outer;
    outerCircle.arc(
      this.hvw,
      this.hvh,
      this.radius + this.offset,
      oP,
      3 * oP,
      false,
    );
    this.ctx.stroke(outerCircle);

    this.ctx.fillStyle = 'orangered';
  };

  resize = (o = { vw: window.innerWidth, vh: window.innerHeight }) => {
    this.bounds = o;
    this.canvas.height = this.bounds.vh;
    this.canvas.width = this.bounds.vw;

    this.radius = (0.9 * this.bounds[this.unit]) / Math.sqrt(2);
    this.offset = 0.05 * this.bounds[this.unit];
    this.hvh = this.bounds.vh / 2;
    this.hvw = this.bounds.vw / 2;

    const state = this.paused;
    this.paused = false;
    this.draw();
    this.paused = state;
  };

  pause = () => {
    this.paused = true;
  };

  play = () => {
    this.paused = false;
  };

  reset = () => {
    this.tweens.forEach((t) => t.destroy());
    this.config.intro = {
      progress: {
        inner: 0,
        outer: 0,
      },
    };
    this.draw();
  };

  destroy = () => {
    ticker.remove(this.tickID);
    ro.remove(this.roID);
  };
}

export const c2d = new CameraLens();
