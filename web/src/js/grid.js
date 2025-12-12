import { iris, qs } from './hermes';

export class Grid {
  constructor({ cols = 4 }) {
    this.dom = qs('#grid');
    this.state = {
      isOn: false,
      cols,
    };

    this.build();
    this.listen();
  }

  build = () => {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.state.cols; i++) {
      const div = document.createElement('div');
      fragment.appendChild(div);
    }
    this.dom.appendChild(fragment);
  };

  listen = () => {
    iris.key(this.handleKey);
  };

  handleKey = (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'Digit1') {
      this.toggle();
    }
  };

  toggle = () => {
    this.dom.classList.toggle('active');
  };
}
