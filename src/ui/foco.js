LAYOUT.BG_COLOR= '#FFFFF';
LAYOUT.ICONS.dinero_libre= 'money bill alternate outline';
LAYOUT.ICONS.tiempo_libre= 'clock outline';
LAYOUT.ICONS.gasto_no_previsto= 'trash alternate';
LAYOUT.ICONS.planear= 'sitemap';
LAYOUT.ICONS.registrar_entrada= 'sign in';
LAYOUT.ICONS.registrar_salida= 'sign out';

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
				{cmp: 'headerYacciones', acciones: AccionesX, onClick: props.onClick },

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

function scr_foco(my) {

	var onClick= (k => console.log("Accion",k));

	my.render= function () {
		var rDinero= situacionIconos(LAYOUT.ICONS.dinero_libre);
		var rTiempo= situacionIconos(LAYOUT.ICONS.tiempo_libre);

		return {cmp: 'Container', children: [
			{cmp: 'situacion', titulo: 'Mi Dinero', onClick: onClick, iconos: rDinero, },
			{cmp: 'situacion', titulo: 'Mi Tiempo', onClick: onClick, iconos: rTiempo, propuestos: ['dormir','javascript','correr']},
		] };
	}
}
