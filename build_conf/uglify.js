//SEE: https://www.npmjs.com/package/uglify-js

const pkg= require('../package.json');

const execFile = require('child_process').execFile;
const Me= pkg.name.toLowerCase(); //OJO: Coordinar con build/rollup-config.js

execFile('npx', ('uglifyjs dist/'+Me+'-src.js -c -m -o dist/'+Me+'.js --source-map filename=dist/'+Me+'.js.map --in-source-map dist/'+Me+'-src.js.map --source-map-url '+Me+'.js.map --comments').split(/\s/));
