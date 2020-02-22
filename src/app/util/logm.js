/**
*	@file Funciones de log
*	@module util/logm
*/

LogLvl= { 
	AlertMax: -1, //U: si es menor que este muestra un alert en pantalla
	Max: 9 //U: si es menor que este, loguea el mensaje
};
//XXX:poner setters


/**
* Funcion de log, usar SOLO esta 
* @param type {string:DBG-NFO-ERR} - tipo de mensaje
* @param lvl {int} - 0 para importantisimo y 9 para irrelevante
* @param mensaje {string} - texto descriptivo, __usar fácil de encontrar y agrupar con grep__
* @param data {serializable|function} - es un objeto que se serializa (ej. diccionario) o una funcion que devuelve un objeto que se serializa
*/
function logm(t, lvl, msg, o) { 
	if (lvl <= LogLvl.Max) {
		if (typeof(o)=="function") { o= o(); } //A: si era una funcion, conseguir el resultado
		console.log("LOG:" + t + ":" + lvl + ":" + msg + ":" + (o ? ser_json(o) : ""));
		if (lvl<= LogLvl.AlertMax) {
			var xr= parseInt(prompt("LOG:" + t + ":" + lvl + ":" + msg + ":" + (o ? ser_json(o) : ""),LogLvl.AlertMax));
			LogLvl.AlertMax= isNaN(xr) ? 0 : xr;
		}
	};
}

/**
* Como logm pero además loguea el texto de una excepción
*
*/
function logmex(t, lvl, msg, o, ex) {
    var es = (typeof(ex) == "string" && ex) || (ex.message && (ex.message + (ex.data ? (" " + ser_json(ex.data)) : "")) || ex.getMessage() || "").replace(/\r?\n/g, " ");
    if (ex.stack) { es += " " + ex.stack.replace(/\r?\n/g, " > "); } 
		else {
        if (ex.fileName) { es += " " + ex.fileName; }
        if (ex.lineNumber) { es += ":" + ex.lineNuber; }
    }
    logm(t, lvl, msg + " EXCEPTION " + es, o);
}


/**
* Llama {@link util/logm} y luego lanza una excepcion con el mensaje y los datos
*/
function logmAndThrow(t, lvl, msg, o) {
    logm(t, lvl, msg, o);
    throw ({ message: msg, data: o });
}


