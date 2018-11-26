const fs = require('fs');

function read(file) {
  return new Promise((res, rej) => {
    fs.readFile(file, 'utf8', (err, data) => err ? rej(err) : res(data));
  });
}
function write(file, contents) {
  return new Promise((res, rej) => {
    fs.writeFile(file, contents, 'utf8', err => err ? rej(err) : res());
  });
}
function readdir(dir, contents) {
  return new Promise((res, rej) => {
    fs.readdir(dir, (err, files) => err ? rej(err) : res(files));
  })
}

const ignore = ['README.md', 'textureatlasifier.js', 'textureatlas.svg', 'textureatlas.json'];

const widthHeightRegex = /width="([0-9.]+)" height="([0-9.]+)"/;

(async () => {
  const images = (await readdir('./images/')).filter(filename => !ignore.includes(filename));
  let y = 0, maxWidth = 0;
  let svgs = '';
  const positions = {};
  (await Promise.all(images.map(filename => read('./images/' + filename)))).forEach((svg, i) => {
    let [, width, height] = widthHeightRegex.exec(svg);
    width = +width, height = +height;
    if (width > maxWidth) maxWidth = width;
    svgs += svg.replace(/(style="isolation:isolate")/, `x="0" y="${y}"`).replace('<?xml version="1.0" standalone="no"?>', '');
    positions[images[i].slice(0, -4)] = {
      x: 0,
      y: y,
      width: width,
      height: height
    };
    y += height;
  });
  svgs = `<svg viewBox="0 0 ${maxWidth} ${y}" width="${maxWidth}" height="${y}" xmlns="http://www.w3.org/2000/svg">` + svgs + '</svg>';
  await write('./images/textureatlas.svg', svgs);
  await write('./images/textureatlas.json', JSON.stringify(positions));
  console.log('ok');
})();
