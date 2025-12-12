const Fontmin = require('fontmin');

// convert otf to ttf
new Fontmin()
  .src('./static/fonts/src/*.*')
  .use(Fontmin.otf2ttf())
  .dest('./static/fonts/output')
  .run((err, files) => {
    if (err) {
      throw err;
    }

    console.log(files);
  });

// convert ttf to woff / woff2
new Fontmin()
  .src('./static/fonts/output/*.ttf')
  .use(Fontmin.glyph({
    text: ' !"#$%&\'()*+-*+,-./0123456789:;<=>?:;<=>?@ABCDEFGHIJKLMNOJKLMNOPQRSTUVWXYZ[\\]^_Z`abcdefghijklmnopqrstuvwxyz{|}~¢£¥¨©«®´¸»ˆ–—‘’‚“”„€',
    // text: ' !"#$%&\'()*+-*+,-./0123456789:;<=>?:;<=>?@ABCDEFGHIJKLMNOJKLMNOPQRSTUVWXYZ[\\]^_Z`abcdefghijklmnopqrstuvwxyz{|}~¢£¥¨©«®´¸»ÀÂÇÈÉÊËÎÏÔÙÚÛÜàâçèéêëîïôùûüÿŸˆ–—‘’‚“”„€',
  }))
// .use(Fontmin.ttf2woff())
  .use(Fontmin.ttf2woff2())
  .dest('./static/fonts/output')
  .run((err, files) => {
    if (err) {
      throw err;
    }

    console.log(files);
  });
