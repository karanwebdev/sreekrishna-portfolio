import {
  lerp, round, select, Conductor,
} from '../utils';
import { Ease } from './Ease';
import { Duration } from './Duration';
import { Transform } from './Transform';

/**
 *
 * TODO:
 * ======
 *
 *
 *
 */

/**
 *
 * Example
 * ========
 *
 *
 * iris.add(window, "load", () => {
  const els = qsa(".hello");
  const tl = new Timeline();

  tl.add({
    targets: els,
    easing: "io6",
    duration: 2000,
    transform: {
      x: [0, 400],
    },
  });

  tl.add({
    targets: els,
    easing: "io6",
    duration: 2000,
    transform: {
      x: [400, 0],
    },
  });

  iris.add(document, "click", () => {
    tl.restart();
  });
});

 */

/**
 *
 * Target API:
 * ===========
 *
 * new Vau({
 *   targets: [el],
 *   easing: "io3",
 *   duration: 1000,
 *   transform: {
 *     x: [0, 100],                     // [from, to]
 *     xu: "%"                          // unit,
 *     y: 300,                          // take default 0 + px, else from previous animation in timeline
 *     sx: [1, 2],                      // scale x
 *     sy: [1, 2],                      // scale y
 *     r: [
 *          [0, 0, 0, 90],
 *          [0, 0, 1, 0]
 *        ],                            // rotate3d, default unit - degrees
 *   },
 *   opacity: [0, 1],
 *   reverse: true,
 *   autoplay: false,
 * });
 *
 *
 */

// =================================================================
// =================================================================
// =================================================================
// =================================================================

//
//
//
// Tweens
// ========
//
// Runs n tweens simultaneously
//
//

export const Tweens = ({
  vals,
  duration,
  easing = 'linear',
  update,
  complete,
  reverse,
}) => {
  const easeFn = Ease[easing];
  const cur = new Float32Array(vals.length);
  let progE = 0;

  return new Duration({
    duration,
    update: ({ progress }) => {
      progE = easeFn(progress);

      for (let i = vals.length - 1; i >= 0; i--) {
        const val = vals[i];
        // skip computation if start and end is same
        if (val[0] === val[1]) {
          cur[i] = val[0];
        } else {
          cur[i] = lerp(val[0], val[1], progE);
        }
      }

      update({
        progress,
        progressEase: progE,
        cur,
      });
    },
    complete,
    reverse,
  });
};

//
//
//
// Tween
// ========
//
// Runs a single tween
// Basically a convenience wrapper around Tweens.
// Ideally should not be used, prefer Tweens.
//
//

export const Tween = ({
  val, duration, easing, update, complete,
}) => Tweens({
  duration,
  vals: [val],
  easing,
  update: ({ progress, progressEase, cur }) => {
    update({ progress, progressEase, cur: cur[0] });
  },
  complete,
});

/**
 *
 *
 *
 * Vau animation engine
 *
 *
 */

export class Vau {
  constructor({
    targets = null,

    duration = 0,
    delay = 0,
    easing = 'linear',

    transform = null,
    opacity = null,

    begin = null,
    complete = null,
    update = null,

    autoplay = true,
    reverse = false,
  }) {
    // convert transforms and opacity to typed arrays?
    this.config = {
      targets,
      duration,
      easing,
      begin,
      update,
      complete,
      transform,
      opacity,
      delay,
      autoplay,
      reverse,
    };

    // works because input should be array or function
    this.flags = {
      t: !!transform,
      o: !!opacity,
    };

    this.init();
  }

  init = () => {
    const c = this.config;

    if (this.flags.t) {
      const { transform } = c;

      // use only first value
      this.t3d = new Transform({
        ...transform,
        x: transform.x && transform.x[0],
        y: transform.y && transform.y[0],
        r: transform.r && transform.r[0],
      });
    }

    if (this.flags.o) {
      this.o = c.opacity;
    }

    this.setupProps();
    this.setTargets();
    this.start();
  };

  setTargets = (targets = this.config.targets) => {
    targets = select(targets);
    this.configure({
      targets,
      targetsLength: targets.length,
      targetsStyles: targets.map((t) => t.style),
    });
  };

