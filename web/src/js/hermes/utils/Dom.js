import { isArray, isUndefined } from './Check';

export const qs = (s, o = document) => o.querySelector(s);

export const qsa = (s, o = document) => [...o.querySelectorAll(s)];

export const bounds = (el) => {
  const {
    top, right, bottom, left, width, height, x, y,
  } = el.getBoundingClientRect();

  return {
    top, right, bottom, left, width, height, x, y,
  };
};

export const select = (query) => {
  if (isUndefined(query)) return [];
  if (query === window || query === document) {
    return [query];
  } if (typeof query === 'string') {
    // selector string
    return qsa(query);
  } if (isArray(query)) {
    // nodelist
    return query;
  }
  // single node
  return [query];
};

export const getOffsetTop = (el) => {
  if (!el) return 0;
  let top = 0;
  let clone = el;
  while (clone.offsetParent) {
    top += clone.offsetTop;
    clone = clone.offsetParent;
  }
  return top;
};

export const classList = {
  add: (node, str) => node.classList.add(...str.split(' ')),
  remove: (node, str) => node.classList.remove(...str.split(' ')),
};
