/**
* @file Generar un archivo con NOMBRE X Y
* NOMBRE termina con _TIPO
*/

var sprintf = require('sprintf-js').sprintf;
var fs= require('fs');

const CANT_ELEM_PT= 10; //A: Cantidad de elementos por tipo
const TIPOS= ['ts', 'luz', 'post'];
for (var i in TIPOS){
	for (var t = 0; t < CANT_ELEM_PT; t++){
		console.log(sprintf('elem_%03d_'+TIPOS[i]+'\t%04d\t%04d', i*100+t*2, (i+1)*(1000), (i+2)*1000));
	}
}
