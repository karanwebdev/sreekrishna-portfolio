import { ImageLoader, qs, Sniff } from "./hermes";
import { assets } from "./preload";
import { gl } from "./gl";

export class Intro {
  constructor({ begin = () => {}, update, complete = () => {} } = {}) {
    Object.assign(this, { begin, update, complete });
  }

  async init() {
    // complete preloading
    // and intro loader animation
    await Promise.all([
      this.begin(),
      await Promise.all([this.images(), Intro.fonts()]),
      await Intro.videos(),
    ]);
    // complete outro load animation
    await this.complete();
  }

  static async fonts() {
    const dom = qs("#text-preload");
    if ("fonts" in document) {
      await Promise.all(
        assets.fonts.map((font) => document.fonts.load(`1em ${font}`))
      );
      dom?.remove();
    } else {
      dom?.remove();
    }
  }

  images = () =>
    new Promise((resolve) => {
      // eslint-disable-next-line no-underscore-dangle
      const data = window._D || [];

      // Handle empty data - resolve immediately
      if (data.length === 0) {
        this.update && this.update(100);
        resolve();
        return;
      }

      const images = data.map(({ cover }) => cover);
      ImageLoader({
        arr: images,
        update: (img, i, progress) => {
          // image only project
          // eslint-disable-next-line no-underscore-dangle
          if (!data[i]?.loop?.full) {
            gl.createMedia(img, i);
          }
          this.update && this.update(progress);
        },
        complete: () => {
          resolve();
          // preload.remove();
        },
      });
    });

  static videos = async () =>
    new Promise((resolve) => {
      // eslint-disable-next-line no-underscore-dangle
      const data = window._D || [];
      data.forEach((item, idx) => {
        if (!item?.loop?.full) return;

        const { loop, cover } = item;

        // prepare attributes
        const src = loop[Sniff.mobile ? "small" : "full"];
        const height = loop.dimensions?.height || 1920;
        const width = loop.dimensions?.width || 1080;

        // create video
        const video = document.createElement("video");

        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.crossOrigin = "anonymous";

        video.src = src;

        video.setAttribute("webkit-playsinline", true);
        video.setAttribute("playsinline", true);
        video.load();

        // create gl media
        gl.createMedia(video, idx, {
          type: "video",
          src,
          height,
          width,
          cover,
        });
      });

      resolve();
    });
}

/*
 *
 * Setup Intro here
 * ----------------
 *
 */

const loadEl = qs("#loader");
const loadProgress = qs("#loader-percent", loadEl);

export const intro = new Intro({
  begin: () => {},
  update: (progress) => {
    loadProgress.innerText = Math.floor(progress);
  },
  complete: () => {
    gl.init();
    loadEl.remove();
  },
});
