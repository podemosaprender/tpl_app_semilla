/**
* @file Generar un archivo con NOMBRE TIPO X0 Y0 X1 Y0 X2 Y2 ...
*/

var sprintf = require('sprintf-js').sprintf;

var POLYS= {};

const poly_Simple1= [0,0, 0,2, 2,2, 2,0];
POLYS.poly_Simple1= poly_Simple1;
const poly_Simple2= [0,0, 0,2, -2,-2, -2,0]; //Para revisar qué pasa si estan al lado
POLYS.poly_Simple2= poly_Simple2;
//El inicio de todos los poligonos siguientes arranca 10 corrido en la X del anterior
//const poly_Star= [];
//POLYS.poly_Star= poly_Star;
const poly_Rombo= [10,0, 9,1, 10,2, 11,1];
POLYS.poly_Rombo= poly_Rombo;
const poly_Romboide= [20,0, 21,2, 23,2, 22,0];
POLYS.poly_Romboide= poly_Romboide;
const poly_Feo= [30,0, 32,2, 31,2, 31,1, 30,1];
POLYS.poly_Feo= poly_Feo;
const poly_05= [40,0, 40,0.5, 40.5,0.5, 40.5,0];
POLYS.poly_05= poly_05;
const poly_vacio= [50,50];
POLYS.poly_vacio= poly_vacio;
const poly_U= [60,3, 60,1, 61,0, 62,1, 62,3];
POLYS.poly_U= poly_U;

for (var i in POLYS){
	var este= POLYS[i];
	var out= i+'\tTIPO\t';
	for (var t=0; t<este.length; t+= 2){
		out+= este[t]+','+este[t+1]+', ';
	}
	out= out.substring(0, out.length - 2); //Saca los ultimos dos caracteres
	console.log(out);
}
