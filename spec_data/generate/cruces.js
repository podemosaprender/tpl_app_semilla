/**
* @file Generar datos de prueba para cruces
* Hay que generar unas 1000 lineas con CalleA, CalleB, X, Y
* Para testear facil:
*     * Todas las CalleA empiezan con "CalleA_"
*     * Sigue un numero de la cantidad de veces que aparecen, ej: "CalleA_003" aparece 3 veces
*     * CalleB la usamos para rellenar los cruces tipo "CalleA_003" con "CalleB_X_1" y los otros dos
*     * X=1000+numero de CalleA ; Y=2000+numero de CalleB
*
* Asi se puede probar:
*     * Cambiar el orden de los parametros
*     * Saber si encontramos todas las N entradas para un nombre
*     * Saber si el X,Y son correctos
*
* Ademas agregamos CalleFalla con "casos molestos":
*     * Falta nombre de una calle
*     * Falta X o Y, o no son numeros
*/
//U: !node % | wc

var sprintf = require('sprintf-js').sprintf;

Cnt= 1000; //U: Cuantas calles generar
l= ((-1+(1+8*Cnt)**0.5)/2)+1;
console.log("L", l);
for (var i = 0; i < l; i++){
	for (var j = 1; j <= i; j++){
		console.log(sprintf('CalleA_%03d\tCalleB_X_%03d\t%d\t%d', i, j, 1000+i, 2000+j));
	}
}
