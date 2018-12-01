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
function startGameIntro() {
  if (params.skipIntro) return startGame();
  setMode('intro');
  cameraDist = 350;
  camera.rot = 0;
  GROUND_Y = 50;
  intro.startTime = Date.now();
  intro.lastTime = null;
  intro.objects.student.x = 75;
  intro.objects.student.z = 1;
  intro.focusX = intro.focusZ = 0;
}
function startGame() {
  setMode('game');
  resetCamera();
  reset();
  curlymangoBack.y = -500;
  curlymangoBack.yv = 0;
  curlymangoBack.proximity = 1;
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
    switch (returnVal) {
      case 'menu':
        setMode('play-again');
        GROUND_Y = groundYDest = 40;
        shakeRadius = 0;
        score.textContent = player.score;
        break;
      case 'game':
        shakeRadius = 0;
        startGame();
        paint();
        break;
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

  document.getElementById('play').addEventListener('click', e => {
    startGameIntro();
  });
  document.getElementById('play-again-btn').addEventListener('click', e => {
    startGameIntro();
  });
  document.getElementById('menu-btn').addEventListener('click', e => {
    setMode('menu');
  });

  Array.from(document.getElementsByTagName('button')).forEach(btn => btn.disabled = true);
  setMode('menu');
}

document.addEventListener('DOMContentLoaded', init, {once: true});
