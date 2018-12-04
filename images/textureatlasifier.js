const {read, write, readdir} = require('./fs-helper.js');

const widthHeightRegex = /width="([0-9.]+)" height="([0-9.]+)"/;

(async () => {
  const ignore = (await read('./images/ignore')).split(/\r?\n/);
  const images = (await readdir('./images/')).filter(filename => !ignore.includes(filename));
  let y = 0, maxWidth = 0;
  let svgs = '';
  const positions = {};
  (await Promise.all(images.map(filename => read('./images/' + filename)))).forEach((svg, i) => {
    let [, width, height] = widthHeightRegex.exec(svg);
    width = +width, height = +height;
    if (width > maxWidth) maxWidth = width;
    svgs += svg.replace(/<svg/, `<svg x="0" y="${y}"`);
    positions[images[i].slice(0, -4)] = {
      x: 0,
      y: y,
      width: width,
      height: height
    };
    y += Math.ceil(height) + 1;
  });
  svgs = `<svg viewBox="0 0 ${maxWidth} ${y}" width="${maxWidth}" height="${y}" xmlns="http://www.w3.org/2000/svg">` + svgs + '</svg>';
  await write('./images/textureatlas.svg', svgs);
  await write('./images/textureatlas.json', JSON.stringify(positions));
  console.log('ok');
})();
