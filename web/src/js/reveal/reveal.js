import {
  select, ro, Timeline, Ease, Observer,
} from '../hermes';
import { Split } from './split';

/**
 *
 * insert: [
 *    {
 *      index: 0,
 *      token: '<span class="highlight">
 *    },
 *    {
 *      index: 10,
 *      token: '</span>
 *    },
 * ]
 *
 */

export class Reveal {
  constructor({
    targets,

    indent = {},
    char = false,
    word = false,

    from = 102,
    to = 0,
    axis = 'y',
    rotate = false,
    stagger = 0,
    delay = 0,
    easing = 'o6',
    duration = 1750,

    auto = false,
    threshold = 0.5,
    needsAutoResize = true,
  }) {
    Object.assign(this, {
      targets: select(targets),
      stagger,
      delay,
      auto,
      threshold,
      easing,
      duration,
      from,
      to,
      axis,
      rotate,
    });

    this.state = {
      visible: false,
    };

    // init stuff
    this.tween = new Timeline();
    this.instances = this.targets.map(
      (target) => new Split({
        target, word, char, indent,
      }),
    );

    this.resize();
    needsAutoResize && ro.add({ update: this.resize });
    auto && this.setupAuto();
  }

  resize = () => {
    this.instances.forEach((split) => split.resize());
    this.setTargetTokens();
    if (this.state.visible) {
      this.targetTokens.forEach((token) => {
        token.style.transform = 'none';
      });
    }
  };

  play = ({
    targets = this.targetTokens,
    delay = this.delay,
    to = this.to,
    from = this.from,
    duration = this.duration,
    easing = this.easing,
    stagger = this.stagger,
    reverse = false,
    reverseDelay = 0,
    visible = this.state.visible,
    autoplay = true,
    axis = this.axis,
  } = {}) => {
    this.state.visible = visible;

    if (reverse && this.tween) {
      this.tween.do('reverse', {
        targets,
        delay: reverseDelay || 0,
      });
      return;
    }

    this.tween?.do('destroy');
    this.tween = new Timeline({
      duration,
      easing,
    });

    targets.forEach((target, i) => {
      this.tween.add({
        targets: target,
        delay: delay + i * stagger,
        autoplay,
        transform: {
          [axis]: [from, to],
          [`${axis}u`]: '%',
          r: this.rotate
            ? [
              [1, 0, 0, -180],
              [1, 0, 0, 0],
            ]
            : false,
        },
      });
    });
  };

  playTo = ({
    delay = this.delay,
    to = this.to,
    duration = this.duration,
    easing = this.easing,
    stagger = this.stagger,
    visible = true,
    axis = this.axis,
  // eslint-disable-next-line consistent-return
  } = {}) => {
    if (!this.tween.train?.length) {
      return this.play({
        delay: this.delay,
        to: this.to,
        duration: this.duration,
        easing: this.easing,
        stagger: this.stagger,
        visible,
        axis,
      });
    }

    this.state.visible = visible;

    const oldTL = this.tween.train.map((el) => el.anim);
    const oldCur = oldTL.map((el) => el.cur);

    this.tween.do('destroy');
    this.tween = new Timeline({
      targets: this.targetTokens,
      duration,
      easing,
    });

    for (let i = 0, n = oldTL.length; i < n; i++) {
      const target = this.targetTokens[i];
      const tl = oldCur[i];

      this.tween.add({
        targets: target,
        // if previous delay was not completed, instantly go to end of tween
        duration: !oldTL[i].delay.completed ? 0 : duration,
        delay: delay + i * stagger,
        transform: {
          [axis]: [tl[0], to],
          [`${axis}u`]: '%',
          r: this.rotate
            ? [
              [tl[1], tl[2], tl[3], tl[4]],
              [1, 0, 0, to === 0 ? 0 : 180],
            ]
            : false,
        },
      });
    }
  };

  setTargetTokens() {
    const tokens = [];
    this.instances.forEach((split) => tokens.push(...split.dom[split.mode]));
    this.targetTokens = tokens;
  }

  get progress() { return Ease[this.easing](this.tween.getProgress()); }

  destroy = () => {
    // this.instances.forEach((instance) => instance.destroy());
    this.tween?.do('destroy');
    this.observer?.disconnect();
  };

  setupAuto = () => {
    this.observer = Observer.create({
      callback: this.onIntersection,
      threshold: this.threshold || 0.5,
    });
    this.observer.observe(this.targets);
  };

  onIntersection = (node, isIntersecting, unobserve) => {
    if (isIntersecting) {
      unobserve(node);
      this.play({ visible: true });
    }
  };
}
