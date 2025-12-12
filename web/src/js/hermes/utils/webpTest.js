export const webpTest = (callback) => {
  const s = new Image();
  s.onload = () => {
    const e = s.width > 0 && s.height > 0;
    callback(e);
  };
  s.onerror = () => {
    callback(false);
  };
  s.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
};
