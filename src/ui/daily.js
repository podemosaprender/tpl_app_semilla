GhUser= null;
GhPass= null;
GhOpts= null;
GhWeb= null;

GhRepos= null;
function onLogin() {
	console.log("Pidio login", GhUser, "*****");
	GhOpts= {user: GhUser, pass: GhPass};
	return keys_file_github_p('',GhOpts)
		.then(res => { GhRepos= res} );
}

function onUser(e) {
	GhUser= e.target.value;
}

function onPass(e) {
	GhPass= e.target.value;
}

function onFork() {
	fork_github_p('podemosaprender/xprueba', GhOpts).then(fLog("fork listo"))
	.then(() => webEnable_github_p(GhUser+'/xprueba',GhOpts))
	.then( res => { GhWeb= res.html_url } )
	.then(fLog("Web Publish listo "+GhWeb));
}

function onWrite() {
	var fname= GhUser+"/xprueba/hola2.txt";
	get_file_github_p(fname, GhOpts).then(x=> (dd=x)).then(fLog("lei"))
	.then(() => {
		set_file_github_p({fname: fname, sha: dd.sha}, "somos re grossos "+(new Date()), GhOpts).then(fLog("guarde!"))
	});
	//A: tengo que leer para coseguir el sha y poder escribir, si no existia no hay problema
}

function scr_daily(my) {
	function uiOnLogin() {
		onLogin().then(x => my.refresh());
	}

	my.render= function (props,state) {
		return {cmp: 'Container', children: [
				{cmp: 'Form', error: true, children: [
					{cmp: 'Form.Group', widths:'equal', children: [
						{cmp: 'Form.Input', fluid: true, label:'Github User', placeholder:'username', onChange: e => onUser(e) },
						{cmp: 'Form.Input', type:'password',fluid: true, label:'Github Pass', placeholder:'pass', onChange: e => onPass(e) },
					]},
					{cmp: 'Form.Button', txt: 'Login', onClick: uiOnLogin},
					{cmp: 'Form.Button', txt: 'Fork', onClick: onFork},
					{cmp: 'Form.Button', txt: 'Write', onClick: onWrite},

				]},
				GhWeb==null ? 'Todavia no hay web' : {cmp: 'a', href: GhWeb},

			 	GhRepos==null ? 'Todavia no cargue los repos' : {cmp: 'ul', children: GhRepos.map( d => ({cmp:'li', children: [ d.name ]})) }
			]};
	}
}
