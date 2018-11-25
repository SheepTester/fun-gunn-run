const imageNames = [ // ./images/[NAME].svg
  'tree',
  'sheep'
];
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
const sheep = [
  {type: 'tree', x: 0, z: 300},
  {type: 'sheep', x: 0, z: -300},
  {type: 'sheep', x: -300, z: 0},
  {type: 'sheep', x: 300, z: 0}
];
for (let i = 0; i < 30; i++) {
  sheep.push({type: 'tree', x: Math.random() * 700 - 350, z: Math.random() * 700 - 350});
}
function paint() {
  c.clearRect(-cwidth / 2, -cheight / 2, cwidth, cheight);
  const {paths, objects} = calculate3D([
    {x: 0, z: 0, width: 100, height: 100}
  ], sheep);
  c.fillStyle = '#b0a47e';
  paths.forEach(path => {
    c.beginPath();
    c.moveTo(path[0].x, path[0].y);
    c.lineTo(path[1].x, path[1].y);
    c.lineTo(path[2].x, path[2].y);
    c.lineTo(path[3].x, path[3].y);
    c.fill();
  });
  objects.forEach(obj => {
    const img = images[obj.type];
    const width = obj.scale * img.width;
    const height = obj.scale * img.height;
    drawIfInCanvas(img, obj.x - width / 2, obj.y - height, width, height);
  });
}
