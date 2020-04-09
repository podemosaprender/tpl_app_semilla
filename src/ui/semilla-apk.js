//INFO: generar un apk subiendo un zip con js, html y css a nuestro servidor

//------------------------------------------------------------
//S: conversacion con el servidor, independiente de la UI, se puede probar de la consola

SEMILLA_APK_URL='https://semilla-apk.herokuapp.com'; //U: url del servidor
//SEMILLA_APK_URL='http://localhost:8090'; //U: url pruebas locales

//U: el servidor acepta solo dos requests: 

//1: subis un .zip con tus fuentes, te contesta un "path" que va a tener tu .apk para bajarlo
// curl -F 'data=@/tmp/app.zip' -F 'pipe=FormParams' -F 'cmd=fromZip' "$HOST/app/cx/fromZip" | tee x.out ; X=`cat x.out`; X=${X##*path\":\"}; X=${X%%\"*} #subir zip con fuentes

//2: podes preguntar si ya esta listo, en la respuesta la clave apk te dice que si, la clave src cuanto te falta
// curl "$HOST/app/cx/stsFor?pipe=FormParams&cmd=stsFor&path=$X"

APKSRV_STATUS_POLL_DT= 2*1000; //U: cada cuanto consultar al servidor si ya esta listo (ms)

apkData= null; //U: ultima respuesta del servidor
apkSrcFile= null; //U: me lo guardo para debug/probar desde la consola
function apksrvRestorePersistent() { //U: si hubo un reload, ver lo ultimo que subimos
	apkData= get_persistent("apksrv_data");
}

function apksrvCallAndUpdate(data,wantsPersistent,cb) { //U: actualiza el estado segun evento de mihttprequest
	data.pipe= "FormParams";
	mihttprequest_p(SEMILLA_APK_URL+'/app/cx/', data)
		.then( r => { 
			//DBG console.log("XUP",r); 
			var res= ser_planoOjson_r(r.target.responseText); 
			if (res.src || res.apk) { 
				apkData= Object.assign(apkData,res); 
				wantsPersistent && set_persistent("apksrv_data",apkData);
			}
			console.log("apksrv res",apkData);
			cb(apkData,res)
		})
		.catch( x => { 
			//DBG console.error("XUP",x); 
			cb(null, x) 
		})
}

function apksrv1uploadZip(fileData, wantsPersistent, cb) { //U: paso1: subir el zip (en fileData)
	apkData= null; //A: los datos viejos ya no valen
	apkSrcFile= fileData; //A: me lo guardo para probar de consola
	var data= {};
	data.data= fileData;
	data.cmd= "fromZip";
	apkData= {srcName: apkSrcFile.name, upload_t: Date.now()}; //A: guardamos por si hace reload
	wantsPersistent && set_persistent("apksrv_data",apkData);
	apksrvCallAndUpdate(data, wantsPersistent, cb);
}

function apksrv2statusQuery(cb, wantsPersistent) { //U: consulta el estado UNA vez
	console.log("apksrv2statusQuery",apkData);
	if (!apkData || !(apkData.src || apkData.apk)  ) { cb(null,'NO_DATA'); return } //A: nada para consultar, termino o no hay datos

	var data= {
		cmd: "stsFor",
		path: apkData.src.path,
	};
	apksrvCallAndUpdate(data,wantsPersistent,cb);
}

//S: checkear periodicamente si ya esta listo el .apk para bajar
ApkSrvStatusPollCtl_= null; //U: para detener el interval
function apksrvStatusPollStop() {
	clearInterval(ApkSrvStatusPollCtl_);
	ApkSrvStatusPollCtl_= null;
}

function apksrvStatusPollStart(cb, wantsPersistent, wantsAfterApk, forceRestart) { //A: para empezar a consultar periodicamente el servidor
	if (ApkSrvStatusPollCtl_ && !forceRestart) { return } //A: ya estaba
	apksrvStatusPollStop(); //A: si ya habia uno, lo detenemos
	ApkSrvStatusPollCtl_= setInterval(()=> {
		if (!wantsAfterApk && get_p(apkData,"{apk")) { apksrvStatusPollStop(); }	
		else { apksrv2statusQuery(cb, wantsPersistent); }
	}, APKSRV_STATUS_POLL_DT);
}

