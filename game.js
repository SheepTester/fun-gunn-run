const CHUNK_SIZE = 2500;

const JUMP_DISTANCE = 200;
const JUMP_HEIGHT = -70;

const player = {x: 0, y: GROUND_Y, z: 0, jumping: false, speed: 5};

function movePlayer() {
  if (!player.jumping && keys.jump) {
    const now = Date.now();
    const halfTime = JUMP_DISTANCE / 2 / player.speed * (1000 / 60);
    player.jumping = {
      startTime: now,
      endTime: halfTime * 2,
      gravity: -JUMP_HEIGHT / (halfTime * halfTime),
      initVel: 2 * JUMP_HEIGHT / halfTime,
      startZ: player.z
    };
  }
  if (player.jumping) {
    const time = Date.now() - player.jumping.startTime;
    if (time > player.jumping.endTime) {
      player.y = GROUND_Y;
      console.log(player.z - player.jumping.startZ);
      player.jumping = false;
    } else {
      player.y = player.jumping.gravity * time * time + player.jumping.initVel * time + GROUND_Y;
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
  player.z += player.speed;
  if (player.z > CHUNK_SIZE) {
    player.z -= CHUNK_SIZE;
    updateMap();
  }
  if (currentMap.branches !== null) {
    if (player.z > currentMap.branches + 100) {
      throw new Error('Death');
    } else if (player.z > currentMap.branches) {
      if (keys.left && !keys.right || !keys.left && keys.right) {
        player.z = 0;
        currentMap = nextMap = null;
        updateMap(true);
        camera.rot = keys.left ? Math.PI / 2 : -Math.PI / 2;
      }
    }
  }
  currentMap.objects.filter(({z}) => player.z - 10 < z && z < player.z + 10).forEach(obj => {
    switch (obj.type) {
      case 'aplus':
        if (player.x - 10 < obj.x && obj.x < player.x + 10 && player.y - 10 < obj.y && obj.y < player.y + 10) {
          const index = currentMap.objects.indexOf(obj);
          if (~index) currentMap.objects.splice(index, 1);
        }
        break;
      case 'caterpillar_tree':
        if (!player.ducking) {
          throw new Error('Death');
        }
        break;
      case 'trash_cart':
        if (!player.jumping) {
          throw new Error('Death');
        }
        break;
      case 'construction_fence':
        if (obj.x < 0 && player.x <= 10 || obj.x > 0 && player.x >= -10) {
          throw new Error('Death');
        }
        break;
      case 'backpack':
        if ((obj.x < 0 && player.x <= 10 || obj.x > 0 && player.x >= -10) && !player.jumping) {
          console.log('warning');
        }
        break;
    }
  });
  player.speed += 0.01;
}

const coinPositions = [-35, 0, 35];
let currentMap;
let nextMap = null;
updateMap();
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
    throw new Error('Death');
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
    map.paths.push({x: -300, z: map.branches + zOffset, width: 600, height: 100});
    map.paths.push({x: -50, z: zOffset, width: 100, height: map.branches});
    map.objects.push({type: 'hailself', x: 0, z: map.branches + zOffset + 100})
    end = map.branches;
  }
  for (let z = justTurned ? 500 : 0; z < end - 300; z += Math.random() * 500 + 250) {
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
        map.objects.push({type: 'tree', x: left ? -75 : 75, z: z + zOffset});
    }
  }
  let coinStringStop = -1, coinMode;
  for (let z = justTurned ? 300 : 0; z < end - 100; z += 75) {
    if (z > coinStringStop) {
      coinStringStop = z + Math.random() * 300 + 200;
      coinMode = Math.floor(Math.random() * 5);
    }
    if (coinMode < 3) {
      map.objects.push({type: 'aplus', x: coinPositions[coinMode], y: GROUND_Y - 5, z: z + zOffset});
    }
  }
  return map;
}
