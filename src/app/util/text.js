/**
	@file Funciones útiles para texto / arrays de bytes

	@module util/text
*/

/**
	La tradicional [sprintf](https://www.npmjs.com/package/sprintf-js)
	@function
*/

/**
	Convierte un array buffer codificado en utf-8 en string (sólo para browser)

	ej. el que devuelve la librería de zips

	@param buf {ArrayBuffer}
*/
function toString_arrayBuffer(buf) {
	var te= new TextDecoder('utf-8');
  return te.decode(buf);
}


