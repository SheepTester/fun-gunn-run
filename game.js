const CHUNK_SIZE = 2500;

const player = {x: 0, y: GROUND_Y, z: 0, yv: null, speed: 5};

function movePlayer() {
  if (player.yv === null && keys.jump) {
    player.yv = -7.5;
  }
  if (player.yv !== null) {
    player.y += player.yv;
    player.yv += 0.5;
    if (player.y > GROUND_Y) {
      player.y = GROUND_Y;
      player.yv = null;
    }
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
      if (keys.left && !keys.right) {
        player.z = 0;
        currentMap = nextMap = null;
        updateMap();
        camera.rot = Math.PI / 2;
      } else if (!keys.left && keys.right) {
        player.z = 0;
        currentMap = nextMap = null;
        updateMap();
        camera.rot = -Math.PI / 2;
      }
    }
  }
  currentMap.objects.filter(({z}) => player.z - 10 < z && z < player.z + 10).forEach(obj => {
    if (obj.type === 'aplus') {
      if (player.x - 10 < obj.x && obj.x < player.x + 10 && player.y - 10 < obj.y && obj.y < player.y + 10) {
        const index = currentMap.objects.indexOf(obj);
        if (~index) currentMap.objects.splice(index, 1);
      }
    }
  });
}

const coinPositions = [-35, 0, 35];
let currentMap;
let nextMap = null;
updateMap();
function updateMap() {
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
    currentMap = generateMap(0);
  }
  if (currentMap.branches === null) {
    nextMap = generateMap(CHUNK_SIZE);
  } else {
    nextMap = null;
  }
}
function generateMap(zOffset) {
  const map = {
    paths: [],
    objects: []
  };
  let end;
  if (Math.random() < 0.5) {
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
  for (let z = 0; z < end - 300; z += Math.random() * 500 + 250) {
    const left = Math.random() < 0.5;
    map.objects.push({type: 'tree', x: left ? -75 : 75, z: z + zOffset});
  }
  let coinStringStop = -1, coinMode;
  for (let z = 0; z < end - 100; z += 75) {
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
