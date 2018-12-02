// URL PARAMETERS
// quality   - canvas quality
// skipIntro - (legacy) skips intro
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

const VERSION = 'pre-2';

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
  currentPlayBtn = null;
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

const PRICES = {
  speedy: 60,
  life: 40,
  reset: 30
};
const SPEED_DECREASE = 5;
let skipEndBtn;
let currentScoreDisplay, coinsDisplay, livesDisplay, speedyBtn, lifeBtn, resetBtn;
let currentPlayBtn = null, currentBackMenu = null;
function init() {
  initTouch();
  currentScoreDisplay = document.getElementById('current-score');
  coinsDisplay = document.getElementById('coins');
  livesDisplay = document.getElementById('lives');
  speedyBtn = document.getElementById('buy-speedy');
  lifeBtn = document.getElementById('buy-life');
  resetBtn = document.getElementById('buy-reset');

  speedyBtn.addEventListener('click', e => {
    if (!player.invincible && player.coins >= PRICES.speedy) {
      player.coins -= PRICES.speedy;
      player.invincible = true;
      player.speedy = true;
      player.invincibleTimeout = Date.now() + 10000;
    }
  });
  lifeBtn.addEventListener('click', e => {
    if (player.coins >= PRICES.life) {
      player.coins -= PRICES.life;
      player.lives++;
      livesDisplay.textContent = player.lives;
    }
  });
  resetBtn.addEventListener('click', e => {
    if (player.coins >= PRICES.reset && player.speed >= SPEED_DECREASE) {
      player.coins -= PRICES.reset;
      player.speed = Math.max(player.speed - SPEED_DECREASE, 0);
    }
  });

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
  function playAgain() {
    setMode('play-again');
    GROUND_Y = groundYDest = 40;
    shakeRadius = 0;
    score.textContent = Math.floor(player.score);
    currentPlayBtn = playAgainBtn;
    currentBackMenu = playAgainToMenu;
  }

  let paused = false;
  let animID = null;
  function callPaint() {
    const returnVal = paint();
    switch (returnVal) {
      case 'menu':
        playAgain();
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

  function toMenu() {
    setMode('menu');
    currentPlayBtn = playBtn;
    currentBackMenu = null;
  }

  const playBtn = document.getElementById('play');
  const playAgainBtn = document.getElementById('play-again-btn');
  playBtn.addEventListener('click', startGameIntro);
  playAgainBtn.addEventListener('click', startGameIntro);
  const playAgainToMenu = document.getElementById('menu-btn');
  const helpToMenu = document.getElementById('from-help-back');
  const aboutToMenu = document.getElementById('from-about-back');
  playAgainToMenu.addEventListener('click', toMenu);
  helpToMenu.addEventListener('click', toMenu);
  aboutToMenu.addEventListener('click', toMenu);
  document.getElementById('help').addEventListener('click', e => {
    setMode('menu-help');
    currentBackMenu = helpToMenu;
  });
  document.getElementById('about').addEventListener('click', e => {
    setMode('menu-about');
    currentBackMenu = aboutToMenu;
  });
  document.getElementById('skip-intro').addEventListener('click', e => {
    shakeRadius = 0;
    startGame();
  });
  skipEndBtn = document.getElementById('skip-end');
  skipEndBtn.addEventListener('click', e => {
    if (player.dead) {
      playAgain();
    }
  });

  Array.from(document.getElementsByTagName('button')).forEach(btn => btn.disabled = true);
  toMenu();
}

document.addEventListener('DOMContentLoaded', init, {once: true});
