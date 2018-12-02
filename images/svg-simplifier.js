const {read, write, readdir} = require('./fs-helper.js');

const noVectorEffectRegex = / vector-effect="non-scaling-stroke"/g;

(async () => {
  ignore = (await read('./images/ignore')).split(/\r?\n/);
  const onlyForIndex = ignore.indexOf('<< ONLY FOR TEXTUREATLASIFIER >>');
  if (~onlyForIndex) {
    ignore = ignore.slice(0, onlyForIndex);
  }
  const images = (await readdir('./images/')).filter(filename => !ignore.includes(filename));
  await (await Promise.all(images.map(filename => read('./images/' + filename)))).map((svg, i) => {
    return write(`./images/${images[i]}`, svg.replace(noVectorEffectRegex, ''));
  });
  console.log('ok');
})();
