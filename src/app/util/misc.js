/**
	@file Funciones útiles varias

	@module util/misc

*/

/**
	Devuelve un int si pudo parsearlo, sino el valor que recibio como parámetro.

	Cómoda para usar con map sin necesidad de chequear isNaN, etc.

	@param x {any} un valor que podría ser un int
*/
function tryInt(x) {
	var _t0;
	return ((isNaN((_t0 = parseInt(x))) ? x : _t0))
}

/**
	Devuelve un float o int si pudo parsearlo, sino el valor que recibio como parámetro

	Cómoda para usar con map sin necesidad de chequear isNaN, etc.

	@param x {any} un valor que podría ser un float
*/
function tryFloat(x) {
	var _t0;
	return ((isNaN((_t0 = parseFloat(x))) ? x : _t0))
}


//============================================================
//S: algoritmos / ordenar listas y claves
function ordenadaPorPropiedadNumerica(lista,propiedad) {
	return lista.sort(function (a,b) { return a[propiedad]-b[propiedad]; })
}

function clavesOrdenadasPorPropiedadNumerica(kv,propiedad) {
	return Object.keys(kv).sort(function (a,b) { return kv[a][propiedad]-kv[b][propiedad]; })
}



//S: comunes
function ahora() { return new Date(); }
function timestamp(aDate) { aDate= aDate || ahora(); return aDate.toJSON().replace(/[^a-z0-9]*/gi,"").substr(0,15); }
function dateParts(pfx,aDate,dst) { aDate= aDate || ahora(); return zipkv("YMDhmsf ".split(""),aDate.toJSON().split(/[^0-9]+/),dst,pfx); }

function funcionComoA(funcionQueDevuelveResultado,noQuiereCopiaArgs) { //D: envuelve una funcion sincrona en una asincrona, ej. para hacerla compatible con una api asincrona
	return function () { try {
			var args= fArgsCopy(arguments);
			var cb= args.pop(); //D: CONVENCION! el callback va al final
			var r= funcionQueDevuelveResultado.apply(this,args);
		} catch (ex) { cb(null,ex,args); }
		noQuiereCopiaArgs ? cb(r) : cb(r,null,args);
	}
}

const STREAM_END= {};
function runBg(f) { setTimeout(f,0); }
function fRunDelay(dt,f) { f(); }
function fold(o,f,acc,wantsSorted) {try{
	var STOP_OK_EX= {};
	var stop= function (acc) { STOP_OK_EX.acc=acc; throw STOP_OK_EX; };

	if (o!=null) {
		if (typeof(o.getClass)=="function") {
			var c= new String(o.getClass());
			if (c.indexOf("Map")>-1) {
				var ks= toJs(o.keySet());
				if (wantsSorted) { ks= typeof(wantsSorted)=="function" ? ks.sort(wantsSorted) : ks.sort(); }
				for (var i in ks) { acc= f(o.get(ks[i]),ks[i],acc,stop,o); }
			}
		}
		else if (Array.isArray(o)) {
			if (wantsSorted) { o= typeof(wantsSorted)=="function" ? o.sort(wantsSorted) : o.sort(); }
			for (var i=0; i<o.length; i++) { acc= f(o[i],i,acc,stop,o); }
		}
		else if (typeof(o)=="object") { 
			
			var ks= keys_kv(o);
			if (wantsSorted) { ks= typeof(wantsSorted)=="function" ? ks.sort(wantsSorted) : ks.sort(); }
			for (var i in ks) { acc= f(o[ks[i]],ks[i],acc,stop,o); }
		}
	}
	}catch(ex){ if (ex===STOP_OK_EX) { acc= STOP_OK_EX.acc } else { throw(ex) } }; //A: se puede parar el fold lanzando STOP_OK_EX

	return acc;
}

//S: construir claveXvalor a partir de listas
function zipkv(lOfK,lOfV,acc,pfx,wantsOnlyNotNull) {
	var pfxOk= pfx||"";
	return fold(lOfK,function (v,k,acc) { var vv= (v[0]=="&") ? lOfV.slice(k) : lOfV[k]; if (!wantsOnlyNotNull || vv!=null) { acc[pfxOk+((v[0]=="&") ? v.substring(1) : v)]= vv }; return acc; },acc ||{});
}

function keys_kv (kv) { return Object.keys(kv); }; //U: devuelve las claves para un objeto

function evalmJs(src) { eval(src); }

/**
	XXX:OjO hace falta en el browser pero es RE importante porque ataja TODOS los errores
	y por eso mismo los puede ocultar y causar problemas dificiles de entender.

errorLast= null;
window.onerror = function myErrorHandler(errorMsg,url,lineNumber,col,error) {
	errorLast= errorMsg;
	if (typeof(errorMsg)=="object") { var e= errorMsg; errorMsg= ser_str(e); } //A: es un evento, ej. en phonegap
	alert("ERROR [g] "+errorMsg+" "+url+" "+lineNumber+" "+ error);
}
*/

