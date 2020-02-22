/** 
	@file Funciones para pasar memoria a bytes o texto y viceversa, ej. json
	@module util/serialization
*/

function ser_json(o, wantsPretty) {
	var s;
	if (o != null) {
		try { s = JSON.stringify(o, null, wantsPretty ? 2 : null); } 
		catch (ex) { s = o + ""; }
	} else { s = "null"; }
	return s;
}

function ser_json_r (s) {
	try { return JSON.parse(s); }
	catch (ex) { logmex("ERR",5,"SER PARSE JSON",s,ex); throw(ex); }
}

ser= ser_json; //DFLT

function ser_planoOproto(ox,serFun,wantsPretty) { //U: para NO encodear strings, usa el primer caracter para distinguir
    var o= toJs(ox)
    return ((typeof(o)=="string") ? ("\t"+o) : (" "+serFun(o,wantsPretty)));
}

//XXX:mover a misc
function ser_planoOproto_r(s,serFun_r) {
    return (s && s.length>0) ?
        s.charAt(0)=="\t" ? s.substr(1) : serFun_r(s.substr(1)) :
        null;
}

function ser_planoOjson(o, wantsPretty) { return ser_planoOproto(o,ser_json,wantsPretty); }
function ser_planoOjson_r(s) { return ser_planoOproto_r(s,ser_json_r); }


