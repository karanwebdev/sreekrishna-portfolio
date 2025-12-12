const cssnano = require('cssnano');
const postcssPresetEnv = require('postcss-preset-env');

const plugins = [
  cssnano({
    preset: 'default',
  }),
  require('postcss-combine-media-query'),
  postcssPresetEnv(),
];

module.exports = {
  plugins,
};
