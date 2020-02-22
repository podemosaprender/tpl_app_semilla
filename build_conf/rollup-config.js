// Config file for running Rollup in "normal" mode (non-watch)

let serve= require('rollup-plugin-serve');
let livereload= require('rollup-plugin-livereload');

let resolve= require('rollup-plugin-node-resolve');
let commonjs= require('rollup-plugin-commonjs');
//A: load from node_modules;

let babel= require('rollup-plugin-babel');
let sourcemaps= require('rollup-plugin-sourcemaps');
//A: for older browsers, keep sourcemaps for coverage

let postcss= require('rollup-plugin-postcss');
//A: bundle css inline

let rollupGitVersion= require('rollup-plugin-git-version');
let json= require('rollup-plugin-json');
let gitRev= require('git-rev-sync');
let pkg= require('../package.json');

let {version} = pkg;
let buildType;

// Skip the git branch+rev in the banner when doing a release build
buildType= process.env.NODE_ENV;
if (buildType!="release") {
	const branch = gitRev.branch();
	const rev = gitRev.short();
	version += '+' + branch + '.' + rev;
}

const banner = `/* @preserve
 / Esto aparece al principio de todos los archivos en dist/
 / Se configura en build_conf/rollup-config.js
 */
`;

const outro = `
	window.${pkg.name}= exports;
	/* 
	/ Esto aparece al final de todos los archivos en dist/
	/ Se configura en build_conf/rollup-config.js
	/ Puede ser un buen lugar para definir cosas publicas con
	/ window.MINOMBRE = exports;
	*/`;

console.log("Construyendo segun package.json main:", pkg.name);

let serve_opts= {
  // Launch in browser (default: false)
  open: true,
 
  // Page to navigate to when opening the browser.
  // Will not do anything if open=false.
  // Remember to start with a slash.
  //openPage: '/different/page',
 
  // Show server address in console (default: true)
  verbose: true,
 
  // Multiple folders to serve from
  //contentBase: ['dist', 'static'],
 
  // Path to fallback page
  historyApiFallback: '/200.html',
 
  // Options used in setting up server
  host: 'localhost',
  port: 8080,
 
  //set headers
  headers: {
    'Access-Control-Allow-Origin': '*',
  }
}

module.exports= {
	input: 'src/'+pkg.name+'.js',
	output: [
		{
			file: pkg.main,
			format: 'umd',
			name: pkg.name,
			banner: banner,
			outro: outro,
			sourcemap: 'file',
			freeze: false, //A: permitir modificar los modulos exportados
		}
	/*	{
			file: 'dist/'+pkg.name.toLowerCase()+'-src.esm.js',
			format: 'es',
			banner: banner,
			sourcemap: 'file'
		}
	*/
	],
	legacy: true, // Needed to create files loadable by IE8
	plugins: [
		postcss({
			inject: true,
			modules: true,
			extensions: [ '.css' ],
		}),
	  babel({
      exclude: 'node_modules/**'
    }), 
		sourcemaps(),
		resolve({
			browser: true,
		}),
    commonjs(),
		json(),
		rollupGitVersion(),
		serve(serve_opts),      // index.html should be in root of project
    livereload({
			watch: 'src',
			port: 8008
		})
	]
};
