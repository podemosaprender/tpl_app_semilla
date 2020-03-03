//INFO: convertir ejemplos React a nuestro formato

function scr_preact(my) {
	var src= '';
	var nuestro_src='';

	function set_src(e) { src= e.target.value; }; //U: recibir onChange y guardar el valor

	function onConvertir() {
		window.src= src;
		nuestro_src= '//convertido\n'+ser_json( xmlToPaPreact(src), 1);	
		my.refresh();
	}

	my.render= function preact_render() {
		return {cmp: 'Form', children: [
			{cmp: 'TextArea', onChange: set_src, placeholder: 'ejemplo de react tipo html'},
			{cmp: 'Button', onClick: onConvertir, txt: 'Convertir'},
			{cmp: 'TextArea', value: nuestro_src},
		]};
	}
}


