import './polyfills';

import { Hydra } from './hydra';
import { iris, qs, Sniff } from './hermes';
import { intro } from './intro';

import { coverController } from './controllers/cover';
import { homeController } from './controllers/home';
import { aboutController } from './controllers/about';
import { caseController } from './controllers/case';
import { noController } from './controllers/404';

import { Grid } from './grid';
import { Cursor } from './components/cursor';
import { Video } from './components/video';

/**
 *
 * Instantiate
 * router
 *
 *
 */

// eslint-disable-next-line no-console
console.log('Site by: Siddharth — https://siddharthsham.com');
// eslint-disable-next-line no-console
console.log('Design by: Abhishek Jha — https://abhishekjha.me/');

iris.add(
  window,
  'load',
  () => {
    // eslint-disable-next-line no-new
    window._App = new Hydra({
      loader: async (done) => {
        await intro.init();
        done();
      },
      controllers: {
        home: homeController,
        cover: coverController,
        about: aboutController,
        case: caseController,
        404: noController,
      },
    });

    // eslint-disable-next-line no-new
    new Grid({
      cols: Sniff.mobile ? 4 : 12,
    });

    // eslint-disable-next-line no-new
    new Cursor();

    // if (
    //   "serviceWorker" in navigator &&
    //   window.location.hostname !== "localhost"
    // ) {
    //   navigator.serviceWorker.register("/sw.js");
    // }
  },
  {
    once: true,
  },
);

// optimistically try to load video
const cover = qs('#vid');
if (cover) {
  Video(cover);
}
