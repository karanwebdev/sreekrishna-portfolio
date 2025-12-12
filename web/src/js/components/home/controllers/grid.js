export class HomeGrid {
  constructor({ engine }) {
    this.engine = engine;
  }

  enable = () => {
    this.engine.titles.off();
    this.engine.frame.off();
  };

  disable = () => {
    this.engine.frame.on();
  };

  on = (idx) => {
    this.engine.titles.off();
  };

  off = () => {
    // this.engine.titles.on(this.engine.state.idx);
  };
}
