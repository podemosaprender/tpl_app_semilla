/**
	@file ejecutar tests desde la consola
	OjO! requiere full path
	#npm run test-here `pwd`/proj.isPointInPolygon.test.js 2>&1 | less
*/
//VER: https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically

var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');
global.expect= require('expect.js');

// Instantiate a Mocha instance.
var mocha = new Mocha({
      ui: 'bdd',
      ignoreLeaks: true
    });

process.argv.slice(2).forEach( fn => {
	console.log("ADD TEST FILE:",fn);
	mocha.addFile(fn); //A: agrego el primer parametro
});

// Run the tests.
mocha.run(function(failures) {
  process.exitCode = failures ? 1 : 0;  // exit with non-zero status if there were failures
});
