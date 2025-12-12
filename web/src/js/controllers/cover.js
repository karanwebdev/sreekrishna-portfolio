import { Controller } from '../hydra';
import { sail } from '../components/sails';
import { Video } from '../components/video';
import { qs } from '../hermes';

/**
 *
 * About page controller
 *
 */

export const coverController = new Controller({
  hide: ({ done }) => {
    sail.out(done);
  },

  show: ({ done }) => {
    sail.in();

    Video(qs('#vid'));

    done();
  },
});
