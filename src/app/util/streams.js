/**
	@file streams y funciones asociadas para rangos, listas de tiles, etc.
	@module util/streams
*/


/**
	Un stream de enteros, puede ser infinito	
	@param min  {int} - número inicial
	@param max  {int|null} - número final (o es infinito)
	@param step {int} - paso
	@return stream:int
*/
function range_st(min = 0 ,max = null,step = 1) {
	var cnt= min; 
	var done= false;
	return _((push,next) => { 
		if (done) { return }	
		else if (max==null || cnt<max) { push(null,cnt); cnt= cnt + step; next();} 
		else { done= true; push(null,_.nil); }
	});
}

/**
	Devuelve el proximo elemento de un stream como promesa.
	El stream se puede seguir consumiendo
*/
function next_st_p(st) {
	return new Promise(onOk => st.pull((err,v) => onOk(v)));
}

/**
	Para que devuelva una promesa una función que espera un callback
  como último parametro
*/
function toPromise_a1(f_a) { 
	var r= function (...args) { 
		var that= this;
		return new Promise(function (resolve, reject) {
			args.push(function (...res) { resolve.apply(null,res); });
			f_a.apply(that, args);
		});
	};
	r.wrapped_fn= f_a;
	return r;
}

/**
	Para que devuelva una promesa una función que espera dos callback
  (onOk, onErr) como último parametro
*/
function toPromise_aOkErr(f_a) { 
	var r= function (...args) { 
		var that= this;
		return new Promise(function (resolve, reject) {
			args.push(function (...res) { resolve.apply(null,res); });
			args.push(function (...res) { reject.apply(null,res); });
			f_a.apply(that, args);
		});
	}

	r.wrapped_fn= f_a;
	return r;
}
