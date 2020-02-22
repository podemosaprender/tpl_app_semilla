/**
* INFO: ofrece tanto en app movil cordova como browser chrome un runtime compatible con nuesta especificacion de runtime, de modo que funcione "todo lo mismo" que funciona ej. en rt_java
*
*	@file Leer y escribir archivos del celular (o node, o el browser)
* @module util/platform
* @author dev_redmovil@mauriciocap.com
*
*
*/

os= {};

runtimeEnv= (typeof window != 'undefined') ? window._cordovanative ? 'cordova' : 'browser' : 'node'; //XXX:asegurarse que en node nunca existe 'window'

localStorageRequestQuota_p= null;

/**
* Lee una parte de un archivo.
*	@param path {string} - Path de el archivo; Incluir el formato; Por default lo busca en la memoria interna
* @param fmt {string} - Formato del archivo
* @param desde {int} - Cuantos bytes saltear del principio
* @param hasta {int} - Hasta que nro de byte leer
*	@returns Promise[string]
* @example
*	a= get_file_slice_p('x_ejemplo.txt', 'txt', 0, 10);
*	a.then((t) => console.log('ANDUVO:', t)).catch((e) => console.log('ERROR:', e));
*/
get_file_slice_p= null;

/**
* Lee un archivo completo.
*	@param path {string} - Path de el archivo; Incluir el formato; Por default lo busca en la memoria interna
* @param fmt {string} - Formato del archivo
*	@returns Promise[string]
* @example
*	a= get_file_p('x_ejemplo.txt', 'txt');
*	a.then((t) => console.log('ANDUVO:', t)).catch((e) => console.log('ERROR:', e));
*/
get_file_p= null;

/**
* Averigua la metadata de un archivo
*	@param path {string} - Path de el archivo; Por default lo busca en la memoria interna
*	@returns Promise[object]
* @example
*	a= get_meta_p('x_ejemplo.txt');
*	a.then((t) => console.log('ANDUVO:', t)).catch((e) => console.log('ERROR:', e));
*/
get_meta_p= null;

/**
* Averigua los archivos (y subdirectorios) de un directorio
*	@param dir {string} - Path del directorio
*	@returns Promise[array]
* @example
*	a= keys_file_p('.');
*	a.then((t) => console.log('ANDUVO:', t)).catch((e) => console.log('ERROR:', e));
*/
keys_file_p= null;

/**
* Escribe un archivo 
*	@param dir {string} - Path del archivo; Por default escribe en la memoria interna
* @example
*	a= set_file_p('x_ejemplo.txt', 'CONTENIDO');
*	a.then((t) => console.log('ANDUVO:', t)).catch((e) => console.log('ERROR:', e));
*/
var set_file_p;
/**
 Hace lo mismo que set_file_p
 Si estamos guardando datos binarios (no texto) llamamos esta así queda claro en el código
*/
var set_file_bin_a;

/**
* Se fija si un directorio existe, si no existe lo genera 
*	@param path {string} - Path del directorio; Por default escribe en la memoria interna
* @example
*	a= ensure_dir_p('./Musica/NOEXISTE');
*	a.then((t) => console.log('ANDUVO:', t)).catch((e) => console.log('ERROR:', e));
*/
var ensure_dir_p;

/**
* Borra un directorio y todo su contenido
*	@param path {string} - Path del directorio; Por default escribe en la memoria interna
* @param quiereSinPedirConfirmacion {} - XXX:COMOSEUSA
* @example
* a= deleteAll_dir_p('./BORRAR');
*	a.then((t) => console.log('ANDUVO:', t)).catch((e) => console.log('ERROR:', e));
*/
var deleteAll_dir_p;

/**
* Borra un archivo
*	@param path {string} - Path del archivo; Por default busca en la memoria interna
* @example
*	a= delete_file_p('x_borrar.txt');
*	a.then((t) => console.log('ANDUVO:', t)).catch((e) => console.log('ERROR:', e));
*/
var delete_file_p;

var CfgRtUNSAFEDbgFs= false; //U: para pruebas, mostrar en consola datos desencriptados
var CfgStorageQuota= 500*1024*1024; //U: cuanto espacio queremos para caches/offline=500Mb

//XXX: separar "preludio"=funciones basicas + (runtime especifico) + lib

