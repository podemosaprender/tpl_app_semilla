describe('LogM', () => {
	window.isInKarma= window.location.pathname==='/context.html';
	window.urlPfx= isInKarma ? '/base/' : '../'; 
	it('URL esperada', function () {
		expect(window.location.pathname).to.match(isInKarma ? new RegExp('/context.html$') : new RegExp('/spec/index.html$'));
	});

	it('Escribe a la consola un objeto', function (){
		var save_console= console;
		try {
			var logh= [];
			console= {log:function (que) { logh.push(que) } };
			RedMovil.LogLvl.Max= 1;
			RedMovil.logm("DBG", 1, "Probando", {a:1});
			expect(logh[0]).to.equal('LOG:DBG:1:Probando:{"a":1}');
		} finally { 
			console= save_console;
			console.log('CONSOLE RESTORED');
		};
	});
});
