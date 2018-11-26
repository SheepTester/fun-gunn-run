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
  'player_ducking',
  'curlymango'
];
const customSizes = {
  aplus: [20, 20]
};
const images = {};

const masterSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const master = new Image();
function loadImages() {
  return Promise.all(imageNames.map(name => new Promise(res => {
    const img = new Image();
    img.onload = res;
    img.src = `./images/${name}.svg`;
    images[name] = {image: img};
  }))).then(() => new Promise(res => {
    let y = 0, maxWidth = 0;
    imageNames.forEach(name => {
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttributeNS(null, 'x', 0);
      image.setAttributeNS(null, 'y', images[name].y = y);
      image.setAttributeNS(null, 'width', images[name].width = images[name].image.width);
      image.setAttributeNS(null, 'height', images[name].height = images[name].image.height);
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `./images/${name}.svg`);
      if (maxWidth < images[name].image.width) maxWidth = images[name].image.width;
      y += images[name].image.height;
      masterSVG.appendChild(image);
    });
    masterSVG.setAttributeNS(null, 'width', maxWidth);
    masterSVG.setAttributeNS(null, 'height', y);
    master.onload = res;
    master.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(masterSVG));
  }));
}
function drawIfInCanvas(img, x, y, width, height) {
  if (x < cwidth / 2 && -cwidth / 2 < x + width
      && y < cheight / 2 && -cheight / 2 < y + height) {
    c.drawImage(master, 0, img.y, img.width, img.height, x, y, width, height);
  }
}
const beginningPath = {x: -50, z: -500, width: 100, height: 500};
let shakeRadius = 0;
function paint() {
  movePlayer();

  const shakeX = Math.random() * shakeRadius * 2 - shakeRadius;
  const shakeY = Math.random() * shakeRadius * 2 - shakeRadius;

  c.clearRect(-cwidth / 2, -cheight / 2, cwidth, cheight);
  c.fillStyle = '#d0c49f';
  c.fillRect(-cwidth / 2, shakeY, cwidth, cheight / 2 - shakeY);

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
    c.moveTo(path[0].x + shakeX, path[0].y + shakeY);
    path.slice(1).forEach(({x, y}) => c.lineTo(x + shakeX, y + shakeY))
    c.fill();
  });
  objects.forEach(obj => {
    const img = images[obj.type];
    const width = obj.scale * (customSizes[obj.type] ? customSizes[obj.type][0] : img.width);
    const height = obj.scale * (customSizes[obj.type] ? customSizes[obj.type][1] : img.height); // support for diff. ratios?
    drawIfInCanvas(img, obj.x - width / 2 + shakeX, obj.y - height + shakeY, width, height);
  });
}