//****************************************************************************
//S: compatibilidad con movil
if (runtimeEnv=='node') { 
	console.log('//A: en node! funciones compatibles');
	os.fetch= require('cross-fetch'); //A: con require, asi rollup no las incluye
	var fs= require('fs');
	get_file_p= function get_file_p(path,type) {
		return new Promise( (onOk, onErr ) => { 
			fs.readFile(path, (err, data) => { (err!=null) ? onErr(err) : onOk(data) });
		});
	}
}
else { //A: estoy en algun browser, sea cordova, sea chrome
	os.fetch= function (...args) { return window.fetch.apply(window,args); }

	if(!window.requestFileSystem) {	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;}

	if (!window.LocalFileSystem) { window.LocalFileSystem= window.LocalFileSystem || window; } 

	if (!window.resolveLocalFileSystemURL) { window.resolveLocalFileSystemURL= window.webkitResolveLocalFileSystemURL; }

	if (window.requestFileSystem) { //A: tenemos api de filesystem

	function localStorageRequestQuota_a(requestedBytes,cb) {try{ //U: pide espacio para localstorage
		//VER: https://developer.chrome.com/apps/offline_storage#asking_more
		navigator.webkitPersistentStorage.requestQuota (requestedBytes, 
			function(grantedBytes) { cb(null,grantedBytes);}, function(e) { cb(['Error', e]); }
		);
	}catch(ex){logmex("ERR",1,"localStorageRequestQuota_a",requestedBytes,ex);cb(ex)}}

	localStorageRequestQuota_p= toPromise_a1(localStorageRequestQuota_a);

	function get_file_entry_a(path,wantsCreate,cb) { //U: trae un fileEntry que usan las demas funcs
		var onFail= function (err) { 
			logm("DBG",8,"get_file_entry_a FAIL",{path: path, wantsCreate: wantsCreate, err: ser_str(err)});
			cb(err,null); 
		}

		var onGotFileEntry= function (fileEntry) { 
			logm("DBG",8,"get_file_entry_a OK",{path: path, wantsCreate: wantsCreate});
			cb(null,fileEntry); 
		}

		var onGotFs= function (fileSystem) {
			logm("DBG",CfgRtUNSAFEDbgFs ? 1 : 9,"RT FS ROOT", fileSystem.root.fullPath);
			fileSystem.root.getFile(path, {create: !!wantsCreate}, onGotFileEntry, onFail);
		}

		logm("DBG",8,"get_file_entry_a",{path: path, wantsCreate: wantsCreate});
		if (typeof(path)=="string") {
			if (runtimeEnv=='cordova' && path.indexOf("file://")==0) { //A: puede ser otro filesystem 
				window.resolveLocalFileSystemURI(path, onGotFileEntry, onFail);
			}
			else {
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onGotFs, onFail);
			}
		}
		else { onGotFileEntry(path); }
	}

	function get_file_slice_a(path,fmt,ofs,len,cbok,cbfail) { //U: trae un segmento de archivo
		logm('DBG',9, 'Esperando', {path, fmt, ofs, len});
		var cbfailWrapped=cbfail||u.onFail; cbfail= function () { logm('DBG', 1, 'ERROR FAIL Leer segmento archivo', {path, fmt, ofs, len}); cbfailWrapped.apply(null,arguments); };
		var cbOkWrapped=cbok; cbok= function () { logm('DBG',9, 'ANDUVO leer archivo', {path, fmt, ofs, len}); cbOkWrapped.apply(this,arguments) };

		function read(file) {
			var reader = new FileReader();
			reader.onloadend = function(evt) {
				logm("DBG",8,"get_file_a onloadend",{path: path, result: evt.target.result});
				cbok(evt.target.result);
			};
			if (fmt=="url") { reader.readAsDataURL(file); }
			else if (fmt=="bin") { reader.readAsBinaryString(file); }
			else if (fmt=="array") { reader.readAsArrayBuffer(file); }
			else { reader.readAsText(file); }
		};

		var onGotFile= function (file) { if (len==-1) { read(file); } else { read(file.slice(ofs,ofs+len));} }

		var onGotFileEntry= function (fileEntry) { fileEntry.file(onGotFile,cbfail); }

		var onGotFs= function (fileSystem) {
			logm("DBG",CfgRtUNSAFEDbgFs ? 1 : 9,"RT FS ROOT", fileSystem.root.fullPath);
			fileSystem.root.getFile(path, {create: false}, onGotFileEntry, cbfail);
		}

		logm("DBG",8,"get_file_a",{path: path});
		if (typeof(path)=="string") {
			if (runtimeEnv=='cordova' && path.indexOf("file://")==0) { //A: puede ser otro filesystem 
				window.resolveLocalFileSystemURI(path, onGotFileEntry, cbfail);
			}
			else {
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onGotFs, cbfail);
			}
		}
		else { onGotFileEntry(path); }
	}

	get_file_slice_p= toPromise_aOkErr(get_file_slice_a);

	function get_file_a(path,fmt,cbok,cbfail) { get_file_slice_a(path,fmt,-1,-1,cbok,cbfail); }

	get_file_p= function (path, fmt) { return (toPromise_aOkErr(get_file_a)(path, fmt||"txt")) };

	function getMeta_file_a(path,cbok,cbfail) {
		cbfail=cbfail ||u.onFail;
		var onGotFileEntry= function (fileEntry) { fileEntry.getMetadata(cbok,cbfail); }
		var onGotFs= function (fileSystem) {
		fileSystem.root.getFile(path, {create: false}, onGotFileEntry, cbfail);
		}
		logm("DBG",8,"getMeta_file_a",{path: path});
		if (typeof(path)=="string") {
			if (runtimeEnv=='cordova' && path.indexOf("file://")==0) { //A: puede ser otro filesystem 
				window.resolveLocalFileSystemURI(path, onGotFileEntry, cbfail);
			}
			else {
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onGotFs, cbfail);
			}
		}
		else { onGotFileEntry(path); }
	}

	get_meta_p= toPromise_aOkErr(getMeta_file_a);

	function keys_file_a(dirPath,cb) {
		var conDirectorio= function(dir) {try{ logm("DBG",9,"keys_file_a conDirectorio",[dirPath,dir]); 
			var directoryReader = dir.createReader();
			directoryReader.readEntries(cb,cb);
		} catch (ex) { logmex("ERR",7,"keys_file_a conDirectorio",dirPath,ex); }}

		var conFilesystem= function (fs) {try{ logm("DBG",9,"keys_file_a gotfs",[dirPath,fs.root]); 
			fs.root.getDirectory(dirPath,{create: false, exclusive: false},conDirectorio,cb);
		} catch (ex) { logmex("ERR",7,"keys_file_a gotfs",dirPath,ex); cb();}}

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, conFilesystem, cb);
	}

	keys_file_p= function (path) { return new Promise( (onOk, onErr) => 
		keys_file_a(path, (res) => {
			if (Array.isArray(res)) { onOk(res) }
			else { onErr(res) }
		}));
	}

	function set_file_a(path,data,cbok,cbfail) { //XXX:MANEJO_ERRORES
	logm('DBG',9, 'Escribiendo', {path, data});
	 var cbfailWrapped=cbfail||u.onFail; cbfail= function () { logm('DBG', 1, 'ERROR FAIL Escribir archivo', {path, data}); cbfailWrapped.apply(null,arguments); };
	 var cbOkWrapped=cbok; cbok= function () { logm('DBG', 9, 'Escribiendo', {path, data}); cbOkWrapped.apply(this,arguments) };

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, cbfail);

		function gotFS(fileSystem) {try{ logm("DBG",9,"set_file_a gotfs",[path]); 
			fileSystem.root.getFile(path, {create: true, exclusive: false}, gotFileEntry, cbfail);
		} catch (ex) { logm("ERR",7,"set_file_a gotfs",[path,ex.message]); }}

		function gotFileEntry(fileEntry) {try{ logm("DBG",9,"set_file_a gotentry",[path]);
			fileEntry.createWriter(gotFileWriter, cbfail);
		} catch (ex) { logm("ERR",7,"set_file_a gotentry",[path,ex.message]); }}

		function gotFileWriter(writer) {try{ logm("DBG",9,"set_file_a write",[path]); 
			writer.onwriteend = function(evt) {
				writer.onwriteend = cbok;
				if (typeof(data)!="string") { logm("ERR",1,"set_file_a se esperaba STRING",{path: path, data:data, type: typeof(data), k: Object.keys(data), isUint8Array: Uint8Array.isPrototypeOf(data)}); }
				writer.write((runtimeEnv!='cordova' && typeof(data)=="string") ? new Blob([data],{type: 'application/octet-binary'}) : data);
			};
			writer.truncate(0);
		} catch (ex) { logm("ERR",7,"set_file_a write",[path,ex.message]); cbfail(ex); }}
	}

	set_file_p= toPromise_aOkErr(set_file_a);

	set_file_bin_a= set_file_a;

	function ensure_dir_a(path,cbok,cbfail) {
		cbfail=cbfail ||u.onFail;
		var parts= path.split(new RegExp("/+")); //A: tratamos barras repetidas como una sola!
		var i= 0;

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestFileSystemSuccess, cbfail);

		function onRequestFileSystemSuccess(fileSystem) {
			logm("DBG",CfgRtUNSAFEDbgFs ? 1 : 9,"RT FS ROOT", fileSystem.root.fullPath);
			if (parts.length==0) { cbok(fileSystem.root); }
			else {	createPart(fileSystem.root) }
		}

		function createPart(pdir) {
			var p= parts[i]; i++;
			pdir.getDirectory(p, {create: true, exclusive: false}, i<parts.length ? createPart : cbok,cbfail);
		}
	}

	ensure_dir_p= toPromise_aOkErr(ensure_dir_a);

	function deleteAll_dir(dirPath,quiereSinPedirConfirmacion,cb,cbFail) {
		cb= cb || u.nullf;
		cbFail= cbFail || u.onFail;

		var gotDir= function (dirEntry) { try { ///XXX:REFACTOR_UI: separar ui
			var uc= quiereSinPedirConfirmacion ? "s" : prompt("esta seguro que desea eliminar '"+dirEntry.name+"'?");
			if (uc=="s") {
				dirEntry.removeRecursively(function () { 
					logm("OK",5,"deleteAll_dir ok",dirPath);
					quiereSinPedirConfirmacion || alert('los archivos han sido eliminados'); cb(); 
				},cbFail);
			}
			else {
				alert("NO se eliminaran los archivos");
			}
		} catch (ex) { logm("ERR",5,"deleteAll_dir cuandoTengaDir",[dirPath,ex.message]); }}

		var gotFs= function (fs) { try {
			logm("DBG",7,"deleteAll_dir fs "+dirPath+" vs "+fs.root.fullPath);
			//XXX: Revisar para el mobile; fs.root.fullPath="";
			fs.root.getDirectory(dirPath,{create: false}, gotDir,cbFail);
		} catch (ex) { logm("ERR",1,"deleteAll_dir fs",[dirPath,ex.message]); }}

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFs, cbFail);
	}

	deleteAll_dir_p= toPromise_aOkErr(deleteAll_dir)

	function delete_file_a(path,cbok,cbfail) {
	 logm('DBG',9, 'Borrando archivo', {path});
	 var cbfailWrapped=cbfail||u.onFail; cbfail= function () { logm('DBG', 1, 'ERROR FAIL Borrar archivo', {path}); cbfailWrapped.apply(null,arguments); };
	 var cbOkWrapped=cbok; cbok= function () { logm('DBG', 9, 'Anduvo borrar archivo', {path}); cbOkWrapped.apply(this,arguments) };

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, cbfail);

		function gotFS(fileSystem) {try{ logm("DBG",9,"delete_file_a gotfs",[path]); 
			fileSystem.root.getFile(path, {create: true, exclusive: false}, gotFileEntry, cbfail);
		} catch (ex) { logm("ERR",7,"delete_file_a gotfs",[path,ex.message]); }}

		function gotFileEntry(fileEntry) {try{ logm("DBG",9,"delete_file_a gotentry",[path]);
			fileEntry.remove(cbok, cbfail);
		} catch (ex) { logm("ERR",7,"delete_file_a gotentry",[path,ex.message]); }}
	}

	delete_file_p= toPromise_aOkErr(delete_file_a);

	}
	else { //A: no tenemos filesystem, emulamos con localstorage
		//XXX:GALIEO:fijate de hacerlo andar
		function localStorageRequestQuota_a(requestedBytes,cb) { try{ //U: pide espacio para localstorage
			//VER: https://developer.chrome.com/apps/offline_storage#asking_more
			cb(['Error', 'not implemented']); 
		}catch(ex){logmex("ERR",1,"localStorageRequestQuota_a",requestedBytes,ex);cb(ex)}}
		
		localStorageRequestQuota_p= toPromise_a1(localStorageRequestQuota_a);

		get_file_a = function(p, t, cbok, cbf) {
			var v = localStorage[p];
			setTimeout(function() { v ? cbok(v) : cbf() }, 100);
		}
		set_file_a = function(p, v, cbok, cbf) {
			localStorage[p] = v;
			setTimeout(cbok, 100);
		}
		set_file_bin_a= function(p, v, cbok, cbf) {
			localStorage[p] = v;
			setTimeout(cbok, 100);
		}
		ensure_dir_a= function(p, cbok, cbf) {
			setTimeout(cbok, 100);
		}
		ensure_dir= ensure_dir_a;
		keys_file_a = function(p, cb) {
			var r = [];
			p += '/'; //A: si es un dir la clave sera p+nombrearchivo
			for (var i = 0; i < localStorage.length; i++) {
				var k = localStorage.key(i);
				//SEE: http://docs.phonegap.com/en/edge/cordova_file_file.md.html#FileEntry
				//XXX: hacer la emulacion mas completa?
				if (k.substr(0, p.length) == p) { //A: p es prefijo del nombre
					var parts = k.substr(p.length).split('/'); //A: separamos el resto en partes
					r.push({ name: parts[0], isFile: parts.length == 1, isDirectory: parts.length > 1, fullPath: k });
				}
			}
			setTimeout(function() { cb(r) }, 10);
		};

		delete_file= function (p, cb) { //XXX: implementar en phonegap=rt_movil (ojo que en rtmovil esta como removeFile)
			localStorage.removeItem(p);
			setTimeout(cb,10);
		}

		deleteAll_dir = function(p, quiereSinPedirConfirmacion, cb) {
			var paraBorrar= [];
			for (var i = 0; i < localStorage.length; i++) {
				var k = localStorage.key(i);
				if (k.substr(0, p.length) == p) { paraBorrar.push(k) }
			}
			logm("DBG",7,"FS deleteAll_dir",{p: p, paraBorrar: paraBorrar});
			for (var i=0; i<paraBorrar.length;i++) {
				localStorage.removeItem(paraBorrar[i]);
			}
			setTimeout(cb, 10);
		};
	}
	//XXX:GALILEO fijate si los toPromise_a1 los podes hacer todos aca una sola vez
}
//A: deje definida alguna version de las mismas funciones, este en node, browser sin filesystme o cordova

