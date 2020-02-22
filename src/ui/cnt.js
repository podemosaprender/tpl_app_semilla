function cmp_cnt(my) {
	var cnt= 0;
	function inc() { cnt++; my.refresh(); }
	function dec() { cnt--; my.refresh(); }

	my.render= function() {
		return eGroup([ 
			eOut(cnt),
			eAct('+',inc),
			eAct('menos',dec,{cmp: 'a', style: { border: '2px dotted gray'}})
		]);
	}
}

function scr_home(my){ //U: pantalla principal cuando ya te logueaste
	my.render= function () { 
		return eGroup([
			'Hola PodemosAprender!',
			eAct('radio!', fAppGoTo('/radio')),
			e(Cmp.cnt), e(Cmp.cnt),
		]);
	}
}


