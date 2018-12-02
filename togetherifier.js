const {read, write, readdir} = require('./images/fs-helper.js');

const jsfiles = ['input', 'render', 'positioning', 'game', 'main'];

(async () => {
  let superJS = '';
  await write('everything.js', '(() => {\n\n' + (await Promise.all(jsfiles.map(filename => read(`./${filename}.js`)))).join('\n\n') + '\n\n})();');
  console.log('ok');
})();
