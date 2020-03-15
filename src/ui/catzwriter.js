document.title='CatzWriter';

function refreshWith(my,fun, ... args) { //U: devuelve una funcion para onClick y hacer refresh despues
	return function () {
		fun.apply(null,args);
		my.refresh();
	};
}

function repoFork() {
	return (fork_github_p('podemosaprender/CatzWriterData', GhOpts).then(fLog("fork listo"))
	.then(() => webEnable_github_p(GhOpts.user+'/CatzWriterData',GhOpts))
	.then( res => { GhWeb= res.html_url } )
	.then( res => { fLog("Web Publish listo "+GhWeb)(res); return res }));
}

async function repoWrite(titulo) {
	var fname= GhOpts.user+'/CatzWriterData/'+titulo+'.txt';
	var sha= null; //DFLT, archivo nuevo

	var f1= await get_file_github_p(fname, GhOpts);
	logm("DBG",1,"repoWrite get previous",f1);
	if (f1.sha) { sha= f1.sha; }
	else {
		var fl= await keys_file_github_p(GhOpts.user+'/CatzWriterData',GhOpts);
		logm("DBG",1,"repoWrite get keys",fl);
		if (! Array.isArray(fl) && fl.message=='Not Found') { //A: no existe el repo
			await repoFork();
		}
	}

	set_p(Historia,'{state{text[0','dflt',true); //A: si no estaba, poner un dummy	
	var data= []; for (var i=0; i<CartasHistoria.length; i++) {
		data.push(CartasHistoria[i]);
		data.push(Historia.state.text[i]);
	}

	return set_file_github_p({fname: fname, sha: sha}, ser_json(data,1), GhOpts).then(fLog("guarde!"))
	//A: tengo que leer para coseguir el sha y poder escribir, si no existia no hay problema
}

//------------------------------------------------------------
//S: api de cartas
Cartas= null; //U: mazo -> [carta*]
CartaUltima= null;
CartasHistoria= [];
Historia= {text: []};

function cartaProxima(mazo) {
	//Mock: CartaUltima= "Carta "+mazo+" "+timestamp();
	var m= Cartas[mazo];
	var idx= Math.floor(Math.random()*m.cnt); //A: un numero entre 0 y cantidad
	for (var i=0; i<m.cartas.length; i++) { var carta= m.cartas[i];
		idx= idx - parseInt(carta.cantidad); //A: me gasto para esta carta
		if (idx<=0) { CartaUltima= carta; break } //A: encontre, termine
	}
	CartasHistoria.push(CartaUltima);
	return CartaUltima;
}

function cartasLimpiar() {
	CartasHistoria= [];
	Historia= {};
}

function cartasTraer(quiereReload) {
	if (Cartas && ! quiereReload)  { //A: si ya teniamos, ya esta
		return new Promise( r=> r(Cartas) ); 
	} 

	function valoresLinea(s, dflt) {
		return s.split(/\t/).map( (s, idx) => s.trim() || (dflt && (dflt+'_'+idx)));
	}

	Cartas= null; //A: limpiamos
	return mifetch("http://www.podemosaprender.org/cartas-catz/cartas.txt",null,{asText: 1,corsProxy: 1, headers: {Origin: '*'}})
	.then(txt => {
		Cartas= {};
		var lineas= txt.split(/\r?\n/);
		var titulos= valoresLinea( lineas[0], 'c' ).map( sinAcentos ); //A: titulos, sin espacios, cols vacias a c_1
		lineas.slice(1).forEach( l => {
			var v= valoresLinea(l); //A: valores, sin espacios
			if (v.filter(s => s!=null).length==0) return ; //A: linea vacia, no seguimos

			var kv= {}; titulos.forEach( (t,idx) => { kv[t]= v[idx] } );
			var mazo= kv.mazo || 'dflt'
			var mazoK= mazo.replace(/[^a-z0-9_]/g,'_');
			Cartas[mazoK]= Cartas[mazoK] || {cartas: [], cnt: 0, dsc: mazo};
			Cartas[mazoK].cartas.push(kv); 
			Cartas[mazoK].cnt+= parseInt(kv.cantidad);
		});	
		return Cartas;
	})
}

//------------------------------------------------------------
//S: dibujar las cartas

