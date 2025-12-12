const Idly = (timeout = 1000) => {
  // polyfill
  window.requestIdleCallback = window.requestIdleCallback
    || function (cb) {
      const start = Date.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, 1);
    };

  let id;
  const tasks = [];

  const add = (task, dummyTimeout) => {
    // add task to queue
    tasks.push(task);

    // put in idle time request
    request();

    // return instance;
  };

  // request an idle callback if not already flushing queue
  const request = () => {
    if (id) return;
    id = window.requestIdleCallback(flush, { timeout });
  };

  // flush the queue
  const flush = (deadline) => {
    // run tasks until running out of time or finished

    // using fallback
    if (!deadline.timeRemaining && tasks.length) {
      while (tasks.length) {
        const func = tasks.shift();
        func();
      }
    } else {
      // using native reqIdle
      while (deadline.timeRemaining() > 0 && tasks.length) {
        const func = tasks.shift();
        func();
      }
    }

    // null out callback id
    id = null;

    // if out of time before tasks are finished, request more time
    if (tasks.length) request();
  };

  return add;
};

// export const idly = Idly();

window.idly = Idly();