  setupProps = () => {
    // convert to hashmap object?
    this.keys = [];
    this.vals = [];

    // local copy for faster access + readability
    const c = this.config;
    const { transform } = c;

    // transform is needed
    if (this.flags.t) {
      const tflags = this.t3d.flags;

      // translate needed
      if (tflags.t) {
        if (transform.x) {
          this.keys.push('x');
          this.vals.push(new Float32Array(transform.x));
        }
        if (transform.y) {
          this.keys.push('y');
          this.vals.push(new Float32Array(transform.y));
        }
      }
      // scale needed
      if (tflags.s) {
        if (transform.sx) {
          this.keys.push('sx');
          this.vals.push(new Float32Array(transform.sx));
        }
        if (transform.sy) {
          this.keys.push('sy');
          this.vals.push(new Float32Array(transform.sy));
        }
      }
      // rotate needed
      if (tflags.r) {
        const { r } = transform;
        const r0 = r[0];
        const r1 = r[1];
        this.keys.push('rx', 'ry', 'rz', 'rv');
        this.vals.push(
          new Float32Array([r0[0], r1[0]]),
          new Float32Array([r0[1], r1[1]]),
          new Float32Array([r0[2], r1[2]]),
          new Float32Array([r0[3], r1[3]]),
        );
      }
    }

    // opacity needed
    if (this.flags.o) {
      this.keys.push('o');
      this.vals.push(new Float32Array(this.o));
    }

    this.props = {};
    this.cur = [];
    this.vals.forEach((val, i) => {
      this.cur[i] = val[0];
    });
  };

  start = (options = {}) => {
    this.configure(options);
    const c = this.config;

    this.tweens = Tweens({
      vals: options.vals || this.vals,
      duration: c.duration,
      easing: c.easing,
      update: this.run,
      complete: () => {
        c.complete && c.complete();
        this.destroy();
      },
    });
    this.tweens.pause();

    this.delay = new Duration({
      duration: c.delay,
      complete: () => {
        this.tweens.play();
        c.begin && c.begin();
      },
    });
    if (!c.autoplay) {
      this.delay.pause();
    }
  };

  run = ({ progress, progressEase, cur }) => {
    this.cur = cur;

    for (let i = 0, n = this.keys.length; i < n; i++) {
      const key = this.keys[i];
      this.props[key] = round(cur[i]);
    }

    if (this.flags.t) {
      this.t3d.setTransform(this.props);
    }

    for (let i = 0, n = this.config.targetsLength; i < n; i++) {
      const s = this.config.targetsStyles[i];
      this.flags.t && (s.transform = this.t3d.transform);
      this.flags.o && (s.opacity = this.props.o);
    }

    this.config.update
      && this.config.update({
        progress,
        progressEase,
        props: this.props,
        config: this.config,
      });
  };

  unset3d = () => {
    if (!this.flags.t) return;
    // Convert 3d transform to 2d to save GPU memory
    this.t3d.convert2d();
    for (const target of this.config.targets) {
      target.style.transform = this.t3d.transform;
    }
  };

  // =======================
  // =======================
  //
  // Public API
  //
  // =======================
  // =======================

  restart = (options = {}) => {
    this.delay.destroy();
    this.tweens.destroy();
    this.start(options);
  };

  pause = () => {
    this.delay.pause();
    this.tweens.pause();
  };

  play = () => {
    this.delay.play();
    this.delay.completed && this.tweens.play();
  };

  configure = (options = {}) => {
    Object.assign(this.config, options);
  };

  reverse = (options = {}) => {
    this.tweens.destroy();
    this.configure(options);

    const c = this.config;
    c.reverse = !c.reverse;

    const ptr = c.reverse ? 0 : 1;
    const vals = new Array(this.vals.length);

    for (let i = this.vals.length - 1; i >= 0; i--) {
      vals[i] = [this.cur[i], this.vals[i][ptr]];
    }

    this.start({ vals });
  };

  destroy = () => {
    this.delay.destroy();
    this.tweens.destroy();
    this.unset3d();
    this.t3d?.destroy();
  };
}

//
// Generic Timeline
// ================
//
//

export class GenericTimeline extends Conductor {
  constructor() {
    super();
  }

  do = (action, args) => {
    this.train.forEach((o) => o.anim[action](args));
  };
}

/**
 *
 *
 * Timeline Animations
 * ====================
 * + Runs Vau in timeline
 *
 */

export class Timeline extends GenericTimeline {
  constructor(o) {
    super();
    this.delay = 0;
    this.defaults = o || {};
  }

  add = (o) => {
    o = {
      ...this.defaults,
      ...o,
    };

    // this.delay += o.delay || 0;
    // o.delay = this.delay;
    const anim = new Vau(o);
    const id = super.add({ anim });
    // automatically start after end of previous animation
    // this.delay += o.duration;

    return { anim, id };
  };

  play = () => {
    this.do('play');
  };

  pause = () => {
    this.do('pause');
  };

  getProgress = () => {
    const n = this.train.length;
    if (!n) return 0;

    let total = 0;
    this.train.forEach(({ anim }) => (total += anim.tweens.progress));

    return total / n; // progress from 0 - 1
  };
}
