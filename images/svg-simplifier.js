const {read, write, readdir} = require('./fs-helper.js');

const noVectorEffectRegex = / vector-effect="non-scaling-stroke"/g;

const removeHeader = /<\?xml version="1\.0" standalone="no"\?>/g;
const removeMeterlimit = / stroke-miterlimit="3"/g;
const removeEvenodd = / fill-rule="evenodd"/g;
const removeDefs = /<defs><clipPath id="_clipPath_[a-zA-Z0-9]+"><rect width="\d+" height="\d+"\/><\/clipPath><\/defs>/g;
const removeIsolate = / style="isolation:isolate"/g;
const removeSpacesPath = / ([MZLCQ]) /g; // $1
const removeStrokeOpacity = / stroke-opacity="1000000"/g;
const weirdDecimals = /\d+\.\d{4,}/g;

(async () => {
  ignore = (await read('./images/ignore')).split(/\r?\n/);
  const onlyForIndex = ignore.indexOf('<< ONLY FOR TEXTUREATLASIFIER >>');
  if (~onlyForIndex) {
    ignore = ignore.slice(0, onlyForIndex);
  }
  // const images = (await readdir('./images/')).filter(filename => !ignore.includes(filename));
  const images = ['test.svg'];
  await (await Promise.all(images.map(filename => read('./images/' + filename)))).map((svg, i) => {
    return write(`./images/${images[i]}`,
      svg.replace(noVectorEffectRegex, '')
      .replace(removeHeader, '')
      .replace(removeMeterlimit, '')
      .replace(removeEvenodd, '')
      .replace(removeDefs, '')
      .replace(removeIsolate, '')
      .replace(removeSpacesPath, '$1')
      .replace(removeStrokeOpacity, '')
      .replace(weirdDecimals, m => Math.round(+m))
    );
  });
  console.log('ok');
})();
