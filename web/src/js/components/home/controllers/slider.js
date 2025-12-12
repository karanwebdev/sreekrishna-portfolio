export class HomeSlider {
  constructor({ engine }) {
    this.engine = engine;

    const body = document.body.classList;
    this.class = {
      on: () => body.add('slider-mode'),
      off: () => body.remove('slider-mode'),
    };
  }

  //
  // Enable/disable are mode changes
  //

  enable = () => {
    this.engine.frame.on();
    this.engine.titles.on(this.engine.state.idx);
    this.class.on();
  };

  disable = () => {
    this.engine.frame.off();
    this.class.off();
  };

  //
  // On/Off are index changes
  //

  on = (idx) => {
    this.engine.titles.on(idx);
  };

  off = () => {
    this.engine.titles.off();
  };
}
