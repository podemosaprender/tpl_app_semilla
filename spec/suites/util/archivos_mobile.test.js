describe('Leer y escribir archivos', () => {
	logm= function(a, b, c, d){ console.log('LOGM', a, b, c, d) };
	var CfgStorageQuota= 500*1024*1024;
	var directorio= 'devel/';
	
	before(function() {
		RedMovil.localStorageRequestQuota_p(CfgStorageQuota);
	});

	after(function(){
		RedMovil.deleteAll_dir_p(directorio, true);
	});

	it('Escribe y lee un archivo y su dir', async function (){
			await RedMovil.ensure_dir_p(directorio);

			var archivo= 'x_test_escribir.txt';
			var texto= 'Anduvo?';
			var t0= new Date();
			await RedMovil.set_file_p(directorio+archivo, texto);

			var leyo= await RedMovil.get_file_p(directorio+archivo, 'txt');
			expect(leyo).to.eql(texto);
			
			var meta= await RedMovil.get_meta_p(directorio+archivo);
			window.x= meta;
			expect(meta.size).to.eql(7);
			expect(t0 - meta.modificationTime).to.be.below(2000);

			var lista= await RedMovil.keys_file_p('devel');
			expect(lista[0].name).to.eql(archivo);
			expect(lista[0].isDirectory).to.eql(false);
			//XXX:Revisar fullPath
	});
	//XXX: Probar todos los casos donde no existe el archivo, no se escribio, etc.
});
