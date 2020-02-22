/**
	@file Leer .zip, pueden ser encriptados SOLO MOBILE
	@module util/zip
*/

/**
	Lee el directorio del zip.

	@param zip_path {string:zip_path} midir/miarchivo.zip:mipathadentro/miarchivocomprimido
	@return {array:string|error} Un array con la lista de paths O el error de File API {code: 1}=>no existe

*/
function keys_file_zip_a(zip_path, cbOk, cbErr) {
	var [zip_pack_path, zip_member_path]= zip_path.split(/:/);
	window.requestFileSystem(PERSISTENT, 0, function (fs) {
		fs.root.getFile(zip_pack_path, {create: false}, function(fileEntry) {
			var fileUrl = fileEntry.toURL();
			zip.unzip_dir(fileUrl, cbOk);
		}, cbErr);
	}, cbErr);
}

/**
	Lee el directorio del zip.
	@param zip_path {string:zip_path} midir/miarchivo.zip:mipathadentro/miarchivocomprimido
	@return {array:string|error} Un array con la lista de paths O el error de File API {code: 1}=>no existe
	@function
*/
var keys_file_zip_p= toPromise_aOkErr(keys_file_zip_a);

/**
	Lee un archivo del zip

	Usa zip4j si está encriptado (más lento) y zip si no.

	@param zip_path {string:zip_path} midir/miarchivo.zip:mipathadentro/miarchivocomprimido
	@return {ArrayBuffer} con el contenido, se puede convertir a string con toString_arrayBuffer
*/
function get_file_zip_buf_a(zip_path, cbOk, cbErr) {
	var [zip_pack_path, zip_member_path]= zip_path.split(/:/);
	var pass= "PROBAME";
	window.requestFileSystem(PERSISTENT, 0, function(fs) {
		fs.root.getFile(zip_pack_path, {create: false}, function(fileEntry) {
			var fileUrl = fileEntry.toURL();
			if (pass!=null) { //XXX:cuando tenga pass
				zip.unzip_str_zip4j(fileUrl, pass, zip_member_path, (res, err) => (res===null ? cbErr({code: 1, txt: "missing zip member", path: "zip_path", extra: err}) : cbOk(res)));
			}
			else {
				zip.unzip_str(fileUrl, zip_member_path, res => (res===null ? cbErr({code: 1, txt: "missing zip member", path: "zip_path"}) : cbOk(res)));
			}
		}, cbErr);
	}, cbErr);
}

/**
	Lee un archivo del zip
	@param zip_path {string:zip_path} midir/miarchivo.zip:mipathadentro/miarchivocomprimido
	@return {Promise:ArrayBuffer} con el contenido, se puede convertir a string con toString_arrayBuffer
	@function
*/
var get_file_zip_buf_p= toPromise_aOkErr(get_file_zip_buf_a);

var get_file_zip_p= function(zip_path) { 
	return get_file_zip_buf_p(zip_path)
		.then( unArrayBuffer => ut.toString_arrayBuffer(unArrayBuffer) )
}
