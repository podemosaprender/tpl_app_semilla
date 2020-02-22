describe('MobileZip', () => {
	before(function() {
		if (! window._cordovaNative) {
			this.skip();
		}
	});

	it('Can read ZipDir', function (done){
			RedMovil.keys_file_zip_p('devel/test.zip')
			.then(function (que) {var err;try{

					expect(que).to.eql(["data/", "data/1k_B.txt", "data/100k_E.txt", "data/1k_A.txt", "data/100k_C.txt", "data/100k_D.txt", "data/10k_A.txt", "data/100k_F.txt", "data/1k_C.txt", "data/100k_B.txt", "data/100k_A.txt", "data/100k_G.txt"]);

				}catch(ex){err=ex}done(err);
			});
	});

	it('read ZipDir rejects if no zip file', function (done){
			RedMovil.keys_file_zip_p('devel/ESTONOEXISTEAJHSJtest.zip')
			.then(function (que) {var err;try{
					err= new Error("Zip inexistente pero entro en rama then");
				}catch(ex){err=ex}done(err);
			})
			.catch(function (que) {var err;try{
					expect(que).to.have.property('code', 1); //A: cordova File API
				}catch(ex){err=ex}done(err);
			})
	});

	it('Can read Zip File', function (done){
			RedMovil.get_file_zip_p('devel/test.zip:data/1k_A.txt')
			.then(function (que) {var err;try{
					var s= RedMovil.toString_arrayBuffer(que);
					expect(s.length).to.be(1001);
					expect(s).to.match(/^A[0-9]+Z\n$/);

				}catch(ex){err=ex}done(err);
			});
	});

	it('Read Zip File rejects if zip does not exist', function (done){
			RedMovil.get_file_zip_p('devel/testESTONOEXSTYTQ.zip:data/1k_A.txt')
				.then(function (que) {var err;try{
						throw new Error("ERROR Zip inexistente pero entro en rama then");
					}catch(ex){err=ex}done(err);
				})
				.catch(function (que) {var err;try{
						expect(que).to.have.property('code', 1);
					}catch(ex){err=ex}done(err);
				});
				
	});

	it('Read Zip File rejects if member file does not exist', function (done){
			RedMovil.get_file_zip_p('devel/test.zip:data/EstENoaExiste1k_A.txt')
				.then(function (que) {var err;try{
						throw new Error("ERROR Zip miembro inexistente pero entro en rama then");
					}catch(ex){err=ex}done(err);
				})
				.catch(function (que) {var err;try{
						expect(que).to.have.property('code', 1);
					}catch(ex){err=ex}done(err);
				});
	});
});
