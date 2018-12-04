// URL PARAMETERS
// quality       - canvas quality
// skipIntro     - (legacy) skips intro
// autoCensor    - automatically limits the objects drawn such that it should take the given amount of milliseconds to render them
// mouseCircle   - enables touch circle for mouse
// playerOpacity - opacity of player
// noShadows     - hides shadows
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

const VERSION = 1.3;
const HIGHSCORE_COOKIE = '[fun-gunn-run] highscore';
// modified regex from  https://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url#comment19948615_163684
const urlRegex = /^(https?):\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[\-A-Za-z0-9+&@#\/%=~_|]$/;

const PLAYER_OPACITY = params.playerOpacity ? +params.playerOpacity : 0.6;

let highScore = +localStorage.getItem(HIGHSCORE_COOKIE);
if (isNaN(highScore)) highScore = 0;

function sendScore(userUrl) {
  return fetch('https://test-9d9aa.firebaseapp.com/newFGRScore', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    method: 'POST',
    body: JSON.stringify({
      score: Math.floor(player.score),
      manner: player.deathManner || 'unknown',
      coins: player.coins,
      lives: player.lives,
      time: player.deathDate,
      url: userUrl,
      version: VERSION
    })
  }).then(res => {
    if (res.status === 200) {
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  });
}

let cwidth, cheight;
let c;
let mode;

function setMode(newMode) {
  document.querySelectorAll(`#${mode} button, #${mode} input`).forEach(btn => {
    btn.disabled = true;
  });
  document.body.className = mode = newMode;
  document.querySelectorAll(`#${newMode} button, #${newMode} input`).forEach(btn => {
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
  intro.startTime = frame;
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
const SPEED_DECREASE = 7;
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
    if (player.coins >= PRICES.speedy) {
      player.coins -= PRICES.speedy;
      player.invincible = true;
      player.speedy = true;
      if (player.invincibleTimeout === null) player.invincibleTimeout = frame + 600;
      else player.invincibleTimeout += 600;
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

  const scoreElem = document.getElementById('score');
  const highscoreElem = document.getElementById('highscore');
  function playAgain() {
    setMode('play-again');
    GROUND_Y = groundYDest = 40;
    shakeRadius = 0;
    const score = Math.floor(player.score);
    scoreElem.textContent = score;
    if (score > highScore) {
      highscoreElem.textContent = `you beat your high score! (it was ${highScore})`;
      highScore = score;
      localStorage.setItem(HIGHSCORE_COOKIE, highScore);
    } else if (score === highScore) {
      highscoreElem.textContent = 'you almost beat your high score D:';
    } else {
      highscoreElem.textContent = 'high score: ' + highScore;
    }
    currentPlayBtn = playAgainBtn;
    currentBackMenu = playAgainToMenu;
  }

  let paused = false;
  let animID = null;
  function callPaint() {
    animID = window.requestAnimationFrame(callPaint);
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
  }
  let lastPauseTime = null;
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.keyCode === 80) {
      paused = !paused;
      if (paused) {
        window.cancelAnimationFrame(animID);
        lastPauseTime = Date.now();
      } else {
        startTime += Date.now() - lastPauseTime;
        callPaint();
      }
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
  const optionsToMenu = document.getElementById('from-options-back');
  const leaderboardToMenu = document.getElementById('from-leaderboard-back');
  playAgainToMenu.addEventListener('click', toMenu);
  helpToMenu.addEventListener('click', toMenu);
  aboutToMenu.addEventListener('click', toMenu);
  optionsToMenu.addEventListener('click', toMenu);
  leaderboardToMenu.addEventListener('click', () => {
    sortDropdown.disabled = true;
    toMenu();
  });
  document.getElementById('help').addEventListener('click', e => {
    setMode('menu-help');
    currentBackMenu = helpToMenu;
  });
  document.getElementById('about').addEventListener('click', e => {
    setMode('menu-about');
    currentBackMenu = aboutToMenu;
  });
  document.getElementById('options').addEventListener('click', e => {
    setMode('menu-options');
    currentBackMenu = optionsToMenu;
  });
  document.getElementById('leaderboard').addEventListener('click', e => {
    setMode('menu-leaderboard');
    currentBackMenu = leaderboardToMenu;
    fetchLeaderboard();
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

  const docsLink = document.getElementById('docs-link');
  const error = document.getElementById('error');
  const scoreSubmitBtn = document.getElementById('submit-score');
  scoreSubmitBtn.addEventListener('click', e => {
    if (urlRegex.test(docsLink.value)) {
      scoreSubmitBtn.disabled = true;
      sendScore(docsLink.value).then(() => {
        setMode('menu-leaderboard');
        fetchLeaderboard();
      }).catch(() => {
        error.classList.remove('hidden');
        error.textContent = 'Something went wrong.';
        scoreSubmitBtn.disabled = false;
      });
    } else {
      error.classList.remove('hidden');
      error.textContent = 'This is not a link.';
    }
  });

  const leaderboardContainer = document.getElementById('leaderboard-container');
  const sortDropdown = document.getElementById('sort');
  const fetchBtn = document.createElement('button');
  fetchBtn.classList.add('btn');
  fetchBtn.classList.add('fetch-again-btn');
  fetchBtn.textContent = 'try again';
  fetchBtn.addEventListener('click', fetchLeaderboard);
  sortDropdown.addEventListener('change', renderLeaderboard);
  const mannerValues = {backpack: 0, sign: 1, tree: 2, fence: 3, cart: 4};
  let scores;
  function renderLeaderboard() {
    leaderboardContainer.innerHTML = '';
    switch (sortDropdown.value) {
      case 'coins':
        scores.sort((a, b) => b.coins - a.coins);
        break;
      case 'time':
        scores.sort((a, b) => b.time - a.time);
        break;
      case 'manner':
        scores.sort((a, b) => a.manner === b.manner ? b.score - a.score : mannerValues[a.manner] - mannerValues[b.manner]);
        break;
      default:
        scores.sort((a, b) => b.score - a.score);
    }
    const fragment = document.createDocumentFragment();
    scores.forEach(({url, time, score, coins, manner}) => {
      const link = document.createElement('a');
      link.className = `leaderboard-item death-by-${manner}`;
      link.href = url;
      const coinDisplay = document.createElement('span');
      coinDisplay.className = 'coins';
      coinDisplay.textContent = coins;
      link.appendChild(coinDisplay);
      const scoreDisplay = document.createElement('span');
      scoreDisplay.className = 'score';
      scoreDisplay.textContent = score;
      link.appendChild(scoreDisplay);
      const timeDisplay = document.createElement('span');
      timeDisplay.className = 'time';
      timeDisplay.textContent = new Date(time).toLocaleString();
      link.appendChild(timeDisplay);
      const urlDisplay = document.createElement('span');
      urlDisplay.className = 'url';
      urlDisplay.textContent = url;
      link.appendChild(urlDisplay);
      fragment.appendChild(link);
    });
    leaderboardContainer.appendChild(fragment);
  }
  function fetchLeaderboard() {
    if (fetchBtn.parentNode) fetchBtn.parentNode.removeChild(fetchBtn);
    leaderboardContainer.textContent = 'Fetching leaderboard...';
    fetch('https://test-9d9aa.firebaseapp.com/getFGRLeaderboard?v=' + Date.now())
    .then(r => r.status === 200 ? r.json() : Promise.reject())
    .then(json => {
      scores = Object.values(json);
      sortDropdown.disabled = false;
      renderLeaderboard();
    })
    .catch(() => {
      leaderboardContainer.textContent = 'Fetching failed.';
      leaderboardContainer.appendChild(fetchBtn);
      fetchBtn.disabled = false;
    });
  }

  const qualityInput = document.getElementById('quality');
  const autoCensorInput = document.getElementById('auto-censor');
  const mouseCircleInput = document.getElementById('mouse-circle');
  const playerOpacityInput = document.getElementById('player-opacity');
  const noShadowsInput = document.getElementById('no-shadows');
  const outputLink = document.getElementById('generate-url');
  if (params.quality) qualityInput.value = params.quality;
  if (params.autoCensor) autoCensorInput.value = params.autoCensor;
  if (params.mouseCircle) mouseCircleInput.checked = true;
  if (params.playerOpacity) playerOpacityInput.value = params.playerOpacity;
  if (params.noShadows) noShadowsInput.checked = true;
  function updateURL() {
    let params = [];
    if (quality.value) params.push('quality=' + quality.value);
    if (autoCensorInput.value) params.push('autoCensor=' + autoCensorInput.value);
    if (mouseCircleInput.checked) params.push('mouseCircle');
    if (playerOpacityInput.value) params.push('playerOpacity=' + playerOpacityInput.value);
    if (noShadowsInput.checked) params.push('noShadows');
    outputLink.href = '?' + params.join('&');
  }
  qualityInput.addEventListener('input', updateURL);
  autoCensorInput.addEventListener('input', updateURL);
  mouseCircleInput.addEventListener('change', updateURL);
  playerOpacityInput.addEventListener('input', updateURL);
  noShadowsInput.addEventListener('change', updateURL);
  updateURL();

  [...document.getElementsByTagName('button'), ...document.getElementsByTagName('input')].forEach(btn => btn.disabled = true);
  toMenu();
}

document.addEventListener('DOMContentLoaded', init, {once: true});
