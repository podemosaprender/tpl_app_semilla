SinAcentosIn= "áéíóúüñÁÉÍÓÚÜÑ";
SinAcentosOut= "aeiouu~AEIOUU~";

function sinAcentos(s) { //U: devuelve s pero con los caracteres sin tildes, etc.
	return s.replace(
		new RegExp('(['+SinAcentosIn+'])','g'), 
		(_,c) => SinAcentosOut[SinAcentosIn.indexOf(c)] 
	);
}

function refreshWith(my,fun, ... args) { //U: devuelve una funcion para onClick y hacer refresh despues
	return function () {
		fun.apply(null,args);
		my.refresh();
	};
}

//------------------------------------------------------------
//S: api de cartas
Cartas= null; //U: mazo -> [carta*]
CartaUltima= null;
CartasHistoria= [];
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
}

function cartasTraer(quiereReload) {
	if (Cartas && ! quiereReload)  { //A: si ya teniamos, ya esta
		return new Promise( r=> r(Cartas) ); 
	} 

	function valoresLinea(s, dflt) {
		return s.split(/\t/).map( (s, idx) => s.trim() || (dflt && (dflt+'_'+idx)));
	}

	Cartas= null; //A: limpiamos
	return mifetch("http://www.podemosaprender.org/cartas-catz/cartas.txt",null,{asText: 1,corsProxy: 1})
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

function uiCarta(carta) { //U: para la lista de programas, una tarjeta en vez de solo boton
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

function scr_catzas(my) {
	my.render= function () {
		var contenido= 'Cargando cartas'; //dflt
		if (Cartas==null) { cartasTraer().then( _ => my.refresh()) }
		else { 
			var mazos= Object.keys(Cartas);
			
			contenido= [
				mazos.map( m => (
					{cmp: 'Button', children: Cartas[m].dsc, onClick: refreshWith(my,cartaProxima,m) } 
				)),
				{cmp: 'Button', children: 'Limpiar', onClick: refreshWith(my,cartasLimpiar) },
				CartasHistoria.map(uiCarta)
			];
		}

		return [
			{cmp: 'Header', children: 'Catzas'},
			contenido,
		];
	}
}
