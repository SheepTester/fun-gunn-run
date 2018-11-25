let cwidth, cheight;
let c;

function init() {
  const canvas = document.getElementById('canvas');
  c = canvas.getContext('2d');
  function resize() {
    const pxr = (window.devicePixelRatio || 1) / (c.webkitBackingStorePixelRatio
      || c.mozBackingStorePixelRatio || c.msBackingStorePixelRatio
      || c.oBackingStorePixelRatio || c.backingStorePixelRatio || 1);
    cwidth = window.innerWidth, cheight = window.innerHeight;
    canvas.width = pxr * cwidth;
    canvas.height = pxr * cheight;
    c.scale(pxr, pxr);
    c.translate(cwidth / 2, cheight / 2);
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
  loadImages().then(callPaint);
}

document.addEventListener('DOMContentLoaded', init, {once: true});
