function scr_mainvacio(my) {
	my.render= function () {
		return eGroup([
			h('h1',{},'Podemos Aprender'),	
			h('img',{src:'imagenes/logo.png'}),
		]);
	};
}
