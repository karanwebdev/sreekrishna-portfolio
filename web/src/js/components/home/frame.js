import { select } from '../../hermes';

export class Frame {
  constructor({ target }) {
    [this.target] = select(target);
  }

  on = () => {
    this.target.classList.add('active');
  };

  off = () => {
    this.target.classList.remove('active');
  };
}