/**
	Guardar un objeto en un archivo
	@param path {path} donde guardar
	@param data {serializable} los datos (se tiene que poder serializar con JSON.stringify)
	@return {promise}
*/
function set_file_o_p(path, data) {
	return set_file_p(path, ser.ser_planoOjson(data));
}

/**
	Leer un objeto de un archivo
	@param path {path} donde guardar
	@param data {serializable} los datos (se tiene que poder serializar con JSON.stringify)
	@return {promise}
*/
function get_file_o_p(path, data) {
	return get_file_p(path, "txt").then(t => ser.ser_planoOjson_r(t));
}

//***********************************************************
//XXX:PG:COMPAT renombrar, usar funcionConCache desde ACA 

//S: lib/http
function cxTypeName(type) {
		var states = {};
		if (GLOBAL.Connection) {
			states[Connection.UNKNOWN]  = 'Desconocido';
			states[Connection.ETHERNET] = 'Ethernet';
			states[Connection.WIFI]     = 'WiFi';
			states[Connection.CELL_2G]  = 'Cell 2G';
			states[Connection.CELL_3G]  = 'Cell 3G';
			states[Connection.CELL_4G]  = 'Cell 4G';
			states[Connection.NONE]     = 'No network';
		}

		return states[networkState]||"Desconocido";
}

