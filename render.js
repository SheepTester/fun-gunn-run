const customSizes = {
  aplus: [20, 20]
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
for (let i = 30; i--;) menu.objects.push({type: Math.random() < 0.1 ? 'caterpillar_tree' : 'tree', x: Math.random() * 500 - 250, z: Math.random() * 500 - 250})
const beginningPath = {x: -50, z: -500, width: 100, height: 500};
let shakeRadius = 0;
function paint() {
  c.clearRect(-cwidth / 2, -cheight / 2, cwidth, cheight);
  const shakeX = Math.random() * shakeRadius * 2 - shakeRadius;
  const shakeY = Math.random() * shakeRadius * 2 - shakeRadius;

  c.fillStyle = '#d0c49f';
  c.fillRect(-cwidth / 2, shakeY, cwidth, cheight / 2 - shakeY);

  const now = Date.now();
  let paths, objects;

  if (mode === 'game') {
    movePlayer();
    if (now > player.endDeathAnim && player.ccSteps >= 3) {
      return 'menu';
    }
    const playerObject = {
      type: player.ducking ? 'player_ducking' : 'player_temp',
      x: player.x,
      y: player.y,
      z: player.z
    };
    camera.rot += (cameraRotDest - camera.rot) / 5;
    GROUND_Y += (groundYDest - GROUND_Y) / 5;
    cameraDist += (cameraDistDest - cameraDist) / 5;
    ({paths, objects} = calculate3D(
      [beginningPath, ...currentMap.paths, ...(nextMap || {paths: []}).paths],
      [playerObject, ...currentMap.objects, ...(nextMap || {objects: []}).objects],
      playerObject.x, playerObject.z
    ));
  } else if (mode === 'menu') {
    camera.rot += 0.005;
    if (now > menu.nextRefocus) {
      menu.nextRefocus = now + 5000;
      menu.focusX = Math.random() * 400 - 200;
      menu.focusZ = Math.random() * 400 - 200;
      cameraDist = Math.random() * 400 - 200;
      GROUND_Y = Math.random() * 80 + 10;
      camera.rot = Math.atan2(-menu.focusX, -menu.focusZ);
    }
    ({paths, objects} = calculate3D([], menu.objects, menu.focusX, menu.focusZ));
  } else {
    paths = objects = [];
  }

  c.fillStyle = '#b0a47e';
  paths.forEach(path => {
    c.beginPath();
    c.moveTo(path[0].x + shakeX, path[0].y + shakeY);
    path.slice(1).forEach(({x, y}) => c.lineTo(x + shakeX, y + shakeY))
    c.fill();
  });
  objects.forEach(obj => {
    const img = imageData[obj.type];
    const width = obj.scale * (customSizes[obj.type] ? customSizes[obj.type][0] : img.width);
    const height = obj.scale * (customSizes[obj.type] ? customSizes[obj.type][1] : img.height); // support for diff. ratios?
    drawIfInCanvas(img, obj.x - width / 2 + shakeX, obj.y - height + shakeY, width, height);
  });
}
