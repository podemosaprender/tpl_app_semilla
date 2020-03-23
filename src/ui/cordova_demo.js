//PodemosAprender semilla OK

//============================================================
function scr_demo_vozytexto(my) {
	my.state= {
		idioma: 'es-AR',
		Mensaje: '',
	};

	function onAccionDictado() {
		if (speech_to_text_estaDictando()) { speech_to_text_stop(); }
		else {
			speech_to_text_p({lang: my.state.idioma})
			.then( textoNuevo => my.setState({Mensaje: my.state.Mensaje+' '+textoNuevo}));
		}
		my.refresh(); 
	}

	function onLeemeVos() {
		speech_from_text_p({text: my.state.Mensaje, lang: my.state.idioma});
	}

	my.render= function scr_demo_vozytexto_render() {
		return [
			{cmp: 'PaMenuYCerrar'},	
			my.forValue('Mensaje',{cmp: 'TextArea', style: {display: 'block', width: '100%'}, rows: 15}),
			my.toSet('idioma','es-AR',{children: {cmp: 'Flag', name: 'ar'}, toggle: true}),
			my.toSet('idioma','en-US',{children: {cmp: 'Flag', name: 'us'}, toggle: true}),
			{cmp: 'br'},
			{cmp: 'Button', onClick: onAccionDictado, children: speech_to_text_estaDictando() ? 'Detener dictado' : 'Comenzar dictado'},
			{cmp: 'Button', onClick: onLeemeVos, children: 'Leeme'},
			my.toSet('Mensaje','',{children: 'Limpiar'}),	
		];
	}	
}

function scr_demo_audio(my) {
	var src = "PodemosAprender.aac";
  var mediaRec;
	var monitorProc; //U: para el interval de duracion y volumen
	
	my.state= {
		msg: 'listo!',
	};

	var monitorT0;
	function monitorStart() {
		monitorStop();	
		monitorT0= Date.now();
		monitorProc= setInterval(() => {
			mediaRec.getCurrentAmplitude(r => { my.setState({vol: r, pos: (Date.now()-monitorT0)/1000}) });
			if (my.state.msg=='reproduciendo') { //A: solo actualiza mientras reproduce
				mediaRec.getCurrentPosition(r => { my.setState({pos: r}) });
			}
		},1000);
	}

	function monitorStop() {
		clearInterval(monitorProc);
	}

	function onRec() { 
		if (mediaRec) { mediaRec.release(); } //A: siempre liberar!

		mediaRec= new Media(src, 
			() => { my.setState({msg: 'completo'}); monitorStop(); }, 
			err => my.setState({error: err})
		);
  	mediaRec.startRecord();
		my.setState({msg: 'grabando'});
		monitorStart();
	}

	function onPlay() {
		if (mediaRec && (my.state.msg=='completo' || my.state.msg=='listo!')) {
			mediaRec.play();
			my.setState({msg: 'reproduciendo'});
			monitorStart();
		}
		else {
			my.setState({msg: 'primero hay que grabar'});
		}
	}

	function onStop() {
		my.setState({msg: 'listo!'});
		monitorStop();
		if (!mediaRec) return;
		if (my.state.msg=='grabando') { mediaRec.stopRecord(); }
		else { mediaRec.stop(); }
	}

	my.render= function scr_demo_audio_render() {
		return [
			{cmp: 'PaMenuYCerrar'},
			{cmp: 'br'},
			{cmp: 'div', children: my.state.msg},
			{cmp: 'div', children: 'Pos: '+ (my.state.pos || '0')},
			{cmp: 'div', children: 'Vol: '+ (my.state.vol || 0)},
			{cmp: 'Button', onClick: onRec, icon: 'radio', active: my.state.msg=='grabando'},
			{cmp: 'Button', onClick: onPlay, icon: 'play', active: my.state.msg=='reproduciendo'},
			{cmp: 'Button', onClick: onStop, icon: 'stop'},
		];
	}	
}

