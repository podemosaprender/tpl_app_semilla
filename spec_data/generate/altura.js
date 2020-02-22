/**
* @file Generar un archivo con CALLE ALTURAmin ALTURAmax X Y
*/

var sprintf = require('sprintf-js').sprintf;
var fs= require('fs');
const out_dir= './spec_data/data/ds_a/';

const CANT_CALLES= 100;
const ALTURA_FIN= 1000;
for (var i = 0; i < CANT_CALLES; i++){
	for (var t = 0; t < ALTURA_FIN; t+= 100){
		console.log(sprintf('Calle_%02d\t%03d\t%03d\t%04d\t%04d', i, t+1, t+100, i*(1000+t), i*(1100+t)));
	}
}


