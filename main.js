let width, height;
let c;

function init() {
  const canvas = document.getElementById('canvas');
  c = canvas.getContext('2d');
  function resize() {
    const pxr = (window.devicePixelRatio || 1) / (c.webkitBackingStorePixelRatio
      || c.mozBackingStorePixelRatio || c.msBackingStorePixelRatio
      || c.oBackingStorePixelRatio || c.backingStorePixelRatio || 1);
    width = window.innerWidth, height = window.innerHeight;
    canvas.width = pxr * width;
    canvas.height = pxr * height;
    c.scale(pxr, pxr);
  }
  resize();
  window.addEventListener('resize', resize);

  let paused = false;
  let animID = null;
  function callPaint() {
    paint();
    animID = window.requestAnimationFrame(callPaint);
  }
  document.addEventListener('keydown', e => {
    if (e.keyCode === 80) {
      paused = !paused;
      if (paused) window.cancelAnimationFrame(animID);
      else callPaint();
    }
  });
  callPaint();
}

document.addEventListener('DOMContentLoaded', init, {once: true});
