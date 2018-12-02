const customSizes = {
  aplus: [20, 20],
  v1: [450, 175],
  super_speed: [25, 20],
  extra_life: [25, 25],
  turtle: [28, 16],
  player: [36, 75],
  player_walk1: [36, 75],
  player_walk2: [36, 75],
  ducking: [36, 75],
  duck1: [36, 75],
  duck2: [36, 75],
  student_front: [36, 75]
};
let imageData, masterSVG;

function loadImages() {
  return Promise.all([
    new Promise(res => {
      masterSVG = new Image();
      masterSVG.onload = res;
      masterSVG.src = `./images/textureatlas.svg`;
    }),
    fetch('./images/textureatlas.json').then(r => r.json()).then(json => imageData = json)
  ]);
}
function drawIfInCanvas(img, x, y, width, height) {
  if (x < cwidth / 2 && -cwidth / 2 < x + width
      && y < cheight / 2 && -cheight / 2 < y + height) {
    c.drawImage(masterSVG, img.x, img.y, img.width, img.height, x, y, width, height);
  }
}
const menu = {
  objects: [],
  focusX: 0, focusZ: 0,
  nextRefocus: 0
};
const intro = {
  paths: [
    {x: 50, z: -115, width: 50, height: 115},
    {x: 100, z: -115, width: 200, height: 50}
  ],
  objects: {
    classroom: {type: 'v1', x: 0, z: 0},
    student: {type: 'student_front', x: 75, z: 1},
    camera: {type: 'security_camera', x: -130, y: -110, z: -5, relativeY: true}
  },
  focusX: 0, focusZ: 0,
  times: {
    zoomToV1: 90,
    studentComeOut: 120,
    studentRunAway: 210,
    securityCamera: 300
  },
  startTime: null,
  lastTime: null
};
const playAgain = {
  objects: [
    {type: 'curlymango_normal', x: 0, z: 0},
    {type: 'desk', x: 0, z: 50},
    {type: 'jail_bars', x: 0, z: 250},
    {type: 'student_front', x: 0, z: 300},
    {type: 'jail_bars', x: 0, z: 350},
    {type: 'jail_bar', x: -50, z: 300},
    {type: 'jail_bar', x: 50, z: 300},
    {type: 'jail_bar', x: -50, z: 325},
    {type: 'jail_bar', x: 50, z: 325},
    {type: 'jail_bar', x: -50, z: 275},
    {type: 'jail_bar', x: 50, z: 275}
  ],
  paths: [
    {x: -100, z: -100, width: 200, height: 500}
  ]
};
const curlymangoBack = {
  type: 'curlymango_back',
  x: 0,
  y: 0,
  yv: 0,
  z: 0,
  relativeY: true,
  proximity: 1, opacity: 1
};
for (let i = 30; i--;) menu.objects.push({type: Math.random() < 0.1 ? 'caterpillar_tree' : 'tree', x: Math.random() * 500 - 250, z: Math.random() * 500 - 250});
const beginningPath = {x: -50, z: -500, width: 100, height: 500};
let shakeRadius = 0;
let renderLimit = null;
let frame = 0;
const playerWalkCycle = ['player', 'player_walk1', 'player', 'player_walk2'];
const playerDuckCycle = ['ducking', 'duck1', 'ducking', 'duck2'];
function paint() {
  c.clearRect(-cwidth / 2, -cheight / 2, cwidth, cheight);
  const shakeX = Math.random() * shakeRadius * 2 - shakeRadius;
  const shakeY = Math.random() * shakeRadius * 2 - shakeRadius;

  frame++;
  let paths, objects;

  if (mode === 'game') {
    movePlayer();
    if (player.dead && keys.skip || frame > player.endDeathAnim && player.ccSteps >= 3) {
      return 'menu';
    }
    currentScoreDisplay.textContent = Math.floor(player.score);
    coinsDisplay.textContent = player.coins;
    if (player.invincible || player.coins < PRICES.speedy) {
      if (!speedyBtn.classList.contains('disabled')) speedyBtn.classList.add('disabled');
    } else {
      if (speedyBtn.classList.contains('disabled')) speedyBtn.classList.remove('disabled');
    }
    if (player.coins < PRICES.life) {
      if (!lifeBtn.classList.contains('disabled')) lifeBtn.classList.add('disabled');
    } else {
      if (lifeBtn.classList.contains('disabled')) lifeBtn.classList.remove('disabled');
    }
    if (player.speed < SPEED_DECREASE || player.coins < PRICES.reset) {
      if (!resetBtn.classList.contains('disabled')) resetBtn.classList.add('disabled');
    } else {
      if (resetBtn.classList.contains('disabled')) resetBtn.classList.remove('disabled');
    }
    const playerObject = {
      type: player.dead ? 'player' : (player.ducking ? playerDuckCycle : playerWalkCycle)[Math.floor(frame / 15) % 4],
      x: player.x,
      y: player.y,
      z: player.z,
      opacity: player.invincible ? (player.invincibleTimeout - frame < 60 ? (frame % 12 < 6 ? 0.2 : 0.5) : player.invincibleTimeout - frame < 180 ? (frame % 30 < 15 ? 0.2 : 0.5) : 0.2) : 0.5
    };
    if (player.ccFallingState === 0) {
      curlymangoBack.z = 100;
      curlymangoBack.yv += 0.5;
      curlymangoBack.y += curlymangoBack.yv;
      if (curlymangoBack.y >= 0) {
        curlymangoBack.y = 0;
        player.ccFallingState = 1;
        shakeRadius = 50;
        cameraDistDest = 200;
      }
    } else if (player.ccFallingState === 1) {
      if (player.z > 100) player.ccFallingState = 2;
    } else {
      if (player.lastWhoopsie !== null && frame < player.lastWhoopsie + 300) {
        curlymangoBack.proximity += (0.5 - curlymangoBack.proximity) / 3;
      } else {
        curlymangoBack.proximity += (1 - curlymangoBack.proximity) / 3;
      }
      curlymangoBack.opacity = curlymangoBack.proximity;
      curlymangoBack.z = playerObject.z - cameraDistDest * curlymangoBack.proximity - 10;
    }
    camera.rot += (cameraRotDest - camera.rot) / 5;
    GROUND_Y += (groundYDest - GROUND_Y) / 5;
    cameraDist += (cameraDistDest - cameraDist) / 5;
    ({paths, objects} = calculate3D(
      [beginningPath, ...currentMap.paths, ...(nextMap || {paths: []}).paths],
      [playerObject, !player.seeCC && curlymangoBack, ...currentMap.objects, ...(nextMap || {objects: []}).objects],
      playerObject.x, playerObject.z
    ));
  } else if (mode.slice(0, 4) === 'menu') {
    camera.rot += 0.005;
    if (frame > menu.nextRefocus) {
      menu.nextRefocus = frame + 300;
      menu.focusX = Math.random() * 400 - 200;
      menu.focusZ = Math.random() * 400 - 200;
      cameraDist = Math.random() * 400 - 200;
      GROUND_Y = Math.random() * 80 + 10;
      camera.rot = Math.atan2(-menu.focusX, -menu.focusZ);
    }
    ({paths, objects} = calculate3D([], menu.objects, menu.focusX, menu.focusZ));
  } else if (mode === 'play-again') {
    cameraDist = 500;
    GROUND_Y = Math.sin(frame / 60) * 30 + 70;
    camera.rot = Math.PI + Math.sin(frame / 44) / 20;
    ({paths, objects} = calculate3D(playAgain.paths, playAgain.objects, 0, 0));
  } else if (mode === 'intro') {
    if (keys.skip) {
      return 'game';
    }
    const progress = frame - intro.startTime;
    if (progress < intro.times.zoomToV1) {
      cameraDist -= 0.5;
    } else if (progress < intro.times.studentComeOut) {
      if (intro.lastTime !== 'studentComeOut') {
        shakeRadius = 20;
        intro.lastTime = 'studentComeOut';
      }
      shakeRadius *= 0.9;
      intro.objects.student.z -= 3;
    } else if (progress < intro.times.studentRunAway) {
      shakeRadius = 0;
      intro.objects.student.x += 5;
    } else if (progress < intro.times.securityCamera) {
      if (intro.lastTime !== 'securityCamera') {
        GROUND_Y = 120;
        intro.focusX = -130;
        cameraDist = 150;
        intro.lastTime = 'securityCamera';
      }
      cameraDist -= 0.5;
      shakeRadius += 0.1;
    } else {
      return 'game';
    }
    ({paths, objects} = calculate3D(intro.paths, Object.values(intro.objects), intro.focusX, intro.focusZ));
  } else {
    paths = objects = [];
  }

  const start = performance.now();
  c.fillStyle = '#b0a47e';
  paths.forEach(path => {
    c.beginPath();
    c.moveTo(path[0].x + shakeX, path[0].y + shakeY);
    path.slice(1).forEach(({x, y}) => c.lineTo(x + shakeX, y + shakeY))
    c.fill();
  });
  let noRenderUnder = renderLimit === null ? 0 : objects.length - renderLimit;
  objects.forEach((obj, i) => {
    if (i < noRenderUnder) return;
    if (params.autoCensor && obj.type === 'aplus' && obj.scale < 0.7) return;
    if (obj.translucency !== null) c.globalAlpha = obj.translucency;
    const img = imageData[obj.type];
    const width = obj.scale * (customSizes[obj.type] ? customSizes[obj.type][0] : img.width);
    const height = obj.scale * (customSizes[obj.type] ? customSizes[obj.type][1] : img.height); // support for diff. ratios?
    drawIfInCanvas(img, obj.x - width / 2 + shakeX, obj.y - height + shakeY, width, height);
    if (obj.translucency !== null) c.globalAlpha = 1;
  });
  const time = performance.now() - start;
  if (params.autoCensor && time) {
    if (renderLimit === null) renderLimit = Math.floor(objects.length * +params.autoCensor / time);
    else renderLimit = Math.floor((objects.length * +params.autoCensor / time + renderLimit) / 2);
  }
}
