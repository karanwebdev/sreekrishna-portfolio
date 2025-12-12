import { Sniff, isUrl } from '../hermes';

export const Video = (dom) => {
  if (dom.dataset.resolved) return;

  if (Sniff.mobile) {
    dom.src = dom.dataset.src;
  } else if (isUrl(dom.dataset.srcLg)) {
    dom.src = dom.dataset.srcLg;
  } else {
    dom.src = dom.dataset.src;
  }

  dom.dataset.resolved = true;
};
