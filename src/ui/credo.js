//INFO: conceptos para repasar en cada clase

function scr_credo(my) {
	my.render= function () {
		var t= [
			"Empezá por el efecto en la vida real (¿una venta?), qué pregunta respondés (¿la dirección dónde quiero ir?), lo que se ve (reportes, pantallas) ...",
			"Todo programa genera 'un texto': los bytes de todas las salidas por todas las pantallas y archivos pegados. Un programa ES 'un texto', con partes que cambian como esas cartas masivas pero que llegan con tu nombre. Un 'texto con partes cambiables', Batman por Cenicienta, Calabaza por Batimovil ... que genera un texto con partes cambiadas.",
			"Esa forma de generar una salida, cambiando algunas partes, la llamamos FUNCION. La salida es FUNCION de la entrada. Las cuotas son FUNCION del interes y el capital.",
			"Una funcion se puede definir con una TABLA: busco en las columnas de los parametros, y devuelvo la del valor ... como cuando busco mi DNI en el padrón electoral para saber en qué mesa voto, o tu nombre en la lista de contactos del teléfono para encontrar tu número",
			"Guardar datos es definir que valor tiene que devolver una función para determinados parametros, ej. que número de teléfono tiene que aparecer cuando busques mi nombre",
		];

		var tCmp= t.map( (s,i) => ({
				 "cmp": "Segment",
				 "textAlign": "left", "style": { "minHeight": "1em 0em"},
				 "vertical": true,
				 "children": [
						{ "cmp": "Header", "as": "h2", style: {fontSize: '2em'}, "content": i+":", },
						{ "cmp": "p", "children": [s], style: {fontSize: '1.6em'} }
				 ]
		}));

		return {"cmp": "div",
		 "children": [
				{
				 "cmp": "Segment",
				 "inverted": true,
				 "textAlign": "center", "style": { "minHeight": "1em 0em"},
				 "vertical": true,
				 "children": [
						{
						 "cmp": "Header", "as": "h1",
						 "content": "Credo",
						 "inverted": true,
						 "style": { "fontSize": "2em", "fontWeight": "normal", "marginBottom": "1.5em" },
						}
				 ]
				},
				... tCmp,	
			]
		}
	}
}


