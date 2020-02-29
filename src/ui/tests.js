//INFO: como definir y ejecutar tests

function scr_main(my) { //U: una pantalla con boton que ejecuta los tests que haya definidos
	my.render= function probar_main() {
		return {cmp: 'Button', onClick: run_tests_p, txt: 'Probar'};
	}	
}

//------------------------------------------------------------
//S: la funcion/libreria que quiero implementar

Numeros="cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve".split(' ');

function numeroEnPalabras(n) {
	var r='NO_SE';
	if (n<Numeros.length) { r= Numeros[n]; }
	return r;
}

//------------------------------------------------------------
//S: la especificacion de que tiene que hacer
Test['NumeroEnPalabras: "uno" para 1']= function () { expect(numeroEnPalabras(1)).to.be('uno'); }
//A: defini un caso para NumeroEnPalabras

Numeros.forEach( (txt,i) => {
	Test['NumeroEnPalabras: "'+txt+'" para '+i]= function () { expect(numeroEnPalabras(i)).to.be(txt); }
});
//A: puedo generar casos a partir de una lista de datos (con cuidado de no esconder errores)


