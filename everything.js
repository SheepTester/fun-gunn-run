(() => {

const keys = {
  jump: false,
  left: false,
  right: false,
  ducking: false
};

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.keyCode) {
    case 37:
    case 65:
      keys.left = true;
      break;
    case 38:
    case 87:
    case 32:
      keys.jump = true;
      break;
    case 39:
    case 68:
      keys.right = true;
      break;
    case 40:
    case 83:
      keys.ducking = true;
      break;
    case 27:
      keys.skip = true;
      if (currentBackMenu) currentBackMenu.click();
      break;
    case 49:
      speedyBtn.click();
      break;
    case 50:
      lifeBtn.click();
      break;
    case 51:
      resetBtn.click();
      break;
    case 13:
      if (currentPlayBtn) currentPlayBtn.click();
      break;
    default:
      keys[e.keyCode] = true;
  }
});
document.addEventListener('keyup', e => {
  switch (e.keyCode) {
    case 37:
    case 65:
      keys.left = false;
      break;
    case 38:
    case 87:
    case 32:
      keys.jump = false;
      break;
    case 39:
    case 68:
      keys.right = false;
      break;
    case 40:
    case 83:
      keys.ducking = false;
      break;
    case 27:
      keys.skip = false;
      break;
    default:
      keys[e.keyCode] = false;
  }
});
const CENTRE_RADIUS = 20;
const ranges = {
  right: [-3 * Math.PI / 8, 3 * Math.PI / 8],
  down: [Math.PI / 8, 7 * Math.PI / 8],
  top: [-7 * Math.PI / 8, -Math.PI / 8],
  left: [5 * Math.PI / 8, -5 * Math.PI / 8]
};
const CIRCLE_SIZE = -140;
function initTouch() {
  const touchCircle = document.getElementById('touch-circle');
  let initX, initY;
  function touchCircleDown(clientX, clientY) {
    touchCircle.style.display = 'block';
    initX = clientX;
    initY = clientY;
    touchCircle.style.transform = `translate(${initX}px, ${initY}px)`;
    touchCircle.style.backgroundPosition = '0 0';
  }
  function doCircles(clientX, clientY) {
    const diffX = clientX - initX;
    const diffY = clientY - initY;
    if (diffX * diffX + diffY * diffY > CENTRE_RADIUS * CENTRE_RADIUS) {
      const angle = Math.atan2(diffY, diffX);
      let position;
      const top = angle > ranges.top[0] && angle < ranges.top[1];
      const down = angle > ranges.down[0] && angle < ranges.down[1];
      const left = angle > ranges.left[0] || angle < ranges.left[1];
      const right = angle > ranges.right[0] && angle < ranges.right[1];
      if (left) {
        position = top ? [1, 1] : down ? [1, 2] : [0, 2];
      } else if (right) {
        position = top ? [1, 4] : down ? [1, 3] : [0, 4];
      } else {
        position = top ? [0, 1] : down ? [0, 3] : [0, 0];
      }
      keys.left = left, keys.jump = top, keys.right = right, keys.ducking = down;
      touchCircle.style.backgroundPosition = `${position[0] * CIRCLE_SIZE}px ${position[1] * CIRCLE_SIZE}px`;
    } else {
      keys.left = keys.jump = keys.right = keys.ducking = false;
      touchCircle.style.backgroundPosition = '0 0';
    }
  }
  let touch = null;
  document.addEventListener('touchstart', e => {
    if (touch === null) {
      touch = e.changedTouches[0].identifier;
      touchCircleDown(e.touches[0].clientX, e.touches[0].clientY);
    }
    if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
  }, {passive: false});
  document.addEventListener('touchmove', e => {
    if (e.touches[0].identifier === touch) {
      doCircles(e.touches[0].clientX, e.touches[0].clientY);
    }
    if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
  }, {passive: false});
  document.addEventListener('touchend', e => {
    if (e.changedTouches[0].identifier === touch) {
      touchCircle.style.display = 'none';
      keys.left = keys.jump = keys.right = keys.ducking = false;
      touch = null;
    }
    if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
  }, {passive: false});
  if (params.mouseCircle) {
    document.addEventListener('mousedown', e => {
      if (touch === null) {
        touch = 'mouse';
        touchCircleDown(e.clientX, e.clientY);
      }
      if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if ('mouse' === touch) {
        doCircles(e.clientX, e.clientY);
      }
      if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
    });
    document.addEventListener('mouseup', e => {
      if ('mouse' === touch) {
        touchCircle.style.display = 'none';
        keys.left = keys.jump = keys.right = keys.ducking = false;
        touch = null;
      }
      if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
    });
  }
}


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
      masterSVG.src = `./images/textureatlas.svg?v=${VERSION}`;
    }),
    fetch('./images/textureatlas.json?v=' + VERSION).then(r => r.json()).then(json => imageData = json)
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
    {x: 100, z: -115, width: 500, height: 50}
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
    if (player.coins < PRICES.speedy) {
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
      opacity: player.invincible ? (player.invincibleTimeout - frame < 60 ? (frame % 12 < 6 ? 0.2 : PLAYER_OPACITY) : player.invincibleTimeout - frame < 180 ? (frame % 30 < 15 ? 0.2 : PLAYER_OPACITY) : 0.2) : PLAYER_OPACITY
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
    camera.rot += (cameraRotDest - camera.rot) / 300;
    if (frame > menu.nextRefocus) {
      menu.nextRefocus = frame + 300;
      menu.focusX = Math.random() * 400 - 200;
      menu.focusZ = Math.random() * 400 - 200;
      cameraDist = Math.random() * 400 - 200;
      GROUND_Y = Math.random() * 80 + 10;
      camera.rot = Math.atan2(-menu.focusX, -menu.focusZ);
      cameraRotDest = camera.rot + Math.PI / 2;
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
  let objectsRendered = 0;
  objects.forEach((obj, i) => {
    if (i < noRenderUnder) return;
    if (params.autoCensor && obj.type === 'aplus' && obj.scale < 0.7) return;
    objectsRendered++;
    if (obj.translucency !== null) c.globalAlpha = obj.translucency;
    const img = imageData[obj.type];
    const width = obj.scale * (customSizes[obj.type] ? customSizes[obj.type][0] : img.width);
    const height = obj.scale * (customSizes[obj.type] ? customSizes[obj.type][1] : img.height);
    drawIfInCanvas(img, obj.x - width / 2 + shakeX, obj.y - height + shakeY, width, height);
    if (obj.translucency !== null) c.globalAlpha = 1;
  });
  const time = performance.now() - start;
  if (params.autoCensor && time) {
    if (renderLimit === null) renderLimit = Math.floor(objectsRendered * +params.autoCensor / time);
    else renderLimit = Math.floor((objectsRendered * +params.autoCensor / time + renderLimit) / 2);
  }
}


const NEAR_PLANE = 10;
const VIEW_FACTOR = 500;
const ACTUAL_GROUND_Y = 75;

let GROUND_Y, groundYDest;

const camera = {x: 0, z: 0, rot: 0};
let cameraRotDest;

let cameraDist, cameraDistDest;

function resetCamera() {
  cameraDistDest = cameraDist = 500;
  camera.x = camera.z = 0;
  cameraRotDest = camera.rot = 0;
  groundYDest = GROUND_Y = ACTUAL_GROUND_Y;
}

function transform(camera, x, z, sin, cos) {
  const relX = x - camera.x,
  relZ = z - camera.z;
  return {
    x: relX * cos - relZ * sin,
    z: relZ * cos + relX * sin
  };
}
function flatify(x, y, z) {
  return {
    x: x / z * VIEW_FACTOR,
    y: y / z * VIEW_FACTOR,
    scale: 1 / z * VIEW_FACTOR
  };
}
function intersect(pt1, pt2) {
  return {x: pt1.x + (NEAR_PLANE - pt1.z) / (pt2.z - pt1.z) * (pt2.x - pt1.x), z: NEAR_PLANE};
}
function getItem(arr, index) {
  const length = arr.length;
  return (index + length) % length;
}
function calculate3D(paths, objects, focusX, focusZ) {
  const sin = Math.sin(camera.rot),
  cos = Math.cos(camera.rot);

  if (focusX !== undefined) {
    camera.x = focusX - sin * cameraDist;
    camera.z = focusZ - cos * cameraDist;
  }

  paths = paths.map(obj => {
    const points = [[obj.x, obj.z], [obj.x + obj.width, obj.z],
      [obj.x + obj.width, obj.z + obj.height], [obj.x, obj.z + obj.height]]
      .map(([x, z]) => transform(camera, x, z, sin, cos));
    for (let i = 0; i < points.length; i++) {
      const currentPt = points[i];
      if (currentPt.z < NEAR_PLANE) {
        for (let lastPt = currentPt; points.length;) {
          const pt = points[getItem(points, i - 1)];
          if (pt.z < NEAR_PLANE) {
            lastPt = pt;
            points.splice(getItem(points, i - 1), 1);
          } else {
            points.splice(i, 0, intersect(lastPt, pt));
            break;
          }
        }
        points.splice(i + 1, 1);
        for (let lastPt = currentPt; points.length;) {
          const pt = points[getItem(points, i + 1)];
          if (pt.z < NEAR_PLANE) {
            lastPt = pt;
            points.splice(getItem(points, i + 1), 1);
          } else {
            points.splice(getItem(points, i + 1), 0, intersect(lastPt, pt));
            break;
          }
        }
      }
    }
    if (points.length < 3) return;
    return points.map(({x, z}) => flatify(x, GROUND_Y, z));
  }).filter(obj => obj);
  objects = objects.map(obj => {
    if (!obj) return;
    const y = obj.y === undefined ? GROUND_Y : obj.relativeY ? obj.y + GROUND_Y : obj.y;
    const transformation = transform(camera, obj.x, obj.z, sin, cos);
    if (transformation.z >= NEAR_PLANE) {
      const coords = flatify(transformation.x, y, transformation.z);
      coords.type = obj.type;
      coords.distance = transformation.z;
      coords.translucency = obj.opacity === undefined ? null : obj.opacity;
      return coords;
    } else {
      return;
    }
  }).filter(obj => obj).sort((a, b) => b.distance - a.distance);

  return {
    paths: paths,
    objects: objects
  };
}


const CHUNK_SIZE = 2500;

let player;

function die(manner) {
  if (player.invincible) return;
  if (player.lives <= 0) {
    skipEndBtn.style.opacity = null;
    player.dead = true;
    player.zv = -8;
    player.ducking = false;
    player.endDeathAnim = frame + 120;
    shakeRadius = 10;
    speedyBtn.disabled = true;
    lifeBtn.disabled = true;
    resetBtn.disabled = true;
    player.deathManner = manner;
    player.deathDate = Date.now();
  } else {
    player.lives--;
    livesDisplay.textContent = player.lives;
    player.invincible = true; // should also disable the shop
    player.invincibleTimeout = frame + 180;
  }
}

function movePlayer() {
  if (player.speedy) {
    shakeRadius += (10 - shakeRadius) * 0.9;
  } else {
    shakeRadius *= 0.9;
  }
  if (player.seeCC) {
    player.y = GROUND_Y;
    const cc = currentMap.objects[currentMap.objects.length - 1];
    cc.z += (player.ccZDest - cc.z) / 3;
    if (frame > player.endDeathAnim && player.ccSteps < 3) {
      player.ccSteps++;
      shakeRadius = player.ccSteps * 10;
      player.ccZDest += 100;
      player.endDeathAnim = frame + 60;
    }
    return;
  } else if (player.dead) {
    if (player.yv !== null) {
      player.y += player.yv;
      player.yv += 0.5;
      player.z += player.zv;
      if (player.y > GROUND_Y) {
        player.y = GROUND_Y;
        player.yv = null;
      }
    } else {
      player.z += player.zv;
      player.zv *= 0.9;
    }
    if (shakeRadius < 1 && Math.abs(player.zv) < 1 && frame > player.endDeathAnim) {
      player.seeCC = true;
      shakeRadius = 0;
      cameraRotDest = Math.PI;
      groundYDest = 60;
      cameraDistDest = 50;
      currentMap.objects.push({type: 'curlymango', x: 0, z: player.z - 300});
      player.ccZDest = player.z - 300;
      player.endDeathAnim = frame + 90;
    }
    return;
  }
  if (player.invincibleTimeout !== null && frame > player.invincibleTimeout) {
    player.invincibleTimeout = null;
    player.invincible = false;
    player.speedy = false;
  }
  if (player.yv === null && keys.jump) {
    player.yv = -8;
  }
  if (player.yv !== null) {
    if (keys.ducking) {
      player.yv += 1;
    }
    player.y += player.yv;
    player.yv += 0.5;
    if (player.y > GROUND_Y) {
      player.y = GROUND_Y;
      player.yv = null;
    }
    player.ducking = false;
  } else {
    player.ducking = keys.ducking;
  }
  if (keys.left && !keys.right) {
    player.x += (-30 - player.x) / 5;
  } else if (!keys.left && keys.right) {
    player.x += (30 - player.x) / 5;
  } else {
    player.x += -player.x / 5;
  }
  if (player.lastWhoopsie !== null && frame < player.lastWhoopsie + 300) {
    if (player.speedy) player.lastWhoopsie = null;
    player.z += 0.5 * player.speed;
    player.score += 0.5 * player.speed;
  } else {
    player.z += (player.speedy ? 5 : 1) * player.speed;
    player.score += (player.speedy ? 5 : 1) * player.speed;
    player.lastWhoopsie = null;
  }
  if (player.z > CHUNK_SIZE) {
    player.z -= CHUNK_SIZE;
    updateMap();
  }
  if (currentMap.branches !== null) {
    if (player.z > currentMap.branches + 100) {
      if (!player.invincible) die('sign');
      else {
        player.z = 0;
        currentMap = nextMap = null;
        updateMap(true);
        camera.rot = Math.PI * 4;
      }
    } else if (player.z > currentMap.branches) {
      if (keys.left && !keys.right || !keys.left && keys.right) {
        player.z = 0;
        currentMap = nextMap = null;
        updateMap(true);
        camera.rot = keys.left ? Math.PI / 2 : -Math.PI / 2;
      }
    }
  }
  currentMap.objects.filter(({z}) => z < player.z + 10).forEach(obj => {
    if (obj.hit) return;
    obj.hit = true;
    if (player.invincible) return;
    switch (obj.type) {
      case 'extra_life':
      case 'super_speed':
      case 'turtle':
      case 'aplus':
        if (player.x - 10 < obj.x && obj.x < player.x + 10 && player.y - 10 < obj.y && obj.y < player.y + 10) {
          const index = currentMap.objects.indexOf(obj);
          if (~index) currentMap.objects.splice(index, 1);
          switch (obj.type) {
            case 'aplus':
              player.coins++;
              break;
            case 'extra_life':
              player.lives++;
              livesDisplay.textContent = player.lives;
              break;
            case 'super_speed':
              player.invincible = true;
              player.speedy = true;
              player.invincibleTimeout = frame + 600;
              break;
            case 'turtle':
              player.speed = Math.max(player.speed - SPEED_DECREASE, 0);
              break;
          }
        }
        break;
      case 'caterpillar_tree':
        if (!player.ducking) {
          die('tree');
        }
        break;
      case 'trash_cart':
        if (player.y > 20) {
          die('cart');
        }
        break;
      case 'construction_fence':
        if (obj.x < 0 && player.x < 10 || obj.x > 0 && player.x > -10) {
          die('fence');
        }
        break;
      case 'backpack':
        if ((obj.x < 0 && player.x < 25 || obj.x > 0 && player.x > -25) && player.y > 50) {
          if (player.lastWhoopsie === null || frame > player.lastWhoopsie + 300) {
            player.lastWhoopsie = frame;
          } else {
            die('backpack');
          }
        }
        break;
    }
  });
  player.speed += 0.01;
}

const coinPositions = [-35, 0, 35];
let currentMap, nextMap;
function reset() {
  player = {
    x: 0, y: GROUND_Y, z: 0, yv: null, zv: null, speed: 5,
    lastWhoopsie: null,
    invincible: false,
    dead: false, seeCC: false, endDeathAnim: null, ccSteps: 0, ccZDest: null,
    score: 0, coins: 0,
    ccFallingState: 0,
    lives: 0,
    invincibleTimeout: null,
    speedy: false
  };
  currentMap = nextMap = null;
  updateMap();
  skipEndBtn.style.opacity = 0;
  livesDisplay.textContent = 0;
}
function updateMap(justTurned = false) {
  if (nextMap) {
    currentMap = nextMap;
    currentMap.paths.forEach(obj => {
      obj.z -= CHUNK_SIZE;
    });
    currentMap.objects.forEach(obj => {
      obj.z -= CHUNK_SIZE;
    });
  } else if (currentMap) {
    if (!player.invincible) die('sign');
    else {
      currentMap = generateMap(0, true);
    }
  } else {
    currentMap = generateMap(0, true);
  }
  if (currentMap.branches === null) {
    nextMap = generateMap(CHUNK_SIZE, justTurned);
  } else {
    nextMap = null;
  }
}
function generateMap(zOffset, justTurned = false) {
  const map = {
    paths: [],
    objects: []
  };
  let end;
  if (Math.random() < 0.5 || justTurned) {
    map.branches = null;
    map.paths.push({x: -50, z: zOffset, width: 100, height: CHUNK_SIZE});
    end = CHUNK_SIZE;
  } else {
    map.branches = Math.random() * (CHUNK_SIZE - 100);
    map.paths.push({x: -500, z: map.branches + zOffset, width: 1000, height: 100});
    map.paths.push({x: -50, z: zOffset, width: 100, height: map.branches});
    map.objects.push({type: 'hailself', x: 0, z: map.branches + zOffset + 100});
    map.objects.push({type: 'tree', x: -75, z: map.branches + zOffset - 25});
    map.objects.push({type: 'tree', x: 75, z: map.branches + zOffset - 25});
    end = map.branches;
  }
  for (let z = justTurned ? 800 : 0; z < end - 300; z += Math.random() * 500 + 300) {
    const left = Math.random() < 0.5;
    switch (Math.floor(Math.random() * 6)) {
      case 0:
        map.objects.push({type: 'caterpillar_tree', x: 30, z: z + zOffset});
        break;
      case 1:
        map.objects.push({type: 'trash_cart', x: 0, z: z + zOffset});
        break;
      case 2:
        map.objects.push({type: 'construction_fence', x: left ? -55 : 55, z: z + zOffset});
        break;
      case 3:
        map.objects.push({type: 'backpack', x: left ? -30 : 30, z: z + zOffset});
        break;
      default:
        map.objects.push({type: Math.random() < 0.01 ? 'sheep' : 'tree', x: left ? -75 : 75, z: z + zOffset});
    }
  }
  let coinStringStop = -1, coinMode;
  for (let z = justTurned ? 300 : 0; z < end - 100; z += 75) {
    if (z > coinStringStop) {
      coinStringStop = z + Math.random() * 300 + 400;
      coinMode = Math.floor(Math.random() * 5);
    }
    if (coinMode < 3) {
      let type;
      switch (Math.floor(Math.random() * 300)) {
        case 0:
          type = player.score > 10000 ? 'extra_life' : 'aplus';
          break;
        case 1:
          type = player.score > 20000 ? 'super_speed' : 'aplus';
          break;
        case 2:
          type = player.score > 15000 ? 'turtle' : 'aplus';
          break;
        default:
          type = 'aplus';
      }
      map.objects.push({type: type, x: coinPositions[coinMode], y: GROUND_Y - 5, z: z + zOffset});
    }
  }
  return map;
}


// URL PARAMETERS
// quality       - canvas quality
// skipIntro     - (legacy) skips intro
// autoCensor    - automatically limits the objects drawn such that it should take the given amount of milliseconds to render them
// mouseCircle   - enables touch circle for mouse
// playerOpacity - opacity of player
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

const VERSION = 1.1;
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
    if (e.target.tagName === 'INPUT') return;
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
  const outputLink = document.getElementById('generate-url');
  if (params.quality) qualityInput.value = params.quality;
  if (params.autoCensor) autoCensorInput.value = params.autoCensor;
  if (params.mouseCircle) mouseCircleInput.checked = true;
  if (params.playerOpacity) playerOpacityInput.value = params.playerOpacity;
  function updateURL() {
    let params = [];
    if (quality.value) params.push('quality=' + quality.value);
    if (autoCensorInput.value) params.push('autoCensor=' + autoCensorInput.value);
    if (mouseCircleInput.checked) params.push('mouseCircle');
    if (playerOpacityInput.value) params.push('playerOpacity=' + playerOpacityInput.value);
    outputLink.href = '?' + params.join('&');
  }
  qualityInput.addEventListener('input', updateURL);
  autoCensorInput.addEventListener('input', updateURL);
  mouseCircleInput.addEventListener('change', updateURL);
  playerOpacityInput.addEventListener('input', updateURL);
  updateURL();

  [...document.getElementsByTagName('button'), ...document.getElementsByTagName('input')].forEach(btn => btn.disabled = true);
  toMenu();
}

document.addEventListener('DOMContentLoaded', init, {once: true});


})();