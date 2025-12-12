import { qs } from '../hermes';

class Nav {
  constructor() {
    this.dom = {
      wrapper: qs('#nav-right'),
      toggle: qs('#nav-grid--toggle'),
    };
  }

  toggle = (mode = 'slider') => {
    this.dom.wrapper.classList[mode === 'grid' ? 'add' : 'remove']('toggle');
  };

  on = () => {
    this.dom.wrapper.classList.add('on');
  };

  off = () => {
    this.dom.wrapper.classList.remove('on');
  };

  close = () => {
    this.dom.wrapper.classList.add('close');
  };

  open = () => {
    this.dom.wrapper.classList.remove('close');
  };
}

export const nav = new Nav();
