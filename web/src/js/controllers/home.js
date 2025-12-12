import { Controller } from '../hydra';
import { sail } from '../components/sails';

import { Home } from '../components/home';
import { nav } from '../components/nav';

/**
 *
 * Home page controller
 *
 */

let h;
export const homeController = new Controller({
  hide: ({ done }) => {
    h.destroy();
    nav.off();

    sail.out(done);
  },

  show: ({ done }) => {
    sail.in();

    h = new Home({ toggle: '#nav-grid--toggle' });

    nav.on();

    done();
  },
});
