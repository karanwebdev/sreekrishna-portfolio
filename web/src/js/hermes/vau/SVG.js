import { Tweens } from './vau';
import { round, select, qsa } from '../utils';

/**
 *
 * For drawing paths:
 *
 * https://css-tricks.com/a-trick-that-makes-drawing-svg-lines-way-easier/
 *
 * 1) Set strokeDasharray to 1 (use setAttribute)
 * 2) Tween dashOffset from 1 to 0
 *
 *
 */

/**
 *
 * Alternatively:
 *
 * 1) Get the path length
 * 2) Set strokeDasharray to pathLength
 * 3) Then tween strokeDashoffset from pathLength to 0
 *
 */

/**
 *
 * Usage:
 *
 * Draw({
 *  targets: "#svg-id",
 *  duration: 1000,
 *  easing: "io6",
 * })
 *
 */

export const Draw = ({
  targets,
  invert,
  duration,
  easing,
  begin,
  update,
  complete,
  reverse,
}) => {
  let els = select(targets);
  const nels = [];
  els.forEach((el) => {
    nels.push(...qsa('path', el));
  });
  els = nels;

  const n = els.length;
  const lengths = new Float32Array(n);
  const vals = [];

  for (let i = 0; i < n; i++) {
    const el = els[i];
    const l = el.getTotalLength();
    lengths[i] = l;
    el.style.strokeDasharray = l;
    el.style.strokeDashoffset = l;
    // if invert is truthy, run backwards
    // Note: This is different from reverse
    !invert ? vals.push([-l, 0]) : vals.push([0, l]);
  }

  begin && begin();
  return Tweens({
    vals,
    duration,
    easing,
    reverse,
    complete,
    update: ({ cur }) => {
      for (let i = 0; i < n; i++) {
        els[i].style.strokeDashoffset = cur[i];
      }
      update && update({ cur });
    },
  });
};

const pathToPoints = (path, resolution = 100) => {
  const arr = [];
  for (let i = 0, l = resolution; i < l; i++) {
    const point = path.getPointAtLength((i / l) * path.getTotalLength());
    arr.push({ x: point.x, y: point.y });
  }
  return arr;
};

const COMMANDS = {
  x: true,
  y: true,
  z: true,
  M: true,
};

export const createXYPairsFromPoints = (p1, p2) => {
  const arr1 = p1.getAttribute('d').split(' ');
  const arr2 = p2.getAttribute('d').split(' ');

  const l = arr1.length;
  const pairs1 = [];
  const pairs2 = [];
  let pair;

  for (let i = 0; i < l; i++) {
    pair = arr1[i].split(',');

    if (pair.length !== 2) {
      pairs1.push({ x: pair[0], y: pair[0] });
      pairs2.push({ x: pair[0], y: pair[0] });
    } else {
      pairs1.push({ x: pair[0], y: pair[1] });

      pair = arr2[i].split(',');
      pairs2.push({ x: pair[0], y: pair[1] });
    }
  }

  return [pairs1, pairs2];
};

export const createMorphVals = (from, to) => {
  const vals = [];
  const l = from.length;
  let fromToX; let
    fromToY;

  for (let i = 0; i < l; i++) {
    const token = from[i].x;

    if (COMMANDS[token]) {
      fromToX = [from[i].x, to[i].x];
      vals.push(fromToX);
    } else {
      fromToX = [from[i].x, to[i].x];
      vals.push(fromToX);

      fromToY = [from[i].y, to[i].y];
      vals.push(fromToY);
    }
  }
  return vals;
};

export const MorphTween = ({
  mutate,
  vals,
  duration,
  easing,
  reverse,
  complete,
}) => Tweens({
  vals,
  duration,
  easing,
  reverse,
  complete,
  update: ({ cur }) => {
    let s = '';
    let x; let y;

    for (let i = 0, n = vals.length - 1; i < n; i += 2) {
      const token = cur[i];

      if (Number.isNaN(token)) {
        s += vals[i][0];
        i--;
      } else {
        x = round(cur[i]);
        y = round(cur[i + 1]);
        s += ` ${x},${y} `;
      }
    }
    mutate.setAttribute('d', s);
  },
});

/**
 *
 * Morph between two SVG shapes
 *
 * TODO:
 * 1) Manage unequal number of points?
 * 2) Handle multiple targets?
 *
 */
export const Morph = ({
  mutate,
  from,
  to,
  points = false,
  path = false,
  duration,
  easing = 'linear',
  reverse,
  complete,
}) => {
  const fromEl = select(from)[0];
  const toEl = select(to)[0];

  let fromPoints; let
    toPoints;
  if (points) {
    [fromPoints, toPoints] = createXYPairsFromPoints(fromEl, toEl);
  } else if (path) {
    fromPoints = pathToPoints(fromEl);
    toPoints = pathToPoints(toEl);
  }

  const vals = createMorphVals(fromPoints, toPoints);

  return MorphTween({
    mutate,
    vals,
    duration,
    easing,
    reverse,
    complete,
  });
};
