LAYOUT.BG_COLOR= '#FFFFF';

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
		

function scr_foco(my) {
	my.render= function () {
		var r= [];
		for (var i=0; i<7; i++) {
			r.push({cmp: 'Icon', name: 'bomb', style: { color: 'red'}}) 
		}

		Object.keys(Data.gastos).forEach( k => { var g= Data.gastos[k];
			for (var i=0; i<g.amt[0]; i++) { 
				r.push({cmp: 'Icon', name: g.icon, tooltip: 'pepe', style: { color: i<g.amt[1] ? null : 'orange'}}) 
			}
		})

		for (var i=0; i<7; i++) {
			r.push({cmp: 'Icon', name: 'money bill alternate outline', style: { color: 'green'}}) 
		}

		var rTiempo= [];
		for (var i=0; i<7; i++) {
			rTiempo.push({cmp: 'Icon', name: 'bomb', style: { color: 'red'}}) 
		}

		Object.keys(Data.gastos).forEach( k => { var g= Data.gastos[k];
			for (var i=0; i<g.amt[0]; i++) { 
				rTiempo.push({cmp: 'Icon', name: g.icon, tooltip: 'pepe', style: { color: i<g.amt[1] ? null : 'orange'}}) 
			}
		})

		for (var i=0; i<7; i++) {
			rTiempo.push({cmp: 'Icon', name: 'clock outline', style: { color: 'green'}}) 
		}


		return {cmp: 'Container', children: [
			{cmp: 'Segment', basic: true, style: {paddingTop: '10px', paddingBottom: 0},children: [
				{cmp: 'Header', style: {minHeight: '3em', verticalAlign: 'bottom', },dividing: true, children: [
					{cmp: 'Button.Group', floated: 'right', children: [
						{cmp: 'Button', icon: {name: 'sitemap'}},' ',
						{cmp: 'Button', icon: {name: 'sign in'}},' ',
						{cmp: 'Button', icon: {name: 'sign out'}},' ',
					]},
					{cmp: 'div', style: {paddingTop: '1em'}, children: 'Dinero'},
				]},
				{cmp: 'div', children: r },
			]},

			{cmp: 'Segment', basic: true,style: {paddingTop: '10px', paddingBottom: 0}, children: [
				{cmp: 'Header', style: {minHeight: '3em', verticalAlign: 'bottom', },dividing: true, children: [
					{cmp: 'Button.Group', floated: 'right', children: [
						{cmp: 'Button', icon: {name: 'sitemap'}},
						{cmp: 'Button', icon: {name: 'sign in'}},
						{cmp: 'Button', icon: {name: 'sign out'}},
					]},
					{cmp: 'div', style: {paddingTop: '1em'}, children: 'Tiempo'},
				]},	
				{cmp: 'List', divided: true, selection: true, children: 
					['dormir','javascript','correr'].map(k => (
						{cmp: 'List.Item', children: [
							{cmp: 'Label', color: 'yellow', horizontal: true, children: '1h'},
							k,
						]}
					))	
				},
				{cmp: 'div', children: rTiempo },
			]},
		] };
	}
}
