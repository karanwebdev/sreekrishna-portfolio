import { Controller } from '../hydra';
import { sail } from '../components/sails';
import { Youtube } from '../components/youtube';
import { Parallax } from '../scroller';
import { Reveal, Split } from '../reveal';
import { qs, Sniff } from '../hermes';
import { nav } from '../components/nav';

/**
 *
 * Case page controller
 *
 */

let yt;
let p1;
let r1;
export const caseController = new Controller({
  hide: ({ done }) => {
    yt.destroy();
    p1?.destroy();
    r1.destroy();
    nav.open();
    nav.off();
    sail.out(done);
  },

  show: ({ done }) => {
    yt = new Youtube();

    if (!Sniff.mobile) {
      p1 = new Parallax({
        dom: '#case-img--main img',
        useOnlyOffset: true,
        scale: {
          x: { start: 1.05, end: 1.25 },
          y: { start: 1.05, end: 1.25 },
        },
        offset: {
          start: -150,
          end: 100,
        },
      });
    }

    r1 = new Reveal({
      targets: '#case-story',
      stagger: 85,
      auto: true,
    });

    // eslint-disable-next-line no-new
    new Split({
      target: qs('#up-next-title'),
      classes: {
        line: 'bg-block',
      },
    }).resize();

    // eslint-disable-next-line no-new
    new Split({
      target: qs('#case-title'),
      classes: {
        line: 'bg-block',
      },
    }).resize();

    sail.in();

    nav.on();
    nav.close();

    done();
  },
});