function uiCarta(carta) { //U: formato tarjeta
	//SEE: https://react.semantic-ui.com/views/card/#types-groups
	return {cmp: 'Card', children: 
		{cmp: 'Card.Content', children: [
			{cmp: 'Image', floated:'right',size:'mini',src:'img/logo.png'},
			{cmp: 'Card.Header', children: [
				carta.titulo,
				{cmp: 'p', style: {fontSize: '50%', color: 'gray'}, children: '('+carta.numero+')'},
			]},
			{cmp: 'Card.Description', children: carta.descripcion},
		]},
	};
}

function uiCartaYarea(carta) { //U: tarjeta y textArea
	return {cmp: 'Grid.Row', children: [
		{cmp: 'Grid.Column', children: uiCarta(carta)},
		{cmp: 'Grid.Column', children: {cmp: 'TextArea', minHeight: 200}}
	]};
}

function uiConsignaYarea(my, idx, carta) { //U: tarjeta y textArea
	return {cmp: 'Container', style: {marginTop: '10px'}, children: [
		{cmp: 'Container', text: true, children:
			{cmp: 'Header', as: 'h3', textAlign: 'left', children: [
				carta.titulo+' '+carta.numero,
				{cmp: 'Header.Subheader', children: carta.descripcion },
			]},
		},
		{cmp: 'TextArea', rows: 10, style: {minWidth: '100%'}, ... my.withValue('text['+idx, null, Historia)}
	]};
}

function scr_catzas(my) {
	var necesitaUsrGit= false;
	async function guardarGit(queQuiere) {
		console.log("guardarGit", queQuiere, necesitaUsrGit, my.state);
		if (queQuiere==null) {
			necesitaUsrGit= true;
		}
		else if (queQuiere=='guardar') {
			GhOpts= {user: my.state.user, pass: my.state.pass};
			var r= await repoWrite(my.state.titulo);
			if (r.commit!=null) {
				alert("Guardado");
				necesitaUsrGit= false;
			}
			else {
				alert("Error guardando");
			}
			my.refresh();
		}
		else if (queQuiere=='cancelar') { 
			necesitaUsrGit= false; 
		}
	}

	my.render= function () {
		if (Cartas==null) { cartasTraer().then( _ => my.refresh()) }
		else { 
			var mazos= Object.keys(Cartas);
			var botones= 	{cmp: 'Container', textAlign: 'center', children: [
				mazos.map( m => (
					{cmp: 'Button', size: 'small', children: Cartas[m].dsc, onClick: refreshWith(my,cartaProxima,m) } 
				)),
				{cmp: 'Button', size: 'small', children: 'Limpiar', onClick: refreshWith(my,cartasLimpiar) },
				{cmp: 'Button', size: 'small', children: 'Guardar', onClick: refreshWith(my,guardarGit) },
			]};

			var cartasYmazos= [
				CartasHistoria.map( (carta,idx) => uiConsignaYarea(my,idx,carta) ),
				botones,
			];
		}

		setTimeout( () => window.scrollTo(0,document.body.scrollHeight), 100);

		return [
			{cmp: 'Menu', 
				children: {cmp: 'Container', textAlign: 'center', children: 'CatzWriter'}
			},
			
			[
				{cmp: 'Dimmer', active: Cartas==null, children: {cmp: 'Loader', children: 'Cargando cartas ...'} },
				cartasYmazos,
			],

			!necesitaUsrGit ? null : {cmp: 'Segment', inverted: true, children:
				{cmp: 'Form', inverted: true, size: 'tiny', children: [
					{cmp: 'Form.Group', children: [
						my.forValue('user',{width: 2, label: 'Github User'}),
						my.forValue('pass',{ type: 'password', width: 2, label: 'Pass'}),
						my.forValue('titulo',{width: 8, label: 'Título'}),
					]},
					{cmp: 'Container', textAlign: 'right', style: {marginTop: '10px'}, children: [
						{cmp: 'Button', onClick: refreshWith(my,guardarGit,'cancelar'), children: 'Cancelar'},
						{cmp: 'Button', onClick: refreshWith(my,guardarGit,'guardar'), children: 'Guardar'},
					]},
				]}
			},
		];

	}
}
