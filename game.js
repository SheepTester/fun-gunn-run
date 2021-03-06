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
