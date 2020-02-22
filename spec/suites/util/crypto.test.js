describe('Crypto', () => {
	window.isInKarma= window.location.pathname==='/context.html';
	window.urlPfx= isInKarma ? '/base/' : '../'; 
	it('URL esperada', function () {
		expect(window.location.pathname).to.match(isInKarma ? new RegExp('/context.html$') : new RegExp('/spec/index.html$'));
	});

	it('Encriptar y desencriptar con clave', function (){
		var src= "esto es\nuna prueba\tñandú y cañadón\n";
		var pass= "la clave es ñandú";
		var cr= encrypt(src, pass);

		var src2= encrypt_r(cr, pass);
		expect(src2).to.be(src);
	});

	it('No aparecen datos legibles en la version encriptada', function (){
		var src= "esto es\nuna prueba\tñandú y cañadón\n";
		var pass= "la clave es ñandú";
		var cr= encrypt(src, pass);
		expect(cr).not.to.contain('prueba');
		expect(cr).not.to.contain('esto');
		expect(cr).not.to.contain('ñandú');

		var src2= encrypt_r(cr, pass);
		expect(src2).to.be(src);
	});

	it('Si encripto/desencripto muchos datos con la misma clave no calcula la salt cada vez', function (){
		var pass= "la clave es ñandú";
		var salt= genRandom_str(2);
		var t0= new Date();
		for (var i=0; i<1000; i++) {
			var src= "te lo cambio "+i+" como quieras";
			var cr= encrypt(src, pass, salt);
			var src2= encrypt_r(cr, pass);
			expect(src2).to.be(src);
		}
		expect(new Date()-t0).to.be.lessThan(4000);
	});
});
