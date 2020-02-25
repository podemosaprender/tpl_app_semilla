//INFO: copiar archivos necesarios para desplegar como sitio statico

CFG_OUT_DIR= 'x_build/static_html';

fs= require('fs');
shell= require('shelljs');

function ensureDir(rutaCarpetaSegura) { //U: crea el dir rutaCarpetaMision y todos los necesarios para llegar ahi
	fs.mkdirSync(rutaCarpetaSegura, {recursive: true});
}

ensureDir(CFG_OUT_DIR);

cfg= require(__dirname+'/package.json');
cfg.pkg.assets.forEach(a => {
	var d= a.replace(/^\//,'').replace(/\*.*/,''); //A: si era un dir tipo mis_fuentes/** alcanza con mis_fuentes/
	var dst= CFG_OUT_DIR+'/'+d;
	dst= dst.replace(/[^\/]*\/?$/,''); 
	console.log('from '+a+' to '+d+' dir '+dst);
	ensureDir(dst); 
	shell.cp('-rf',d,dst);
});
shell.mv('',CFG_OUT_DIR+'/src/ui/*',CFG_OUT_DIR);
shell.mv('',CFG_OUT_DIR+'/src/lib',CFG_OUT_DIR);
shell.rm('-rf',CFG_OUT_DIR+'/src');

