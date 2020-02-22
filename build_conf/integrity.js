// This script calculates the integrity hashes of the files in dist/ , and
// **overwrites** the values in the documentation.

var ssri = require('ssri');
var fs   = require('fs');
var pkg = require('../package.json');
var version = pkg.version; 
var ME = pkg.name.toLowerCase();

const integritySrc = ssri.fromData(fs.readFileSync('dist/'+ME+'-src.js'));
const integrityUglified = ssri.fromData(fs.readFileSync('dist/'+ME+'.js'));
const integrityCss = ssri.fromData(fs.readFileSync('dist/'+ME+'.css'));


console.log('Integrity hashes for ', version, ':');
console.log('dist/'+ME+'-src.js: ', integritySrc.toString());
console.log('dist/'+ME+'.js:     ', integrityUglified.toString());
console.log('dist/'+ME+'.css:    ', integrityCss.toString());

if (false){
	var docConfig = fs.readFileSync('docs/_config.yml').toString();

	docConfig = docConfig.
		replace(new RegExp('latest_'+ME+'_version:.*'),  'latest_'+ME+'_version: ' + version).
		replace(/integrity_hash_source:.*/,   'integrity_hash_source: "' +   integritySrc.toString() + '"').
		replace(/integrity_hash_uglified:.*/, 'integrity_hash_uglified: "' + integrityUglified.toString() + '"').
		replace(/integrity_hash_css:.*/,      'integrity_hash_css: "' +      integrityCss.toString() + '"');

	// console.log('New jekyll docs config: \n', docConfig);

	fs.writeFileSync('docs/_config.yml', docConfig);
}
