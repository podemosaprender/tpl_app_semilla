function cmp_Markdown(my) {
	my.render= function (props) {
		var txt= asArray(props.children||'').join('\n\n');
		return {cmp: 'Segment', dangerouslySetInnerHTML: { __html: marked(txt) }}	
	}	
}


document.body.style.background='#e0f2e9';
C_ROJIZO='#ad5d4e';
C_AZUL='#40476d';
//--826754--eb6534
C_TOOLBAR= C_AZUL;

CfgUrl= localStorage.CfgAppUrl;
CfgUseProxy= localStorage.CfgAppUrlUseProxy==null || localStorage.CfgAppUrlUseProxy=="true" ;

async function AppSrcDownload_p(url, useProxy) {
	var src= await mifetch(url,null,{asText:1, corsProxy: useProxy});
	if (src.startsWith("//PodemosAprender semilla OK\n")) { //A: todo bien
		var f;
		try { 
			var src2= xfrmJsToGlobals(src,url);
			console.log(src2); 
			f= Function( src2 ); 
			//A: no lanzo, no hay errores de sintaxis, etc. 

			CfgUrl= url; 
			CfgUseProxy= useProxy;

			localStorage.CfgAppUrl= url;
			localStorage.CfgAppUrlUseProxy= useProxy;
			localStorage.CfgAppSrc= src;
			//A: me guarde los valores aunque app inicie de nuevo

			return f;
		}
		catch (ex) {
			alert('ERROR: '+ex+' '+ex.stack);
		}
	}
	else {
			alert('ERROR: falta comentario al inicio:\n'+src.substr(0,80));
	}
	return null;
}


function scr_CordovaMain(my) {

	var counter= 10;
	var cntProcess; //U: para detener con clearInterval
	function counterStop() {
		logm("DBG",2,"COUNTER stop");
		clearInterval(cntProcess);
		cntProcess= null;
	}
	function counterStart() {
		counterStop(); //A: por las dudas!
		counter= 10;
		logm("DBG",2,"COUNTER start");
		cntProcess= setInterval(() => { 
			counter--; 
			logm("DBG",2,"COUNTER",counter);
			if (counter==0) { counterStop(); my.setState({quiereConfigurar: 'load'}) }; 
			my.refresh(); 
		}, 
		1000);
	}


	function uiFormCfg() {
		return {uiCfg: {cmp: 'Segment', textAlign: 'left', inverted: true, children: [
				{cmp: 'Header', children: 'Configurar'},	
				{cmp: 'Form', inverted: true, size: 'tiny', children: [
				{cmp: 'Form.Group', children: [
					my.forValue('Url',{width: 8, label: 'Url'}),
					my.forValue('UseProxy',{cmp: 'Checkbox', style: {margin: '10px'},label: 'Usar Proxy'}),
					my.forValue('user',{width: 2, label: 'Github User (opcional)'}),
					my.forValue('pass',{ type: 'password', width: 2, label: 'Pass (opcional)'}),
				]},
				{cmp: 'Container', textAlign: 'right', style: {marginTop: '10px'}, children: [
					my.toSet('quiereConfigurar',"load",{children: 'Ok'}),
					my.toSet('quiereConfigurar',false,{children: 'Cancelar'}),
				]},
			]}
		]}};
	}

	my.state= { Url: CfgUrl, UseProxy: CfgUseProxy }; //A: si teniamos una guardada de otro inicio, usar esa


	my.render= function (props,state) {
		var parts= {};
		if (!state.quiereConfigurar) { //DFLT
			parts.uiCfg= [ 
				my.toSet('quiereConfigurar',true,{children: 'Configurar'}),
			];

			if (state.Url) { 
				if (cntProcess==null) { counterStart(); }
				if (cntProcess) {
					parts.uiCfg.push(
						my.toSet('quiereConfigurar','load',{children: 'Iniciar'}),
						{cmp: 'div', style: {fontSize: '4em', lineHeight: '2em'}, children: counter},
					);
				}
			}
			else {
				parts.uiCfg.unshift({cmp: 'Markdown', children: `
## ¡ATENCIÓN!

Esta aplicación baja y ejecuta código de la _url_ que configures.
Ese código puede _escribir y leer_ datos de tu teléfono.
Solamente usala con código que escribiste vos o que revisaste.
`
				});
			}
		}
		else {
			counterStop();
			if (state.quiereConfigurar=='load') {
				console.log("LOAD",state);
				AppSrcDownload_p(state.Url,state.UseProxy).then( r => {
					if (r) { //A: bajo y parseo ok
						r(); //A: ejecutamos
						AppStart(null,true); //A: recalculamos rutas y reemplazamos app
					}
					else { //A: fallo
						my.setState({quiereConfigurar: true});
					}
				});	
				parts.uiCfg= [
					{cmp: 'Loader', active: true, inline: 'centered', children: 'Loading ...'},
					{cmp: 'p', children: state.Url},
					my.toSet('quiereConfigurar',"cancel",{children: 'Cancelar'}),
				];
			}
			else {
				parts= uiFormCfg();
			}
		}

		return [
			{cmp: 'PaMenu', inverted: true, style: { background: C_TOOLBAR }, items: ['img/logo.png', 'PodemosAprender Semilla']},
			{cmp: 'Container', textAlign: 'center', children: parts.uiCfg},
		];
	}
}
