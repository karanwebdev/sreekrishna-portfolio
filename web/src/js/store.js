import { ro } from './hermes';

export const Store = {
  images: {},
  textures: {},
  dom: false,
  fluidW: (val) => (val / (ro.bounds.vw < 850 ? 375 : 1920)) * ro.bounds.vw,
  fluidH: (val) => (val / (ro.bounds.vw < 850 ? 375 : 1920)) * ro.bounds.vh,
};
