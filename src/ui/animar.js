cell_style= { width: '5px', height: '5px', margin: '1px', background: 'gray', display: 'inline-block' };
cell_style_1= { ... cell_style, background: 'red' };

var cnt= 0;
var t0= Date.now();
var tp= t0+1000;
var frame= 0;

var wantsStop= false;

function scr_animar(my) {
	var tick;
	function onStart() {
		tick= setInterval(() => { cnt++; my.refresh() }, 50);
	}

	function onStop() { clearInterval(tick); }

	my.render= function () {
		frame++; if (Date.now()>tp) {dt= Date.now()-t0; console.log(frame, dt, frame/dt*1000); tp= Date.now()+1000; }
		var cmp= [];
		for (var r=0; r<50; r++) {
			var ccmp= [];
			for (var c=0; c<50; c++) {
				ccmp.push({cmp: 'div', style: r*50+c<cnt ? cell_style_1 : cell_style});
			}
			cmp.push({cmp: 'div', style: {lineHeight: 0}, children: ccmp});
		}

		return {cmp: 'Container', children: [
			{cmp: 'Segment', children: [
				{cmp: 'Button', children: 'Start', onClick: onStart},
				{cmp: 'Button', children: 'Stop', onClick: onStop}
			]},
			{cmp: 'Container', textAlign: 'center', children: cmp},
		]};
	}
}
