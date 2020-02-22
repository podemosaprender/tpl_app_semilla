// Config file for running Rollup in "watch" mode
// This adds a sanity check to help ourselves to run 'rollup -w' as needed.

import rollupGitVersion from 'rollup-plugin-git-version'
import gitRev from 'git-rev-sync'

const branch = gitRev.branch();
const rev = gitRev.short();
const pkg= require('../package.json');
const version = pkg.version + '+' + branch + '.' + rev;
const ME= pkg.name;
const banner = `/* XXX:Banner */
`;

export default {
	input: 'src/'+ME+'.js',
	output: {
		file: 'dist/'+ME.toLowerCase()+'-src.js',
		format: 'umd',
		name: ME,
		banner: banner,
		sourcemap: true
	},
	legacy: true, // Needed to create files loadable by IE8
	plugins: [
		rollupGitVersion()
	]
};
