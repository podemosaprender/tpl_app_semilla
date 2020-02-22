var log_dir= './doc/test-results';

var pkg= require('../package.json');
var fs= require('fs');
if (!fs.existsSync(log_dir)){ fs.mkdirSync(log_dir); }

process.env.CHROME_BIN = require("puppeteer").executablePath();
//A: chrome headles
	
// Karma configuration
module.exports = function (config) {

// 	var libSources = require(__dirname + '/../build_conf/build.js').getFiles();

	var files = [
		"dist/"+pkg.name.toLowerCase()+"-src.js",
		"spec/after.js",
		"node_modules/happen/happen.js",
		"node_modules/prosthetic-hand/dist/prosthetic-hand.js",
		"spec/suites/**/*.test.js",
		//"dist/*.css",
		//{pattern: "dist/images/*.png", included: false, serve: true}
		{pattern: "spec_data/**/*", included: false, serve: true}
	];

	var preprocessors = {'dist/*.js': ['sourcemap']};
	if (config.cov) {
		preprocessors['dist/*.js'] = ['sourcemap','coverage'];
	}

	

	config.set({
		browserNoActivityTimeout: 60000, //U: cuanto esperar sin ningun mensaje, largo para preact inicializacion, etc.
		browserDisconnectTolerance: 2, //U: max reintentos en caso de desconexion
		browserConsoleLogOptions: { level: "log", path: log_dir+"/console.log", terminal: true},
		basePath: '../', //U: base path, that will be used to resolve files and exclude

		plugins: [
			'karma-sourcemap-loader',
			'karma-coverage',
			'karma-remap-coverage',

			'karma-nicer-reporter',
			'karma-htmlfile-reporter',
			'karma-mocha',
			'karma-sinon',
			'karma-expect',
			'karma-chrome-launcher',
			'karma-safari-launcher',
			'karma-firefox-launcher'],

		// frameworks to use
		frameworks: ['mocha', 'sinon', 'expect'],

		// list of files / patterns to load in the browser
		files: files,
		proxies: {
			'/base/dist/images/': 'dist/images/',
		},
		exclude: [],

		// Rollup the ES6 sources into just one file, before tests
		preprocessors: preprocessors,
		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: config.cov ? ['coverage','remap-coverage','nicer', 'html'] : ['nicer', 'html'],

		coverageReporter: config.cov ? {type : 'in-memory', dir : log_dir} : null,
		remapCoverageReporter: {
			'text-summary': null,
			html: log_dir+'/coverage',
			cobertura: log_dir+'/coverage/cobertura.xml'
		},

		htmlReporter: {
      outputFile: log_dir+'/tests_report.html',
            
      // Optional
      pageTitle: 'Karma '+pkg.name,
      subPageTitle: 'DESCRIPCION',
      groupSuites: true,
      useCompactStyle: true,
      useLegacyStyle: true,
      showOnlyFailed: false
    },

		// web server port
		port: 9876,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_WARN,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
browsers: ['ChromeHeadless'],

		customLaunchers: {
			'PhantomJSCustom': {
				base: 'PhantomJS',
				flags: ['--load-images=true'],
				options: {
					onCallback: function (data) {
						if (data.render) {
							page.render(data.render);
						}
					}
				}
			}
		},

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 5000,

		// Workaround for PhantomJS random DISCONNECTED error
		browserDisconnectTimeout: 10000, // default 2000
		browserDisconnectTolerance: 1, // default 0

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
};
