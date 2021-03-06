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
const actuallyNoAttributionEitherOof = /<!-- Generator: Gravit\.io -->/g;
const noHiddenRect = /<clipPath id="_clipPath_[a-zA-Z0-9]+"><rect x="0" y="0" width="\d+" height="\d+" transform="matrix\(1,0,0,1,0,0\)" fill="rgb\(255,255,255\)"\/><\/clipPath>/g;
const destroyCloseG = /<\/g>/g;
const noGroups = /<g( clip-path="url\(#_clipPath_[a-zA-Z0-9]+\)")?>/g;
const findRGB = /rgb\((\d+),(\d+),(\d+)\)/g;

function destroySVG(svg) {
  return svg.replace(noVectorEffectRegex, '')
    .replace(removeHeader, '')
    .replace(removeMeterlimit, '')
    .replace(removeEvenodd, '')
    .replace(removeDefs, '')
    .replace(removeIsolate, '')
    .replace(removeSpacesPath, '$1')
    .replace(removeStrokeOpacity, '')
    .replace(weirdDecimals, m => Math.round(+m))
    .replace(actuallyNoAttributionEitherOof, '')
    .replace(noHiddenRect, '')
    .replace(findRGB, (_, r, g, b) => {
      r = (+r).toString(16).padStart(2, '0');
      g = (+g).toString(16).padStart(2, '0');
      b = (+b).toString(16).padStart(2, '0');
      if (r === g && g === b && (r[0] === r[1] || r === '0')) {
        return '#' + r[0].repeat(3);
      } else {
        return '#' + r + g + b;
      }
    });
}

(async () => {
  ignore = (await read('./images/ignore')).split(/\r?\n/);
  const onlyForIndex = ignore.indexOf('<< ONLY FOR TEXTUREATLASIFIER >>');
  if (~onlyForIndex) {
    ignore = ignore.slice(0, onlyForIndex);
  }
  ignore.push('dumb-logo.svg');
  const images = (await readdir('./images/')).filter(filename => !ignore.includes(filename));
  await (await Promise.all(images.map(filename => read('./images/' + filename)))).map((svg, i) => {
    return write(`./images/${images[i]}`,
      destroySVG(svg)
      .replace(destroyCloseG, '')
      .replace(noGroups, '')
    );
  });
  await write('./images/dumb-logo.svg', destroySVG(await read('./images/dumb-logo.svg')));
  console.log('ok');
})();