//XXX:GALILEO:es por plataforma, esto solo anda en cordova, poner var y asignarle alguna version aunque sea mock ej en node
function cxType() { return navigator.network ? navigator.network.connection.type : -1; }
function cxName_a(cb) { if (window.WifiWizard) { window.WifiWizard.getCurrentSSID(cb) } else { cb("","NO TENGO WIFI PLUGIN"); } };

//***************************************************************************
//S: dispositivo
//XXX:GALILEO:es por plataforma, esto solo anda en cordova, poner var y asignarle alguna version aunque sea mock ej en node
//XXX:MAU ¿Como se usa?
var BatteryStatusLast;
function onBatteryStatus(status) {
	if (status) {
		BatteryStatusLast.isPlugged= status.isPlugged;
		BatteryStatusLast.level= status.level;
	}
	logm("DBG",1,"RT BATTERY",BatteryStatusLast);
}

//XXX:GALILEO ¿Cómo se usa?
function rtInfoDevice() {try {
	var s = "";
	if (window.device) {
		s += "D:" + device.uuid + " " + device.model + " " + device.platform + " " + device.version + " " + device.name;
	} 
	else { s += "D:noinfo"; }
	return s;
}catch(ex) { logmex("ERR", 1, "RT INFO DEVICE", null, ex); }}

/**
*	Averigua informacion del celular
*	@returns string[Android, modelo, browser]
*/
function rtInfo() {try {
	var s = "AV: " + navigator.appVersion;
	if (window.device) {
		s += "\nD:" + device.uuid + " " + device.model + " " + device.platform + " " + device.version + " " + device.name;
	} 
	else { s += "\nD:noinfo"; }
	return s;
}catch(ex) { logmex("ERR", 1, "RT INFO", null, ex); }}

/**
* Sale de la aplicación
*/
function appExit() {
	if (navigator.app && navigator.app.exitApp) { navigator.app.exitApp();	} 
	else { window.location.reload(); }		 
};
