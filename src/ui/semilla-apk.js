SEMILLA_APK_URL='https://semilla-apk.herokuapp.com';
SEMILLA_APK_URL='http://localhost:8090';

//------------------------------------------------------------
function readInputFile(file, fmt, cb) { //U: lee un archivo de un input file
	reader = new FileReader();
	reader.onload= function (revt) {
		cb(revt.target.result);
	};
	if (fmt=='bin') { reader.readAsBinaryString(file); }
	else { reader.readAsText(file); }
};

var IdCnt= 0;
function BtnFiles({children, ...props}) { //U:boton para subir archivos
	var id= 'filein'+(IdCnt++);

	function onData(e) {
		console.log('BtnFiles',id,e);
		props.onData(e.target.files, readInputFile);
	}

	return h('div',{style:'display: inline-block;'},
		h('input',{onChange: onData, type:'file', id: id, name: id, accept: props.accept||'*', 'class':'inputfile'}),
		h('label',{style:'width: auto;', 'for': id, 'class': BotonArribaClass}, children),
	);
}

function cmp_InputFile(my) {
	function onChange(e, props) {
		 my.setState({file: e.target.files ? e.target.files[0].name : ''});
		 props.onChange(e);
	}

	my.render= function(props) {
		return [
				{ cmp: 'Form.Input',
					fluid: true,
					value: my.state.file,
					action: {
						//content: props.content || "Choose File",
						labelPosition:"right",
						icon: "file",
						onClick: () => my.fileInputRef.click(),
					}, 
					actionPosition: 'right',
					placeholder: props.content,
					label: props.content,
					error: props.error,
				},
				{
					cmp:'input',
					accept: props.accept,
    			ref: r => (my.fileInputRef=r),
    			type:'file',
    			hidden: true,
					onChange: e => onChange(e,props),
 				},
		]; 
	}
}

//------------------------------------------------------------
function mirequest(url,data,opts) {
	var logk= 'request '+(opts.k||'')+' '+url;

	var formData= new FormData();
	Object.keys(data).forEach(k => formData.append(k, data[k]));

	var request= new XMLHttpRequest();
	setTimeout(() => {
	request.onprogress= opts.onprogress || (e => console.log(logk+" progress",e));
	request.onload= opts.onload || (e => console.log(logk+ "load",e));
	request.onabort= opts.onabort || (e => console.log(logk+" abort",e));
	request.open(opts.method || "POST", url);
	request.send(formData);
	},100); //A: actualizar ui
	return request;
}

function mirequest_p(url,data,opts) {
	return new Promise( (onOk, onErr) => mirequest(url, data, {...opts, onload: onOk, onabort: onErr}));
}

//------------------------------------------------------------
FileSty= { width: '0.1px', height: '0.1px', opacity: '0', overflow: 'hidden', position: 'absolute', zIndex: '-1', };

function scr_semillaApk(my) {
	var apkUrlChk= '';
	var apkUrlChkProc= null;
	var apkData= null;

	my.render= function () {
		console.log(XSTATE=my.state);
		act= my.state.act || '';

		var errors= [];
		var data= {
				pipe: "FormParams",
		};
		['app','usr'].forEach(k => {
			data[k]= (my.state[k]||'').trim();
			if (act!='' && !data[k]) { errors.push(k+' no puede ser vacío'); }
		});

		apkUrl= SEMILLA_APK_URL + '/xapk/'+ my.state.usr + '/' + my.state.app + '.apk';
		if (apkUrl!=apkUrlChk) {
			apkData= null; //A: la que teniamos ya no vale
 			if (!apkUrlChkProc) { 
				apkUrlChkProc= setTimeout(() => {
					apkUrlChkProc= null;
					apkUrlChk= apkUrl;
					var data= {
						pipe: "FormParams",
						cmd: "hasApk",
						app: my.state.app,
						usr: my.state.usr,
					};
					mirequest_p(SEMILLA_APK_URL+'/app/cx',data)
					.then(x => {
						var res= x.target.responseText;
						console.log("apkUrlCheck",res);
						apkData= ser_json_r(res);
						my.refresh();
					});
				},1000);
			}
		}

		if (act=='1up' && errors.length==0) {
			if (my.state.data==null || my.state.data.length<1) {
				errors.push('Debe elegir un zip con los archivos para la aplicación');
			}
			else {
				my.setState({'act': 'wait_up'});

				data.data= my.state.data[0];
				data.cmd= "fromZip";
				data.pipe= "FormParams";

				mirequest_p(SEMILLA_APK_URL+'/app/cx/', data)
				.then( () => my.setState({'act':'2to_build'}) )
				.catch( () => my.setState({'act':'1to_src'}) )
			}
		}
		else if (act=='2build' && errors.length==0) {
			my.setState({'act': 'wait_build'});
			data.cmd= "fromZipBuild";

			mirequest_p(SEMILLA_APK_URL+'/app/cx/', data)
			.then( () => my.setState({'act':'3to_dld'}) )
			.catch( () => my.setState({'act':'2to_build'}) )
		}

		console.log("XXX",apkData);
		var btn= [
			my.toSet('act','1up',{cmp: 'Step', children: 'Subir fuentes', completed: act[0]>'1'}),
			my.toSet('act','2build',{cmp: 'Step', children: 'Construir apk', completed: act[0]>'2', disabled: !(act[0]>='2')}),
			my.toSet('act','3dld',{cmp: 'Step', children: 'Descargar apk', href: apkData && SEMILLA_APK_URL+'/'+apkData.path, disabled: !(act[0]>='3')}),
		];

		return [
			{cmp: 'PaMenuYCerrar'},	
			{cmp: 'Segment', children: [
				{cmp: 'Dimmer', active: act.startsWith('wait'), children: {cmp: 'Loader', children: 'Procesando'}},
				{cmp: 'Form', children: [
					my.forValue('usr',{label: 'Usuario', error: !(act=='' || my.state.usr>'')}),
					my.forValue('app',{label: 'App', error: !(act=='' || my.state.usr>'')}),
					my.forValue('data',{cmp:'InputFile', accept: '.zip', content: 'Fuentes www', error: !(act=='' || my.state.data!=null)}),
					errors.length ? {cmp: 'Message', negative: true, children: errors.map(e=> ({cmp:'p',children: e}))} : null,
					(apkData && apkData.fh) ? {cmp: 'Message', children: ['Existe un ',{cmp: 'a', children: 'apk previo', href: SEMILLA_APK_URL+'/'+apkData.path, target: '_blank'}, ' del ', new Date(apkData.fh)+'']} : null,

					{cmp: 'Container', textAlign: 'right', style: {marginTop: '10px'}, 
					 children: {cmp: 'Step.Group', ordered: true, children: btn}}
				]},
			]}
		];

	}
}