CachedMedia_= GLOBAL.CachedMedia_ || [];
function scr_demo_capture(my) {
	my.state= { media: CachedMedia_ };

	function onCaptute(k) {
		var curHash= location.hash;
		console.log("onCaptute empieza en "+curHash);
		capture_media_p(k)
		.then(res => {
			if (Array.isArray(res)) {
				res.forEach( e => my.state.media.unshift(e) );
			}
			console.log(res);
			setTimeout(() => {
				console.log(location.hash,curHash);
				if (location.hash!=curHash) { //A: la grabadora de audio me manda a cualquier lado
					console.log("Nos movimos!",location.hash, curHash);
					appGoTo(curHash.replace('#/',''))
				}
				else { my.refresh(); }
			},1000);
		});
	}

	my.render= function scr_demo_capture_render() {
		return [
			{cmp: 'PaMenuYCerrar'},
			{cmp: 'br'},
			['Audio','Image','Video'].map(k => (
				{cmp: 'Button', onClick: () => onCaptute(k), children: k}
			)),
			my.state.media.map( mf => (
				mf.type.startsWith("image") 
				? {cmp: 'Image', src: mf.fullPath, size: 'small'}
				: mf.type.startsWith("audio")
				? {cmp: 'audio', src: mf.fullPath}
				: {cmp: 'Embed', url: mf.fullPath}
			))	
		];
	}	
}

function scr_demo_barcode(my) {
	my.state= { code: 'todavía no escaneaste ninguno' }
	function onScan() {
		capture_barcode_p()
		.then( res => my.setState({code: ser_json(res,1)}) );
	}

	my.render= function scr_demo_barcode_render() {
		return [
			{cmp: 'PaMenuYCerrar'},
			{cmp: 'Button', onClick: onScan, children: 'Scan'},
			{cmp: 'pre', children: my.state.code}
		];
	}	
}

function scr_demo_links(my) {
	my.state= {
		Mensaje: '*Destacado*\n\nUn texto\nPuede tener varias lineas\n\n_Chau!_',
	};

	my.render= function scr_links_render() {
		return [
			{cmp: 'PaMenuYCerrar'},
			my.forValue('Tel',{fluid: true, placeholder: 'Tel +541122334455'}),
			my.forValue('Mensaje',{cmp: 'TextArea', style: {display: 'block', width: '100%'}, rows: 5}),
			{cmp: 'Button', href: link_whatsapp({dst: my.state.Tel, body: my.state.Mensaje}), color: 'whatsapp', children: [{cmp: 'Icon', name: 'whatsapp'},'WhatsApp']},
		];
	}	
}

function demo_copyToClipboard() {
	copyToClipboard('Lo copiaste a las'+new Date());
}

function demo_vibrate() {
	navigator.vibrate([200,100,200])
}

var demo_fun= Object.keys(GLOBAL).filter(k => (k.startsWith('demo_') || k.startsWith('scr_demo_'))); //U: nombre de todas las funciones demo

function scr_App(my) {
	my.render= function () {
		return {cmp: 'div', children: [
			{cmp: 'PaMenuYCerrar'},	
			{cmp: 'Container', textAlign: 'center', children: [
				{cmp: 'Markdown', style: {textAlign: 'left'}, children: `
# ¿Qué podés hacer con esta app?

Siempre podes volver a la [pantalla de configuración](#AppReload) para cargar lo que quieras.

Podes escribir texto con formato como este usando [Markdown](https://github.github.com/gfm/).

* Enviar mensajes por ej. [usando whatsapp](#/demo/links).
* Interactuar con tu voz y audio, por ej. [dictarle al movil](#/demo/vozytexto).
* Grabar y reproducir [audio desde esta app](#/demo/audio).
* Tomar y mostrar [fotos, audio, y video](#/demo/capture).
* Escanear [códigos de barras QR de productos](#/demo/barcode) (que también podés generar).
* Poner texto [en el portapapeles](#CALL:demo_copyToClipboard())) 
* Hacer [vibrar](#CALL:demo_vibrate()) el móvil como quieras, y llamar funciones desde el texto.
`
				},

				{cmp: 'Menu', vertical: true, fluid: true, children: 
					demo_fun.map(k => ({
						cmp: 'Menu.Item', 
						onClick: k.startsWith('demo_') ? GLOBAL[k] : fAppGoTo(k.replace('scr_','').replace('_','/')), 
						name: k.replace(/(scr_)?demo_/,'').replace(/_/g,' ')
					}))
				}
			]},
		]};
	}
}

