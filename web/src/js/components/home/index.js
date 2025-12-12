import { Frame } from './frame';
import { Titles } from './titles';

import { gl } from '../../gl';
import { HomeSlider } from './controllers/slider';
import { HomeGrid } from './controllers/grid';
import { iris, qs } from '../../hermes';

export class Home {
  constructor({ toggle }) {
    this.toggle = qs(toggle);
    this.titles = new Titles({ targets: '.case-title--item' });
    this.frame = new Frame({ target: '#frame' });

    this.init();

    this.settings = {
      delay: 200,
    };

    this.state = {
      idx: gl.manager?.state?.active || 0,
      timer: false,
      on: false,
      mode: gl.state?.mode || 'slider',
    };

    // this.frame.on();
    // this.on();
    this.controllers[this.state.mode].enable();
    this.on();

    gl.manager.intro();

    window.home = this;
  }

  init = () => {
    this.controllers = {
      slider: new HomeSlider({ engine: this }),
      grid: new HomeGrid({ engine: this }),
    };

    this.glIdxID = gl.manager.idxChangeQ.add({ update: (idx) => this.delayedCall(idx) });
    this.glModeID = gl.manager.modeChangeQ.add({ update: (mode) => this.onModeChange(mode) });

    this.unToggle = iris.add(this.toggle, 'click', () => gl.manager.goto(gl.manager.mode === 'slider' ? 'grid' : 'slider'));

    this.unClick = iris.add('#goto-case', 'click', () => {
      // eslint-disable-next-line no-underscore-dangle
      const route = `${window.location.origin}/case/${window._D[this.state.idx]?.slug}/`;
      // eslint-disable-next-line no-underscore-dangle
      window._App.goto(route);
    });
  };

  onIdxChange = (idx = this.state.idx) => {
    this.off();
    this.on(idx);

    this.state.timer = false;
  };

  delayedCall = (idx) => {
    this.state.idx = idx;
    this.state.on && this.off();
    this.state.timer && clearTimeout(this.state.timer);
    this.state.timer = setTimeout(this.onIdxChange, this.settings.delay);
  };

  on = (idx = this.state.idx) => {
    if (this.state.on) return;
    this.controllers[this.state.mode].on(idx);
    this.state.on = true;
  };

  off = () => {
    if (!this.state.on) return;
    this.controllers[this.state.mode].off();
    this.state.on = false;
  };

  onModeChange = (mode) => {
    this.controllers[this.state.mode].disable();
    this.controllers[mode].enable();
    this.state.mode = mode;
  };

  destroy = () => {
    this.out();
    gl.manager.idxChangeQ.remove(this.glIdxID);
    gl.manager.modeChangeQ.remove(this.glModeID);
    this.unToggle && this.unToggle();
    this.unClick && this.unClick();
    this.glIdxID = false;
    this.glModeID = false;
  };

  in = () => {
    gl.manager.in();
    this.on();
  };

  out = () => {
    gl.manager.out();
    this.off();
  };
}