//------------------------------------------------------------
function instrucciones_ui() {
	return {cmp: 'Markdown', children: `
Podés crear una aplicación android con sólo subir un archivo .zip 

1. Editá en una carpeta de tu computadora los archivos javascript, html, css, imágenes, etc. que quieras mostrar en tu aplicación.  
Para que te sea más fácil la aplicación ya incluye todo lo que está en la [semilla estática](https://github.com/podemosaprender/tpl_app_semilla_estatico). Podés empezar simplemente modificando el archivo cordova_main.js.
2. Comprimí los archivos que modificaste o agregaste en un .zip
3. Subilo con el botón que te ofrece está pagina.
4. Un par de minutos después aparecerá un link para que bajes tu paquete instalador .apk
`}
}

function apkStatus_ui(isUploading) { //U: muestra el status del apk
	var r= [];
	if (apkData)  {

		var buildInfo= (apkData.src || apkData.apk);
		var apkUrl= buildInfo && SEMILLA_APK_URL+'/'+buildInfo.path;
		var apkLink= buildInfo && {cmp: 'a', children: 'aquí', href: SEMILLA_APK_URL+'/'+buildInfo.path, target: '_blank'};

		if (apkData.apk) {
			r.push(['Tu aplicación ya está lista para descargar ',apkLink]);
		}
		else if (apkData.src) {
			r.push([ 'Tu apk se está construyendo. Hay '+ apkData.src.q +' antes que el tuyo en la fila.	Lo vas a poder descargar de ', apkLink]);
		}

		r.push(	
			isUploading	
				? 'Se está subiendo tu archivo '+apkData.srcName
				: 
				(apkData.src || apkData.apk)
				? 'Tu archivo '+apkData.srcName+' se subió '+new Date(apkData.upload_t)
				: 'No sabemos si tu archivo '+apkData.srcName+' se subió'
		);
	}
	return r.map(p => ({cmp: 'Message', children: p}))
}

ErrorToText= {
	'NO_DATA': 'Rententá por favor, no sabemos si tu archivo se subió',
}

apkSrcFileNameLast='';
function scr_semillaApk(my) {
	function handleBuildStatus(data,maybeError) {
		if (maybeError) { 
			var errorMsg= null;
			if (typeof(maybeError)=='object') {
				if (!data) { errorMsg= 'Error conectando al servidor'};
			}
			else {
				errorMsg= ErrorToText[maybeError] || maybeError;
			}
			if (errorMsg) {
				apksrvStatusPollStop();
				my.setState({error: errorMsg});
			}
		} 
		else if (data) {
			if (my.state.isUploading) { //A: si estaba subiendo, pedir mas updates
				apksrvStatusPollStart(handleBuildStatus,true);
			}
			my.setState({error: null});
		}
		my.setState({isUploading: false}); //A: siempre es verdad que terminamos de subir
		my.refresh();
	}

	function pollBuildStatus() {
		if (!apkData.apk) { //A: subio pero no consiguio apk
			apksrvStatusPollStart(handleBuildStatus,true); 
		}
	}

	my.componentWillMount= function () { 
		apksrvRestorePersistent(); 
		if (apkData) { //A: no es la primera vez
			if (apkData.src || apkData.apk) { pollBuildStatus(); }
			else { my.state.error= ErrorToText['NO_DATA']; }
		}
		else { my.state.wantsInstructions= true; }//A: si nunca uso
	}

	my.render= function () { //DBG: console.log("semillaApk render",XX=my);
		var srcName= get_p(my,"{state{data[0{name");
		if (srcName && srcName != apkSrcFileNameLast) { apkSrcFileNameLast= srcName;
			console.log("Subir archivo nuevo",srcName);
			my.setState({isUploading: true, error: null});
			apksrv1uploadZip(my.state.data[0], true, handleBuildStatus); //U: subir, guardar apkData persistente
		}

		return [
			{cmp: 'PaMenuYCerrar'},	

			{cmp: 'Container', 'aria-live': 'polite', as: 'div', children: [
				my.state.wantsInstructions && instrucciones_ui(),
			]},
			{cmp: 'Container', 'aria-live': 'polite', children: [
				my.state.error && {cmp: 'Message', negative: true, children: my.state.error},
				apkStatus_ui(my.state.isUploading),
			]},

			{cmp: 'Container', style: 'padding: 10px', children: [
					{cmp: 'Button', onClick: ()=> (my.file_cmp.click()), children: 'Subir nuevo .zip', floated: 'right'},	
					my.forValue('data',{cmp:'InputFile', accept: '.zip', cref: fRef('{file_cmp',my)}),

					my.state.wantsInstructions ||  my.toSet('wantsInstructions',true,{children: 'Leer instrucciones', floated: 'right'}),
			]},

		];
	}
}
