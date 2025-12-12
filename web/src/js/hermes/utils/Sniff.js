export const Sniff = {
  uA: navigator.userAgent.toLowerCase(),
  get mobile() {
    return /mobi|android|tablet|ipad|iphone/.test(this.uA) || this.iPadIOS13;
  },
  get firefox() {
    return this.uA.indexOf('firefox') > -1;
  },
  get safari() {
    return /^((?!chrome|android).)*safari/.test(this.uA);
  },
  get ios() {
    return /ip(hone|[ao]d)/.test(this.uA);
  },
  get touchDevice() {
    return 'ontouchstart' in window;
  },
};
