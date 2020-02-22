//========================================================
//S: util

function timestamp(d) { return (new Date(d||Date.now())).toISOString(); }

function ser_json(o) { return JSON.stringify(o); }
function ser_json_r(s) { return JSON.parse(s); }
ser= ser_json;
ser_r= ser_json_r;

P_SEP_RE= /([^A-Za-z0-9_\.+\$-])/;
function parse_p(p, sepRe) { return p.split(sepRe || P_SEP_RE).slice(1); }//A: p empieza con un separador 
	
function get_p_impl(dst,p,wantsCreate,max,sepRe) { //U: trae un valor en un "path" de kv/arrays anidados
  var parts= Array.isArray(p) ? p : parse_p(p,sepRe);
	if (parts.length && parts[parts.length-1]=="") { parts.pop(); }
	//A: p empieza con un separador, termina con elemento 
	dst= dst!=null ? dst : wantsCreate ? (parts[0]=="[" ? [] : {} ) : null;
	max= max||0;
	var dstp= dst;
  //DBG logm("DBG",1,"LIB get_p_impl",{p: parts, max: max, dstp: dstp});
  for (var i=1; dstp!=null && i<parts.length-max; i+=2)  { var k= parts[i]; var t= parts[i+1]; 
    //DBG logm("DBG",1,"LIB get_p_impl",{k: k, t: t, i: i, dstp: dstp});
		var x= dstp[k];
		if (x==null && wantsCreate && i<parts.length-1) { x= dstp[k]= (t=="[" ? [] : {} ); }
		dstp= x; 
  }
	//A: dstp tiene el objeto donde hay que poner el valor
  //DBG logm("DBG",1,"LIB set_p",{p: p, dstp: dstp});
	return [dstp,dst];
}

function get_p(dst,p,wantsCreate,sepRe) { //U: trae un valor en un "path" de kv/arrays anidados
	return get_p_impl(dst,p,wantsCreate,null,sepRe)[0];
}

function set_p(dst,p,v,wantsIfNotSet,sepRe) { //U: pone un valor en un "path" de kv/arrays anidados
  var parts= Array.isArray(p) ? p : parse_p(p,sepRe);
	//A: p empieza con un separador => parts[0] se ignora, parts[i] es tipo, parts[i+1] clave
	var dd= get_p_impl(dst,p,1,1,sepRe);	
	var dstp= dd[0];
  //DBG logm("DBG",1,"LIB set_p",{p: p, dstp: dstp});
	try {
		var k= parts[parts.length-1];
 	 	if (wantsIfNotSet && dstp[k]!=null) { }
 	 	else { if (k=="+") {dstp.push(v)} else if (k=="-") {dstp.unshift(v)} else { dstp[k]= v; } }
	} catch (ex) { logmex("ERR",1,"set_p",{dst: dst,p:p,parts:parts,dstp: dstp},ex) }

	return dd[1];
}

function set_p_all(dst,kv) { dst= dst || {}; //U: kv= path->v
	fold(kv,function (v,k) { set_p(dst,k,v); }); 
	return dst;
}

//*****************************************************************************
//S: log
ensure_var= function(k,v,scope) { //D: ensure k exists in scope initializing with "v" if it didn't
 if (!(k in scope)) { scope[k]= v; } return scope[k];
}

GLOBAL= ensure_var("GLOBAL",this,this);
LogLvlMax= GLOBAL.LogLvlMax || 9; //DFLT //U:solo se loguean mensajes con nivel MENOR o IGUAL que este
LogLvlAlertMax= GLOBAL.LogLvlAlertMax || 0;

set_logLvlMax= function (lvl) { LogLvlMax= lvl; }

logm= GLOBAL.logm || function(t, lvl, msg, o) { //D: usar SOLO esta funcion de log (t es DBG, NFO o ERR ; lvl es 0 para importantisimo y 9 para irrelevante, o es un objeto que se serializa (ej. diccionario)
    if (lvl <= LogLvlMax) {
      console.log("LOG:" + t + ":" + lvl + ":" + msg + ":" + (o ? ser_json(o) : ""));
			if (lvl<= LogLvlAlertMax) {
				var xr= parseInt(prompt("LOG:" + t + ":" + lvl + ":" + msg + ":" + (o ? ser_json(o) : ""),LogLvlAlertMax));
				LogLvlAlertMax= isNaN(xr) ? 0 : xr;
			}
    }
}

logmAndThrow= function (t,lvl,msg,o) {
	logm(t,lvl,msg,o);
	throw(ser({message: msg, data: o}));
}

logmex= function(t,lvl,msg,o,ex) {
	logm(t,lvl,msg+" EXCEPTION "+exceptionToString(ex),o);
}

exceptionToString= function (ex) {
    var es= "no hay info de error";
		if (ex!=null) {
			es= (typeof(ex)=="string" && ex) || (ex.message && (ex.message + (ex.data ? (" "+ser_json(ex.data)) : "")) || ((typeof(ex.getMessage)=="function") && ex.getMessage())|| "").replace(/\r?\n/g," ");
			if (ex.stack) { es+= " "+ex.stack.replace(/\r?\n/g," > ");}
			else {
					if (ex.fileName) { es+= " "+ex.fileName;}
					if (ex.lineNumber) { es+= ":"+ex.lineNuber;}
			}
		}
    return es;
}


//========================================================
//S: validacion

tName= {
	_t: 'string alphanum required',
	min: 3,
	max: 30,
	regex: /^[a-zA-Z]{3,30}$/,
}

tUser= {
	_t: 'object',
	firstName: tName,
	lastName: tName,
	email: { _t: 'string', email: { minDomainSegments: 2 } }
}

tCuentoContexto= {
	_t: 'object',
	nombre: tName,
 	protagonista: tName,
	meta: { _t: 'string' },
	ayudante: tName,
	vehiculo: tName,
}

//TODO: joi/sequelize DATETIME=DATE =INTEGER,FLOAT 
//SEE: https://hapi.dev/family/joi/
function toJoi(v) { //U: convierte nuestra definicion a la que necesita joi para validar
	var r= {}
	if (typeof(v)=="object") {
		if (v._t== 'object') {
			console.log("isObject",v);
			var parts= {};
			Object.keys(v).forEach( k => { if (k!='_t') { parts[k]= toJoi(v[k]); } } );
			r= Joi.object().keys(parts);
		}
		else {
			r= Joi;
			(v._t || 'string').split(/\s+/).forEach( k => {
					r= r[k].apply(r, null);
			});
			//A: aplicamos los tipos, required, etc.
			
			Object.keys(v).forEach( k => { 
				if (k!='_t') {
					//DBG console.log(k,r); 
					r= r[k].apply(r, Array.isArray(v[k])? v[k] : [v[k]]);
				}
			});
			//A: aplicamos los metodos con parametros
		}
	}
	return r;
}

//SEE: https://sequelize.readthedocs.io/en/2.0/docs/models-definition/#definition
function toSequelize(v) { //U: convierte nuestra definicion a la que necesita sequelize para crear y consultar las tablas
	var r= {};
	if (typeof(v)=="object") {
		if (v._t== 'object') {
			var parts= {};
			Object.keys(v).forEach( k => { if (k!='_t') {	 
				var tCommon= (v[k]['_t'].split(' '))[0].toUpperCase();
				//TODO: hacer un mapa comun y su equivalente en joi/sequelize
				r[k]= {type: Sequelize[tCommon]};
			} } );
		}
	}	
	return r;
}


