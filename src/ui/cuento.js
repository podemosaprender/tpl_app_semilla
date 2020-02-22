
function cuento(contexto) { return contexto.protagonista+" queria  "+contexto.meta+", aparecio "+contexto.ayudante+", y convirtio una calabaza en "+contexto.vehiculo; }


ContextosUrl= "http://192.168.10.104:8888/api/db/cuentos";
Contextos= null; //U: se cargan del servidor
function contextosLoad(quiereReload) {
	if (Contextos!= null && !quiereReload) return (new Promise(r=> r(Contextos))); //A: los cargo una sola vez
	return fetch(ContextosUrl)
		.then(res => res.json())
		.then(v => { 
			Contextos= {}; 
			v.forEach(e => {Contextos[e.nombre]= e}); 
			return Contextos 
		});
}

function cmp_menuCuentos(my) {
	my.componentWillMount= function () { 
		contextosLoad().then(() => my.refresh());
	}

	my.render= function () {
		return eMenu(['imagenes/logo.png','editar']
			.concat(Contextos==null ? [' cargando contextos ...'] : Object.keys(Contextos)));
	}
}

function scr_$contexto(my) {
	my.render= function (props) {
		var nombreContexto= props.matches.contexto;
		return h('div',{},
			cmp(Cmp.menuCuentos),		
			cmp({cmp: 'div', children: [ 'Te cuento un cuento:', cuento(Contextos[nombreContexto]) ]})
		);
	}	
}

function scr_cuento(my) {
	my.render= function () {
		return cmp({cmp: 'div', children: [ 'Te cuento un cuento:', cuento(Contextos.batman) ]});
	}	
}

function cmp_FormFacil(my) {
	var valores= {};

	function onInput(k,e) {
		valores[k]= e.target.value;	
	}

	my.render= function (props,state) {
		var camposContexto= props.campos
			.map( k => { return {cmp: 'Form.Input', fluid: true, label: k, onChange: (e) => onInput(k,e)} } );

		return h(Cmp.Container,{},
			cmp({cmp: 'Form', error: true, children: [
				{cmp: 'div', children: camposContexto},
				{cmp: 'Form.Button', txt: 'Guardar', onClick: () => props.onGuardar(valores)},
			]}
		));
	}
}

function eMenu(elements) {
	return h(Cmp.Menu,{stackable: true, style: {marginBottom: '15px'}},
		h(Cmp.Container,{},
			elements.map(t => h(Cmp.Menu.Item,{ onClick: ()=> appGoTo(t)}, t.match(/(.png|.jpg)$/) ? h('img',{src: t}) : t))
		)
	);
}

function scr_otroForm(my) {
	my.render= function () {
		return cmp({cmp: 'FormFacil', campos: ['Invente','Un form','Al vuelo'], onGuardar: alert});
	}
}

function scr_editar(my) {
	function onGuardar(valores) {
		Contextos[valores.contexto]= valores;
		my.refresh();
		FetchUrl("http://192.168.10.104:8888/api/db/cuentos",null,null,false,valores,"POST")
		.then(res => res.text())
		.then(msg => {
			contextosLoad(true).then(r => my.refresh()); //A: volver a cargar para actualizar menu
			alert("Datos guardados\n"+msg);
		})
	}

	my.render= function () {
		var nombreCampos= Object.keys(tCuentoContexto);
		return h('div',{},
			cmp(Cmp.menuCuentos),		
			cmp({cmp: 'FormFacil', campos: nombreCampos, onGuardar: onGuardar})
		);
	}
}

