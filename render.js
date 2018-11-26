const imageNames = [ // ./images/[NAME].svg
  'tree',
  'sheep',
  'player_temp',
  'aplus',
  'hailself',
  'caterpillar_tree',
  'trash_cart',
  'construction_fence',
  'backpack',
  'player_ducking'
];
const customSizes = {
  aplus: 20
};
const images = {};

function loadImages() {
  return Promise.all(imageNames.map(name => new Promise(res => {
    const img = new Image();
    img.onload = res;
    img.src = `./images/${name}.svg`;
    images[name] = img;
  })));
}
function drawIfInCanvas(img, x, y, width, height) {
  if (x < cwidth / 2 && -cwidth / 2 < x + width
      && y < cheight / 2 && -cheight / 2 < y + height) {
    c.drawImage(img, x, y, width, height);
  }
}
const beginningPath = {x: -50, z: -500, width: 100, height: 500};
function paint() {
  movePlayer();

  c.clearRect(-cwidth / 2, -cheight / 2, cwidth, cheight);
  c.fillStyle = '#d0c49f';
  c.fillRect(-cwidth / 2, 0, cwidth, cheight / 2);

  const playerObject = {
    type: player.ducking ? 'player_ducking' : 'player_temp',
    x: player.x,
    y: player.y,
    z: player.z
  };
  const {paths, objects} = calculate3D(
    [beginningPath, ...currentMap.paths, ...(nextMap || {paths: []}).paths],
    [playerObject, ...currentMap.objects, ...(nextMap || {objects: []}).objects]
  );
  c.fillStyle = '#b0a47e';
  paths.forEach(path => {
    c.beginPath();
    c.moveTo(path[0].x, path[0].y);
    path.slice(1).forEach(({x, y}) => c.lineTo(x, y))
    c.fill();
  });
  objects.forEach(obj => {
    const img = images[obj.type];
    const width = obj.scale * (customSizes[obj.type] || img.width);
    const height = obj.scale * (customSizes[obj.type] || img.height); // support for diff. ratios?
    drawIfInCanvas(img, obj.x - width / 2, obj.y - height, width, height);
  });
}
