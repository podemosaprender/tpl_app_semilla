//========================================================
//S: util
function fLog(msg,fToCallAfter) { //U: devuelve una funcion, que al llamarla loguea mensaje y los parametros
	return function (p1,p2,p3) { 
		console.log(msg,p1,p1,p3); 
		if (typeof(fToCallAfter)=='function') { fToCallAfter(p1,p2,p3); }
	}
}

function timestamp(d) { return (new Date(d||Date.now())).toISOString(); }

function ser_json(o, wantsIndent) { return JSON.stringify(o, null, wantsIndent); }
function ser_json_r(s) { return JSON.parse(s); }
ser= ser_json;
ser_r= ser_json_r;

function fold(o,fun,acc) {
	if (Array.isArray(o)) { o.forEach( (v,i) => { acc= fun(v,i,acc); } ) }
	else if (typeof(o)=='object') {
		Object.entries(o).forEach( e => {acc= fun(e[1],e[0],acc); } );
	}
	return acc;
}

function put(v,dst,k) { //U: comodo para poner v en dst (lo crea si no estaba), si no le pasas k hace push
	if (dst==null) { if (k!=null && !isFinite(k)) dst={}; else dst=[]; }
	if (k!= null)  dst[k]= v;  else  dst.push(v); 
	return dst;
}

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

/************************************************************************** */
//S: github via api

function mifetch(url = '', data, options={}) { //U: post usando "fetch", mas comodo
    var fetchOpts= {
      method: options.method || "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
          "Content-Type": "application/json",
					... options.headers
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
  };

  if (options.user) {
   fetchOpts.headers['Authorization']= 'Basic ' + btoa(options.user + ":" + options.pass);
  }

  if (data) { 
    fetchOpts.body= JSON.stringify(data); // body data type must match "Content-Type" header
  }

  return fetch(url, fetchOpts)
    .then(response => response.json()); // parses JSON response into native Javascript objects 
}


//VER: api https://developer.github.com/v3/
//VER: api github https://gist.github.com/caspyin/2288960
function set_file_github_p(fdsc,txt,opts) {
  if (typeof(fdsc)=="string") { fdsc= {fname: fdsc } }
  //A: fdsc es un objeto que tiene fname
  var m= fdsc.fname.match(/^([^\/]+\/[^\/]+)\/?(.*)/);
  var repo= m[1]; //A: el repo es user/repo, asi podemos acceder a los que nos compartieron otros usuarios
  var path= m[2];
  if (repo=="gist") {
    var files= {};
    files[path]= {"content":txt};
    return mifetch('https://api.github.com/gists',{
      "description":"Guardar en Github",
      "public":"true",
      "files":files
    },Object.assign({method: "POST"},opts));
  }
  else {
    //VER: https://developer.github.com/v3/repos/contents/#update-a-file
    return mifetch('https://api.github.com/repos/'+repo+'/contents/'+path, {
      "message": "Guardar en Github",
      "content": btoa(txt),
      "sha": fdsc.sha,
    }, Object.assign({method: 'PUT'},opts));
  }
}

function get_file_github_p(fdsc,opts) {
  if (typeof(fdsc)=="string") { fdsc= {fname: fdsc } }
  //A: fdsc es un objeto que tiene fname
  var m= fdsc.fname.match(/^([^\/]+\/[^\/]+)\/?(.*)/);
  var repo= m[1]; //A: el repo es user/repo, asi podemos acceder a los que nos compartieron otros usuarios
  var path= m[2];
  if (repo=="gist") {
    console.log("NO IMPLEMENTADO"); //XXX:los gists tienen como nombre un hash y hay que leer la lista, buscar la descripcion, etc.
    //la lista se consigue con mifetch("https://api.github.com/users/mauriciocap/gists",null,opts)
  }
  else {
    //VER: https://developer.github.com/v3/repos/contents/#update-a-file
    return mifetch('https://api.github.com/repos/'+repo+'/contents/'+path, null, opts);
  }
}

function keys_file_github_p(fname,opts) {
  if (fname=='') { //A: los repos
    return mifetch("https://api.github.com/user/repos",null,opts);
  }
  else { //A: un path en un repo
    return get_file_github_p(fname, opts);
  }
}

//SEE: https://developer.github.com/v3/repos/forks/
function fork_github_p(src,opts) {
	return mifetch(
		"https://api.github.com/repos/"+src+'/forks', 
		null,
		Object.assign({method: 'POST'},opts)
	);
}

//SEE: https://developer.github.com/v3/repos/pages/#enable-a-pages-site
//U: la url viene en la respuesta en html_url
function webEnable_github_p(src, opts) {
	return mifetch(
		"https://api.github.com/repos/"+src+'/pages', 
		{source: {branch: "master"}},
		Object.assign({
				method: 'POST', 
				headers: {'Accept': 'application/vnd.github.switcheroo-preview+json'},
			},
			opts
		)
	);	
}

//SEE: https://developer.github.com/v3/repos/#edit

//============================================================
//S: jsx a nuestras estructuras de datos
function xmlAttrToKv(str, keySep) {
	keySep= keySep || '=';

	var r= {};
	var tokens= str.split(new RegExp('(\\s+|'+keySep+'|\{\{|\{|\}}|\}|\"|\')'));
	
	var k= null;
	for (var i=0; i<tokens.length; i++) { var tok= tokens[i];
		//
		logm("DBG",0,"xmlAttrToKv",{i,k,tok,r});
		if (k) {
			var stop= null;
			if (tok=='{{') { stop= '}}'; } else if (tok=='{') { stop= '}'; }
			else if (tok=='"') { stop= '"'; } else if (tok=="'") { stop= "'"; }
			if (stop) {
				var s=''; 
				for (i++; i<tokens.length && tokens[i]!=stop; i++) { s+=tokens[i]; } 
				//TODO: error si falta cierre 
				r[k]= tok=='{{' ? xmlAttrToKv(s,':') : tok=='{' ? 'EVAL('+s+')' : s; k= null;
				//logm("DBG",0,"xmlAttrToKv v",{i,k,stop,tok:tokens[i],s});
			}
		}
		else if (tok==keySep) { k= tokens[i-1]; }
		else if (i>0 && tok.match(/\s+/) && tokens[i-1].match(/\w+/)) { r[tokens[i-1]]= true; }
	}
	return r;
}

function xmlToPaPreact(xmlstr) {
	var tokens= xmlstr.split(/(<[^>]+>)/);
	var st= [{}]; //A: stack para armar el resultado, empieza con un "top"
	var tos= null; //A: top of stack
	tokens.forEach(tok => {
		var m= tok.match(/<(\/?)([^\s\r\n\t>]+)\s*([^>]*)>$/);
		if (m) { //A: es un tag
			var abre= !m[1];
			var cierra= m[1] || (m[3] && m[3].match(/\/$/));
			logm("DBG",0,"xmlToPaPreact",{abre, cierra, tok, m, st});
			if (abre) { 
				var attr= m[3] ? xmlAttrToKv(m[3].replace(/\/$/,'')) : {};	
				tos= {... attr, cmp: m[2]};
				st.push(tos);
			}			
			if (cierra) { 
				var cur= st.pop();
				tos= st[st.length-1];

				tos.children= tos.children || [];
				tos.children.push(cur);
			}
		}
		else if (tos) { //A: texto suelto, si ya aparecio el primer tag
			var v= tok.trim();
			if (v!='') {
				tos.children= tos.children || [];
				tos.children.push(v);
			}
		}
	});
	return tos.children[0];
}

