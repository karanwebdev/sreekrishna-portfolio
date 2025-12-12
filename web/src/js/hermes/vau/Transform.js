export class Transform {
  constructor({
    x = null, // val
    y = null, // val
    xu = 'px', // unit (px or %)
    yu = 'px', // unit (px or %)
    sx = null, // val (0-1)
    sy = null, // val (0-1)
    r = null, // [rx, ry, rz] (deg)
  }) {
    this.props = {
      x,
      xu,
      y,
      yu,
      sx,
      sy,
      r,
    };
    this.flags = {
      t: false,
      s: false,
      r: false,
    };

    this.setFlags();
    this.setTransform(this.props);
  }

  setFlags = () => {
    // check if value is truthy, or 0

    const {
      x, y, sx, sy, r,
    } = this.props;

    if (x || y || x === 0 || y === 0) {
      !x && x !== 0 && (this.props.x = 0);
      !y && y !== 0 && (this.props.y = 0);
      this.flags.t = true;
    }

    if (sx || sy || sx === 0 || sy === 0) {
      !sx && sx !== 0 && (this.props.sx = 1);
      !sy && sy !== 0 && (this.props.sy = 1);
      this.flags.s = true;
    }

    if (r) {
      !r[0] && r[0] !== 0 && (this.props.r[0] = 0);
      !r[1] && r[1] !== 0 && (this.props.r[1] = 0);
      !r[2] && r[2] !== 0 && (this.props.r[2] = 0);
      !r[3] && r[3] !== 0 && (this.props.r[3] = 0);
      this.flags.r = true;
    }
  };

  setTransform = (props) => {
    const p = this.props;
    Object.assign(p, props);

    this.transform = '';

    if (this.flags.t) {
      const {
        x, y, xu, yu,
      } = p;
      this.transform += `translate3d(${x}${xu}, ${y}${yu}, 0) `;
    }

    if (this.flags.s) {
      this.transform += `scale3d(${p.sx}, ${p.sy}, 1) `;
    }

    if (this.flags.r) {
      const {
        rx, ry, rz, rv,
      } = props;
      this.transform += `rotate3d(${rx}, ${ry}, ${rz}, ${rv}deg)`;
    }
  };

  convert2d = () => {
    const {
      x, y, sx, sy, xu, yu, rx, ry, rz, rv,
    } = this.props;

    this.transform = '';

    if (this.flags.t) {
      if (x === 0 && y === 0 && !this.flags.s && !this.flags.r) {
        this.transform = 'translate(0)';
      } else {
        this.transform = `translate(${x}${xu}, ${y}${yu})`;
      }
    }

    if (this.flags.s) {
      this.transform += ` scale(${sx}, ${sy})`;
    }

    // change conditions to unset 3d - rotations will
    // make this impossible. See:
    // https://greensock.com/gsap-1-12-0/ (force3D: auto)
    // tweak function a bit

    // This will not work if rotation is around z-axis
    if (this.flags.r && rv !== 0) {
      this.transform += ` rotate3d(${rx}, ${ry}, ${rz}, ${rv}deg)`;
    }
  };

  destroy = () => {
    this.transform = null;
  };
}

// export const transform = (
//   dom,
//   {
//     translate = {
//       x: 0,
//       y: 0,
//       xu: '%',
//       yu: '%',
//     },
//     scale = {
//       x: 0,
//       y: 0,
//     },
//     rotate = {
//       x: 0,
//       y: 0,
//       z: 0,
//       deg: 0,
//     },
//   },
// ) => {
//   dom.style.transform = `translate3d(
//     ${translate.x}${translate.xu},
//     ${translate.y}${translate.yu}, 0)
//     scale3d(${scale.x},${scale.y}, 1)
//     rotate3d(${rotate.x},${rotate.y},${rotate.z},${rotate.deg}deg)`;
// };

// transform(this.dom, {
//   translate: {
//     x: 200,
//     y: 100,
//     xu: "%",
//   },
//   scale: {
//     x: 2,
//   },
// });
