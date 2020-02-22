/**
	@file Caches con distintas políticas (ej. recien usados)
  @module util/cache
*/

//XXX:Convertir a objetos ortodoxos o reemplazar por algun modulo de lru

//S: algoritmos / cache / ultimoUso
function limpiar_cache_recienUsados(cache) {
	var claves= Object.keys(cache.elementoYuso)
	var elementosAntesCnt= claves.length;
	var cuantosHayQueBorrar= elementosAntesCnt - cache.cntMax;
	if (cuantosHayQueBorrar>0 || (cache.szMax && cache.szUsada>cache.szMax)) {
		claves= clavesOrdenadasPorPropiedadNumerica(cache.elementoYuso,"cuandoUso");
		for (var i=0; (i<cuantosHayQueBorrar || (cache.szMax && cache.szUsada>cache.szMax)) && i<claves.length; i++) {
			var k= claves[i]
			var e= cache.elementoYuso[k];
			if (e) { cache.szUsada-= e.sz; }
			delete(cache.elementoYuso[k]);
		}
	}
	logm("DBG",8,"CACHE LIMPIAR",{ cnt: claves.length, cntMax: cache.cntMax, borrados: i>0 ? claves.slice(0,i) : "NINGUNO" });
}

function sea_cache_recienUsados(cache,k,v,sz,quiereLimpiarDespues) {
	var sz= typeof(v)=="string" ? v.length : sz || 0; //A: OJO! solo podemos contar el tamaño de strings
	var r= { cuandoUso: ahora(), valor: v, sz: sz};
	borrar_cache_recienUsados(cache,k); //A: descontamos el que vamos a reemplazar si estaba
	cache.szUsada+= sz; //A: YA cuento el tamaño, por si tengo que borrar para no pasarme de tamaño total
	if (!quiereLimpiarDespues) { limpiar_cache_recienUsados(cache); } //A: hice lugar si necesitaba
	cache.elementoYuso[k]= r;	//A: ahora agrego el elemento
	return v;
}

function de_cache_recienUsados(cache,k) {
	var r= cache.elementoYuso[k];
	if (r) { 
		r.cuandoUso= ahora(); 
		return r.valor;
	}
}

function borrar_cache_recienUsados(cache,k) {
	try { 
			var e= cache.elementoYuso[k];
			if (e) {
				cache.szUsada-= e.sz;
				delete(cache.elementoYuso[k]);
			}
	}
	catch (ex) {}; //A: si no estaba, no pasa nada	
}

function borrarTodo_cache_recienUsados(cache) {
	cache.elementoYuso= {};
	cache.szUsada= 0;
}

function nuevo_cache_recienUsados(nombre,cntMax,szMax) {
	var r= { nombre: nombre, cntMax: cntMax, szMax: szMax, szUsada: 0, elementoYuso: {}};
	for (var k in CacheApi_recienUsados) { r[k]= CacheApi_recienUsados[k] }
	return r;
}

CacheApi_recienUsados= {
	nuevo: nuevo_cache_recienUsados,
	de: de_cache_recienUsados,
	de_a: funcionComoA(de_cache_recienUsados,true),
 	sea: sea_cache_recienUsados,
	limpiar: limpiar_cache_recienUsados,
	borrar: borrar_cache_recienUsados,
	borrarTodo: borrarTodo_cache_recienUsados,
};


