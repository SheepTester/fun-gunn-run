// URL PARAMETERS
// quality - canvas quality
const params = {};
if (window.location.search) {
  window.location.search.slice(1).split('&').forEach(entry => {
    const equalSignLoc = entry.indexOf('=');
    if (~equalSignLoc) {
      params[entry.slice(0, equalSignLoc)] = entry.slice(equalSignLoc + 1);
    } else {
      params[entry] = true;
    }
  });
}

let cwidth, cheight;
let c;
let mode;

function setMode(newMode) {
  document.querySelectorAll(`#${mode} button`).forEach(btn => {
    btn.disabled = true;
  });
  document.body.className = mode = newMode;
  document.querySelectorAll(`#${newMode} button`).forEach(btn => {
    btn.disabled = false;
  });
}

function init() {
  const canvas = document.getElementById('canvas');
  c = canvas.getContext('2d');
  function resize() {
    const pxr = params.quality ? +params.quality : (window.devicePixelRatio || 1) / (c.webkitBackingStorePixelRatio
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

  const score = document.getElementById('score');

  let paused = false;
  let animID = null;
  function callPaint() {
    const returnVal = paint();
    if (returnVal) {
      setMode('play-again');
      GROUND_Y = groundYDest = 40;
      shakeRadius = 0;
      score.textContent = player.score;
    }
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

  function startGame() {
    setMode('game');
    resetCamera();
    reset();
  }
  document.getElementById('play').addEventListener('click', e => {
    startGame();
  });
  document.getElementById('play-again-btn').addEventListener('click', e => {
    startGame();
  });
  document.getElementById('menu-btn').addEventListener('click', e => {
    setMode('menu');
  });

  Array.from(document.getElementsByTagName('button')).forEach(btn => btn.disabled = true);
  setMode('menu');
}

document.addEventListener('DOMContentLoaded', init, {once: true});
