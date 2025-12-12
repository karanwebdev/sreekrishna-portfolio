/*

Example:
=======

const throttledCallback = Throttle({
    delay: 200,
    onlyAtEnd: true,
    update: callback
})
throttledCallback()

*/

export const Throttle = ({ delay = 200, update, onlyAtEnd = false }) => {
  let last = 0;
  let timer = 0;

  return () => {
    let firstTime = true;
    const now = performance.now();
    if ((last && now < last + delay) || firstTime) {
      firstTime = false;
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = now;
        update();
      }, delay);
    } else {
      last = now;
      if (!onlyAtEnd) {
        firstTime = false;
        update();
      }
    }
  };
};
