/**
* @file Generar archivos para zipear y probar la velocidad de lectura
* Los archivos tienen el patrón X/Y/TIPO/NOMBRE (que es una letra)
* Y adentro tienen escrito la ubicación
*/

var sprintf = require('sprintf-js').sprintf;
var fs= require('fs');

const CANT_X= 40;
const CANT_Y= 40;
const TIPOS= ['geo', 'block', 'area', 'e'];
const nombres= 'abcdefghijklmnopqrstuvwxyz'.split('');

var out_dir= (process.env.OUTDIR||'../data/x_ds_test_zip');
function existe_o_crear(dir){
	if(!fs.existsSync(out_dir+'/'+dir)){
		fs.mkdirSync(out_dir+'/'+dir, {recursive: true});
	}
}
existe_o_crear(''); //Crea el directorio x_zip

for (var x = 0; x<CANT_X; x++){
	var	esta_x= sprintf('%04d', x);
	existe_o_crear(esta_x);
	for (var y= 0; y<CANT_Y; y++){
		var esta_y= sprintf('%04d', y)
		existe_o_crear(esta_x+'/'+esta_y);
		for (var t of TIPOS){
			existe_o_crear(esta_x+'/'+esta_y+'/'+t);
			for (var n of nombres){
				var n_este= esta_x+'/'+esta_y+'/'+t+'/'+n; 
				fs.writeFileSync(out_dir+'/'+n_este, n_este);
			}
		}
	}
}
