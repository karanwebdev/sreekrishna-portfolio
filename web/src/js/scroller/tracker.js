import { Conductor, ro, getOffsetTop } from '../hermes';

/**
 *
 * In-viewport detection
 *
 * tracker.add({ dom: domEl, update: () => {}, direction: "horizontal"})
 *
 */

export class Tracker extends Conductor {
  constructor({
    useDetectionPlane = true,
    useIntersection = false,
    needsResize = false,
    intersectionPoints = {},
  } = {}) {
    super();

    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;

    this.useDetectionPlane = useDetectionPlane;
    this.useIntersection = useIntersection;
    this.intersectionPoints = {
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      ...intersectionPoints,
    };

    this.scroll = {
      x: 0,
      y: 0,
    };

    if (needsResize) {
      this.roID = ro.add({
        update: this.resize,
      });
    }
  }

  setScroll = (x, y) => {
    if (this.train.length) {
      this.scroll.x = x;
      this.scroll.y = y;
      this.detectElements();
    }
  };

  resize = () => {
    if (this.train.length) {
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;
      this.updateElements();
    }
  };

  detectElements() {
    const {
      top, right, bottom, left,
    } = this.intersectionPoints;

    const scrollTop = this.scroll.y + this.windowHeight * top;
    const scrollBottom = this.scroll.y + this.windowHeight - this.windowHeight * bottom;
    const scrollLeft = this.scroll.x + this.windowWidth * left;
    const scrollRight = this.scroll.x - this.windowWidth * right;

    this.train.forEach((item, i) => {
      if (!item.visible) {
        if (item.direction === 'horizontal') {
          if (scrollRight >= item.left && scrollLeft < item.right) {
            this.setVisible(item, i);
          }
        } else if (this.useDetectionPlane) {
          if (scrollBottom > item.top && scrollTop < item.bottom) {
            this.setVisible(item, i);
          }
        } else if (scrollBottom > item.top) {
          this.setVisible(item, i);
        }
      } else if (item.direction === 'horizontal') {
        if (scrollRight < item.left || scrollLeft > item.right) {
          this.setInvisble(item, i);
        }
      } else if (this.useDetectionPlane) {
        if (scrollBottom < item.top || scrollTop > item.bottom) {
          this.setInvisible(item, i);
        }
      } else if (scrollBottom < item.top) {
        this.setInvisible(item, i);
      }
    });
  }

  setVisible(el, i) {
    el.visible = true;
    if (this.useIntersection) {
      el.intersection = this.getIntersection({
        top: el.top,
        bottom: el.bottom,
      });
    }
  }

  setInvisible(el, i) {
    el.visible = false;
  }

  getIntersection({
    top,
    bottom,
    // left,
    // right,
    // x = this.scroll.x,
    y = this.scroll.y,
  }) {
    return (y - top) / (bottom - top + this.windowHeight);
  }

  add(item) {
    const { top } = item.dom.getBoundingClientRect();
    const bottom = top + item.dom.offsetHeight;

    item.top = top;
    item.bottom = bottom;
    item.visible = false;

    super.add(item);
  }

  updateElements() {
    this.train.forEach((item, i) => {
      const top = getOffsetTop(item.dom);
      const bottom = top + item.dom.offsetHeight;

      item.top = top;
      item.bottom = bottom;
    });
  }

  destroy() {
    this.roID && ro.remove(this.roID);
  }
}

export const tracker = new Tracker();
