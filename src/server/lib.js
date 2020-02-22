//INFO: funciones comunes lado servidor

var fs= require('fs');

function ensureDir(rutaCarpetaSegura) { //U: crea el dir rutaCarpetaMision y todos los necesarios para llegar ahi
	fs.mkdirSync(rutaCarpetaSegura, {recursive: true});
}

module.exports={ ensureDir };

