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

function cmp_InputMonto(my) {
	my.render= function (props) {
		return [ 
			{cmp: 'Form.Input', fluid: true, placeholder:'¿Cuánto?', onChange: props.onChange, value: props.value },
			{cmp: 'div', style: {textAlign: 'center'}, children:
				['x',100,500,'1k','5k','10k'].map( e => (
					{cmp: 'Button', compact: true, size: 'small', onClick: () => props.onChange(set_p({},'{target{value',e)) , children: e }
			))},
		];
	}
}

function cmp_InputRubro(my) {
	my.render= function (props) {
		return {
			cmp: 'div', 
			style: {marginTop: '10px', marginBottom: '5px', textAlign: 'center'}, 
			children: [
				{cmp: 'Button', compact: true, icon: LAYOUT.ICONS.todo_mal, onClick: () => props.onChange('X') },
				Object.entries(Data.gastos).map( e => (
					{cmp: 'Button', compact: true, icon: e[1].icon, onClick: () => props.onChange(e[0]) }
				)),
			]
		}	
	}
}

function cmp_situacion(my) {
	my.render= function (props) {
		return { cmp: 'Segment', basic: true, style: {paddingTop: '10px', paddingBottom: 0},children: [
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

function scr_gasto(my) {
	function montoAnumero(v, actual) { 
		var c= parseInt( actual || 0 );
		if (v=='x') { c=0; }
		else { c+= parseInt((v+'').replace(/k/,'000'))}
		return c;	
	}

	my.setQue= (k) => { 
		my.setState({que: k}); //TODO: filtrar la lista de items
	}

	my.render= function (props, state) {
		props.onClick= props.onClick || fAppGoTo('/');

		return {cmp: 'Segment', basic: true, style: {paddingTop: '10px', paddingBottom: 0},children: [
				{cmp: 'headerYacciones', titulo: 'Registrar Gasto', acciones: {volver: LAYOUT.ICONS.go_back}, onClick: props.onClick },

				{cmp: 'Form', error: true, children: [
					my.forValue('cuanto',{cmp: 'InputMonto'}, montoAnumero ),
					my.forValue('rubro', {cmp: 'InputRubro'}),

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

function scr_planear(my) {
	my.setCuanto= (k) => { 
		var c= parseInt( my.state.cuanto || 0 );
		if (k=='x') { c=0; }
		else { c+= parseInt((k+'').replace(/k/,'000'))}
		console.log("setCuanto",k);
		my.setState({cuanto: c});
	}

	var initialState = { isLoading: false, results: [], value: '' }
	var source= "prueba maravilla cosa_rara pavada".split(' ').map(x => ({title: 'Esto es una '+x}));
	function handleResultSelect(e,cmp) {
		my.setState({value: cmp.result.title});
	}

	function handleSearchChange(e) {
		var v= e.target.value; console.log(v);
		my.setState({isLoading: true, value: v});

		setTimeout(() => {
      if (my.state.value.length < 1) return my.setState(initialState)
			v= v.toLowerCase();
      var isMatch = e => (e.title.toLowerCase().indexOf(v)>-1)

      my.setState({
        isLoading: false,
        results: source.filter(isMatch),
      })
    }, 300);
	}

	my.render= function (props, state) {
		props.onClick= props.onClick || fAppGoTo('/');

		var hdr= {cmp: 'headerYacciones', titulo: 'Planear', acciones: {volver: LAYOUT.ICONS.go_back}, onClick: props.onClick};

		var preguntas= fold({
			rubro: {cmp: 'InputRubro'},
			que: {dsc: '¿Qué?'},
			cuando: {dsc: '¿Cuándo?'},
			horas: {dsc: '¿Cuántas horas?'},
			dinero: {dsc: '¿Cuánto dinero?', cmp: 'InputMonto'},
			}, 
			(v,k,acc) => put(my.forValue(k, v.cmp ? v : {fluid: true, placeholder: v.dsc}), acc)
		);


		var search= { cmp: 'Search',
				loading: state.isLoading,
        onResultSelect: handleResultSelect,
        onSearchChange: handleSearchChange,
        results: state.results,
        value: state.value,
		};

		var para= [
						{cmp: 'Form.Input', fluid: true, placeholder:'¿Para?', onChange: ev => my.setQue(ev.target.value), value: state.que },
			{cmp: 'List', divided: true, selection: true, children: 
					['<agregar>','previsto uno','previsto dos','zapatos','repollo'].map(k => (
						{cmp: 'List.Item', children: [
							k + (state.rubro ? ' de '+state.rubro : ''),
						]}
					))	
			},
		];

		return {cmp: 'Segment', basic: true, style: {paddingTop: '10px', paddingBottom: 0}, children: [
			hdr,
			{cmp: 'Form', error: true, children: [
				search,

				preguntas,
				para,

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

				]
			},
		]};	
	}
}


function scr_foco(my) {

	var onClick= (k => {
		console.log("Accion",k);
		if (k=='registrar_salida') { appGoTo('gasto'); }
		else if (k=='planear') { appGoTo('planear'); }
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
