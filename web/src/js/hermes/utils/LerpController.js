import { lerp } from './MathUtils';
import { ticker } from '../core/ticker';

/**
 *
 * Takes object with required shape:
 *
 * const obj = {
 *  target: 0,
 *  cur: 0,
 *  inertia: 0.1
 * }
 *
 */

export class LerpController {
  constructor(obj, threshold = 0.001) {
    this.obj = obj;
    this.threshold = threshold;
    this.needsUpdate();
  }

  needsUpdate = () => {
    this.delta = Math.abs(this.obj.cur - this.obj.target);
    return this.delta > this.threshold;
  };

  update = (delta = ticker.delta) => {
    const frameRatio = delta / ticker.targetDelta;
    this.obj.target = lerp(this.obj.target, this.obj.cur, this.obj.inertia * frameRatio);
  };
}
