import {
  Timeline, qs, Sniff, Vau,
} from '../../hermes';

class Sail {
  constructor() {
    this.sail = qs('#sail');

    this.init();
  }

  init() {
    this.in = this.inD;
    this.out = this.outD;
  }

  inD() {
    this.tl?.do('destroy');
    this.tl = new Timeline();
    this.tl.add({
      targets: this.sail,
      opacity: [1, 0],
      duration: 800,
      easing: 'o3',
    });
  }

  outD(done = false) {
    // this.tl.do('reverse', { complete: done });

    this.tl?.do('destroy');
    this.tl = new Timeline();
    this.tl.add({
      targets: this.sail,
      opacity: [0, 1],
      easing: 'i3',
      duration: 1200,
      complete: done,
    });
  }

  inM() {
    this.tl = new Vau({
      targets: this.sail,
      easing: 'o3',
      opacity: [1, 0],
      duration: 200,
      complete: () => {
        this.sail.style.pointerEvents = 'none';
      },
    });
  }

  outM(done) {
    this.sail.style.pointerEvents = 'all';
    this.tl.reverse({ complete: done });
  }
}

export const sail = new Sail();