//XXX:mover a misc
function fArgsCopy(a,idxMin,dst) { //U: copiar "arguments" a un array, USAR esta separada en una linea asi la podemos reemplazar por una macro porque v8 NO optimiza las funciones que hacen cosas raras con arguments :P
  var r= Array.prototype.slice.call(a,idxMin||0);
  return dst ? dst.concat(r) : r;
}

//XXX:mover a misc
function length(o) { //D: una version generalizada
  if (o==null) { return 0; }
  else { var t= typeof(o.length);
    if (t=="function") { return o.length(); }
    else if (t!="undefined") { return o.length; }
    else { return length_kv(o); }
  }
}

//XXX:mover a misc
/**
	Generar alguna representacion tipo string si no tenemos json o no se puede convertir porque es circular, etc.
	No usar en general, es por ej. para cuando si o si hay que mostrar un error.
*/
function ser_str(x) { var r;
	try { r= JSON.stringify(x); }
	catch (ex) {} //A: json fails, must be circular
	if (!r || r=="{}") {	
		var t= typeof(x);
		r="str_r('"+typeof(x)+"',{";
		for (var i in x) { r+="'"+i+"': '"+x[i]+"', " }
		r+="});"
	}
	return r;
}


// ****************************************************************************
//S: rt, compatibilidad con rt_java
function toJs(v) { return v; } //D: compatibilidad con rt_java 
function load(l) { console.log("REVISAR QUE " + l + " ESTE CARGADO") };

function enc_base64(str) { return window.btoa(unescape(encodeURIComponent(str))); }
function enc_base64_r(str) { return decodeURIComponent(escape(window.atob(str))); }

// ****************************************************************************
//S: lib

function fnop(){}; //U: un callback que no hace nada
function nullf(){}; //U: un callback que no hace nada
function onFail(d) { console.log("ERR:ON FAIL"+d); logm("ERR",1,"ON FAIL",d); }
function onFailAlert(err) { alert("ERROR: " + ser_str(err)); }
function showMsg(msg) { alert(msg); }  //XXX: Cambiar por una función con el estilo de la UI
function raiseError(msg) { showMsg(msg); }   //XXX: Cambiar por una función que guarde en el log y muestre un cartel (¿Usar Log de lib.js?)

// *****************************************************************************
//S: algoritmos / nombres de archivos
function seguro_str(s,caracterEscapeAntes,caracterEscapeDespues,caracteresPermitidos) {
	caracterEscapeAntes= caracterEscapeAntes || "_"; //A: seguro en nombres de archivo widows y linux
	caracterEscapeDespues= caracterEscapeDespues || caracterEscapeAntes;
	caracteresPermitidos= caracteresPermitidos || "a-zA-Z0-9"; //A: seguro en nombres de archivo widows y linux
	return (s+"").replace(new RegExp("[^"+caracteresPermitidos+"]","g"),function (m) { return caracterEscapeAntes+m.charCodeAt(0).toString(16)+caracterEscapeDespues; })
}

function seguro_str_r(s,caracterEscapeAntes,caracterEscapeDespues) {
	caracterEscapeAntes= caracterEscapeAntes || "_";
	caracterEscapeDespues= caracterEscapeDespues || caracterEscapeAntes;
	return s.replace(new RegExp(caracterEscapeAntes+"([0-9a-fA-F]+)"+caracterEscapeDespues,"g"),function (m,h) { return String.fromCharCode(parseInt(h,16)); });
}

var seguro_fname= seguro_str;
var seguro_fname_r= seguro_str_r;

// ************************************************************
var CfgAuthBasicSep="_@_";
function httpAuthHeadersBasicFor(userPassPairsArray) { //U: genera un header compatible con el estandard de http para poder servir archivos estaticamente, PERO que permite tener en cuenta ej. el dispositivo
	var principals= []; var passes= [];
	for (var i=0; i<userPassPairsArray.length;i+=2) {
		principals.push(userPassPairsArray[i]);
		passes.push(userPassPairsArray[i+1]);	
	}
	return { "Authorization": "Basic " + btoa(principals.join(CfgAuthBasicSep) + ":" + passes.join(CfgAuthBasicSep)) };
}

function getHttpAuthToken() {
	return httpAuthHeadersBasicFor([Cfg.user,Cfg.hash||Cfg.pass,Cfg.deviceId,Cfg.deviceToken]).Authorization.replace("Basic ",'');
}


//============================================================

/**
	Una lista de colores de rojo a verde para mostrar progreso
*/
var Progress_Colors= "#f20e67, #ff474d, #ff7433, #ff9e14, #f9c500, #e0cf00, #c4d900, #a2e102, #83d003, #64be06, #43ad09, #189b0b".split(/[\s,]+/);

/**
	Para rotar valores (ej. color borde del tile para mostrar progreso)
*/
function mk_alternator(options_strOarr) {
	var options= typeof(options_strOarr)=="string" ? options_strOarr.split(/[\s,]+/) : options_strOarr;
	var i= 0;
	return () => options[(i= (i+1) % options.length)];
} 

function mk_alternator_colors() {
	return mk_alternator(Progress_Colors);
}

//============================================================

