await loadJs('cnt.js');

function scr_hola(my) {
	my.render= function () {
		return h('h3',{},'Hola');
	}
}

Routes["/"]= {cmp: "scr_hola"};
