/**
	@file Encriptar y desencriptar compatible con java

	ver rt_java_src/src/t/crypto-js-compat

	@module util/crypto


*/

/**
	Cacheamos la ultima key por si tiene la misma salt, porque es la operacion más lenta
*/
var key_last_;
var key_salt_and_pass_last_;

/**
	Genera una clave más segura que el algoritmo por defecto de CryptoJs apartir de una passphrase
	@link https://stackoverflow.com/questions/35472396/how-does-cryptojs-get-an-iv-when-none-is-specified
	
	@param passprhase {string} la clave memorable que escriben los usuarios
	@param salt {integer} numero al azar para que la misma passphrase (corta y poco aleatoria) no de encriptaciones parecidas
	@param keySize {integer} el largo en bits de la clave, más laro es más seguro pero más lento
	@param iterationCount {integer}

*/
function genKey(passphrase, salt, keySize=128, iterationCount= 1000) {
	if (key_salt_and_pass_last_==(salt+passphrase)) { return key_last_ }
	//A: si estaba cacheada, la devolvi
	key_salt_and_pass_last_=(salt+passphrase);
	//A: registro cual cachee para chequear si me piden la misma

  var key = CryptoJS.PBKDF2(
      CryptoJS.enc.Utf8.parse(passphrase), 
      CryptoJS.enc.Hex.parse(salt),
      { keySize: keySize, iterations: iterationCount });

	key_last_= key;
	//A: generé y guarde en cache
  return key;
}

/**
	Genera bytes al azar ej. para el initVector
	@param size {integer}
	@return {array} bytes al azar
*/
function genRandom_arr(len) {
	return CryptoJS.lib.WordArray.random(len);
}

/**
	Genera bytes al azar ej. para el initVector
	@param size {integer}
	@return {string} bytes al azar en hex
*/
function genRandom_str(len) {
	return genRandom_arr(len).toString();
}


/**
	Implementación de encriptar, con todos los parametros explícitos
	Como la operacion de generar una clave es muy lenta, se puede pasar una previamente generada O si se usa la misma salt se cachea

	@param plainText {string} el texto a encriptar
	@param passprhase {string} la clave memorable que escriben los usuarios
	@param salt {string_hex} número al azar para que la misma passphrase (corta y poco aleatoria) no de encriptaciones parecidas
	@param iv {string_hex_16bytes} valores para inicializar el algoritmo y que el mismo texto no se encripte igual todas las veces facilitando que se descubra la clave
	@param wantsParams {boolean} incluir la salt y el iv en el output (necesario si no los pasaste como parametro y se generaron en la misma llamada)
	@return {string} el texto encriptado
*/
function encrypt_impl(plainText, passphrase_or_key, salt, iv, wantsParams) {
	var t0= new Date();

	var iv= iv || genRandom_str(8); 
	var tIv= new Date();

	var salt; 
  var key = typeof(passphrase_or_key)=="string" ? 
	             genKey(passphrase_or_key, salt = salt || genRandom_str(2)) : 
	             passphrase_or_key;
	var tKey= new Date();

  var encrypted = CryptoJS.AES.encrypt(
      plainText,
      key,
      { iv: CryptoJS.enc.Hex.parse(iv) });

	//DBG: logm("DBG",1,"encrypt_impl dt",{enc: new Date()- tKey, key: tKey- tIv, iv: tIv - t0});
	
  return (wantsParams ? salt+iv : '') +
		encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

/**
	Implementación de desencriptar, con todos los parametros explícitos

	@param cipherText {string} el texto a encriptar
	@param passprhase {string} la clave memorable que escriben los usuarios
	@param salt {integer} número al azar para que la misma passphrase (corta y poco aleatoria) no de encriptaciones parecidas
	@param iv {string_16bytes} valores para inicializar el algoritmo y que el mismo texto no se encripte igual todas las veces facilitando que se descubra la clave
	@return {string} el texto desencriptado
*/
function encrypt_r_impl(cipherText, passphrase, salt, iv) {
  var key = genKey(passphrase, salt);
  var cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(cipherText)
  });
  var decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      key,
      { iv: CryptoJS.enc.Hex.parse(iv) });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
	Encriptar con passphrase (clave de texto que pone el usuario)
	@param plainText {string} el texto a encriptar
	@param passprhase {string} la clave memorable que escriben los usuarios
	@return {string} el texto encriptado
*/
function encrypt(plainText, passphrase_or_key, salt) {
	return encrypt_impl(plainText, passphrase_or_key, salt, null, true);
}

/**
	Desencriptar con passphrase (clave de texto que pone el usuario)
	es la inversa de [encrypt](#encrypt)

	@param cipherText {string} el texto encriptado
	@param passprhase {string} la clave memorable que escriben los usuarios
	@return {string} el texto desencriptado
*/
function encrypt_r(cipherText, passphrase) {
	var salt= cipherText.substr(0,4);
	var iv= cipherText.substr(4,16);
	var t= cipherText.substr(20);
	return encrypt_r_impl(t, passphrase, salt, iv, true);
}

