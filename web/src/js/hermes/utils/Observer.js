import { select } from './Dom';

/**
 * Usage:
 * ======
 *
 *
const o = Observer.create({
  callback: (node, isIntersecting, unobserve) => {
    if (isIntersecting) {
      unobserve(node);
      console.log(node, "is visible");
    }
  },
  offset: `-5px`,
  threshold: 0.1,
});

o.observe(wrapperSelector);
  *
  */

const ObserverFactory = () => {
  const create = (options) => {
    const change = (entries, observer) => {
      const unobserve = (node) => observer.unobserve(node);

      entries.forEach((entry, idx) => {
        options.callback(
          entry.target,
          entry.isIntersecting,
          unobserve,
          entry,
          idx,
        );
      });
    };

    const observer = new IntersectionObserver(change, {
      root: null,
      rootMargin: `${options.offset || '0px'}`,
      threshold: options.threshold || 0,
    });

    return {
      observe: (targets) => {
        const nodes = select(targets);
        nodes.forEach((node) => observer.observe(node));
      },
      unobserve: (targets) => {
        const nodes = select(targets);
        nodes.forEach((node) => observer.unobserve(node));
      },
      disconnect: () => observer.disconnect(),
    };
  };

  return {
    create,
  };
};

export const Observer = ObserverFactory();
