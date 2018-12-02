const {read, write, readdir} = require('./fs-helper.js');

const noVectorEffectRegex = / vector-effect="non-scaling-stroke"/g;

(async () => {
  const ignore = (await read('./images/ignore')).split(/\r?\n/);
  const images = (await readdir('./images/')).filter(filename => !ignore.includes(filename));
  await (await Promise.all(images.map(filename => read('./images/' + filename)))).map((svg, i) => {
    return write(`./images/${images[i]}`, svg.replace(noVectorEffectRegex, ''));
  });
  console.log('ok');
})();
