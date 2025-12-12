import { Reveal } from '../../reveal';
import { clamp, qsa, select } from '../../hermes';

export class Titles {
  constructor({ targets }) {
    // this.splits = select(targets).map((item) => new Split({
    //   target: item,
    //   line: false,
    //   word: true,
    //   classes: {
    //     wrapper: 'b-wrapper',
    //     line: 'b-line',
    //     word: 'b-word bg-block',
    //   },
    // }));
    // this.splits.forEach((split) => split.resize());

    this.targets = select(targets);
    this.reveals = this.targets.map((el) => new Reveal({
      targets: el,
      char: true,
      rotate: true,
    }));

    this.state = {
      idx: 0,
    };
  }

  on = (idx = this.state.idx) => {
    this.reveals[idx].play({
      duration: 1250,
      from: 110,
      to: 0,
      stagger: 50,
      visible: true,
      delay: 200,
      easing: 'o6',
    });
    this.state.idx = idx;
  };

  off = () => {
    this.reveals[this.state.idx].playTo({
      duration: 400, to: -110, stagger: 25, delay: 0, visible: false, easing: 'i3',
    });
  };
}
