import { Controller } from '../hydra';
import { sail } from '../components/sails';
import { qs, qsa } from '../hermes';
import { Parallax } from '../scroller';

/**
 *
 * About page controller
 *
 */

let p;
export const aboutController = new Controller({
  hide: ({ done }) => {
    p.destroy();
    sail.out(done);
  },

  show: ({ done }) => {
    sail.in();

    p = new Parallax({
      dom: qs('#services-img--main img'),
      scale: {
        x: { start: 1.05, end: 1.25 },
        y: { start: 1.05, end: 1.25 },
      },
      useOnlyOffset: true,
      offset: {
        start: -50,
        end: 50,
      },
      ease: 'linear',
    });

    done();
  },
});
