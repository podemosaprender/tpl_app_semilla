LAYOUT.BG_COLOR= '#FFFFF';
LAYOUT.ICONS.dinero_libre= 'money bill alternate outline';
LAYOUT.ICONS.tiempo_libre= 'clock outline';
LAYOUT.ICONS.gasto_no_previsto= 'trash alternate';
LAYOUT.ICONS.planear= 'sitemap';
LAYOUT.ICONS.registrar_entrada= 'sign in';
LAYOUT.ICONS.registrar_salida= 'sign out';
LAYOUT.ICONS.go_back= 'window close outline';
LAYOUT.ICONS.todo_mal= 'bomb';

Data= { //PLAN:
	gastos: {
		salud: {
			icon: 'heartbeat',
			amt: [10,7],
		},
		casa: {
			icon: 'home',
			amt: [20,10],
		},
		comida: {
			icon: 'food',
			amt: [5,2],
		},
		educacion: {
			icon: 'book',
			amt: [7,3],
		}
	}
}
		
function situacionIconos(iconLibre) {
	var r= [];
	for (var i=0; i<7; i++) {
		r.push({cmp: 'Icon', name: LAYOUT.ICONS.gasto_no_previsto, style: { color: 'red'}}) 
	}

	Object.keys(Data.gastos).forEach( k => { var g= Data.gastos[k];
		for (var i=0; i<g.amt[0]; i++) { 
			r.push({cmp: 'Icon', name: g.icon, tooltip: 'pepe', style: { color: i<g.amt[1] ? null : 'orange'}}) 
		}
	})

	for (var i=0; i<7; i++) {
		r.push({cmp: 'Icon', name: iconLibre, style: { color: 'green'}}) 
	}
	return r;
}

AccionesX= {
	planear: LAYOUT.ICONS.planear,
	registrar_entrada: LAYOUT.ICONS.registrar_entrada,
	registrar_salida: LAYOUT.ICONS.registrar_salida,
}

function cmp_headerYacciones(my) {
	my.render= function (props) {
		return {
			cmp: 'Header', style: {minHeight: '3em', verticalAlign: 'bottom', },dividing: true, children: [
					{cmp: 'Button.Group', floated: 'right', 
						children: Object.entries(props.acciones).map( e => (
							{cmp: 'Button', icon: e[1], onClick: () => props.onClick(e[0]) }
						))
					},
					{cmp: 'div', style: {paddingTop: '1em'}, children: props.titulo},
		]}
	}
}

function cmp_situacion(my) {
	my.render= function (props) {
		return {cmp: 'Segment', basic: true, style: {paddingTop: '10px', paddingBottom: 0},children: [
				{cmp: 'headerYacciones', titulo: props.titulo, acciones: AccionesX, onClick: props.onClick },

				props.propuestos 
					? {cmp: 'List', divided: true, selection: true, children: 
							props.propuestos.map(k => (
								{cmp: 'List.Item', children: [
									{cmp: 'Label', color: 'yellow', horizontal: true, children: '1h'},
									k,
								]}
							))	
						}
					: null,

				{cmp: 'div', children: props.iconos },
		]}
	}
}

function fRef(to,k) {
	return function (e) { to[k]= e; xe= e;}
}

function scr_gasto(my) {
	my.setCuanto= (k) => { 
		var c= parseInt( my.state.cuanto || 0 );
		if (k=='x') { c=0; }
		else { c+= parseInt((k+'').replace(/k/,'000'))}
		console.log("setCuanto",k);
		my.setState({cuanto: c});
	}

	my.setRubro= (k) => {
		console.log("SetRubro",k);
		my.setState({rubro: k});
	}

	my.setQue= (k) => { 
		my.setState({que: k}); //TODO: filtrar la lista de items
	}

	my.render= function (props, state) {
		props.onClick= props.onClick || fAppGoTo('/');

		return {cmp: 'Segment', basic: true, style: {paddingTop: '10px', paddingBottom: 0},children: [
				{cmp: 'headerYacciones', titulo: 'Registrar Gasto', acciones: {volver: LAYOUT.ICONS.go_back}, onClick: props.onClick },

				{cmp: 'Form', error: true, children: [
					{cmp: 'Form.Input', fluid: true, placeholder:'¿Cuánto?', onChange: ev => my.setCuanto(ev.target.value), value: state.cuanto },

					{cmp: 'div', style: {textAlign: 'center'}, children:
					['x',100,500,'1k','5k','10k'].map( e => (
							{cmp: 'Button', compact: true, size: 'small', onClick: () => my.setCuanto(e), children: e }
					))},

					{cmp: 'div', style: {marginTop: '10px', marginBottom: '5px', textAlign: 'center'}, children:

					[{cmp: 'Button', compact: true, icon: LAYOUT.ICONS.todo_mal, onClick: () => my.setRubro('X') }]
					.concat(	Object.entries(Data.gastos).map( e => (
							{cmp: 'Button', compact: true, icon: e[1].icon, onClick: () => my.setRubro(e[0]) }
					)))},

					{cmp: 'Form.Input', fluid: true, placeholder:'¿Qué?', onChange: ev => my.setQue(ev.target.value), value: state.que },

					{cmp: 'List', divided: true, selection: true, children: 
							['<agregar>','previsto uno','previsto dos','zapatos','repollo'].map(k => (
								{cmp: 'List.Item', children: [
									k + (state.rubro ? ' de '+state.rubro : ''),
								]}
							))	
					},

					state.tieneError 
					?  {cmp: 'Message', 
								error: true, 
								header:'error tal y tal',
								content: 'el error es que ...',
							}
					: null ,

					{cmp: 'div', style: { textAlign: 'right', marginTop: '10px', }, children:
						{cmp: 'Form.Button',txt: 'guardar'},
					}
				]},
		]}	
	}
}

function scr_foco(my) {

	var onClick= (k => {
		console.log("Accion",k);
		if (k=='registrar_salida') { appGoTo('gasto'); }
	});

	my.render= function () {
		var rDinero= situacionIconos(LAYOUT.ICONS.dinero_libre);
		var rTiempo= situacionIconos(LAYOUT.ICONS.tiempo_libre);

		return {cmp: 'Container', children: [
			{cmp: 'situacion', titulo: 'Mi Dinero', onClick: onClick, iconos: rDinero, },
			{cmp: 'situacion', titulo: 'Mi Tiempo', onClick: onClick, iconos: rTiempo, propuestos: ['dormir','javascript','correr']},
		] };
	}
}
