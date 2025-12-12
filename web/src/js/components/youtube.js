import {
  qsa, qs, Sniff, iris,
} from '../hermes';
import '@justinribeiro/lite-youtube';

export class Youtube {
  constructor() {
    if (Sniff.touchDevice) return;

    // this.dom = qsa('.yt-video');
    // this.init();
  }

  init = () => {
    //   TODO: Remove yt-cover on touch devices
    this.unlisten = this.dom.map((video) => {
      let paused = true;
      const cover = qs('.yt-video--overlay', video);
      const iframe = qs('iframe', video);

      return iris.add(cover, 'click', () => {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: paused ? 'playVideo' : 'pauseVideo',
            id: iframe.id,
          }),
          '*',
        );
        paused = !paused;
      });
    });
  };

  destroy = () => {
    if (Sniff.touchDevice) return;
    this.unlisten?.forEach((u) => u());
  };
}
