//INFO: punto de entrada de la parte que se ejecuta en la web

document.title='PodemosAprender Radio';

//------------------------------------------------------------
//S: mover a lib
//------------------------------------------------------------

//------------------------------------------------------------
//S: app RADIO, api
//------------------------------------------------------------
function pathATitulo(k) { //U: separa ej "20200130_acordateDeMi" en fecha y titulo con espacios
  var partes= k.split('_');
	var titulo= 'Sin título'; //DFLT
	if (partes.length>1) { //A: si habia texto para el titulo
  	var enCamel= partes[1][0].toUpperCase()+partes[1].slice(1); //A: la primera en mayuscula, el resto como este
  	titulo= enCamel
			.replace(/([A-Z]*)/g,function (ignore,mayusculas) { return mayusculas.split('').join(' '); }) //A: separa mayusculas seguidas, meteles espacio en el medio
			.replace(/([a-z])([A-Z])/g,function (ignore,ult,pri) { return ult + " "+pri}); //A: cada vez que encuentro minuscula seguida de mayuscula, separo y pongo espacio
	}

	var fecha= partes[0].replace(/(\d\d\d\d)(\d\d)(\d\d)/,"$3/$2/$1");
  return {titulo: titulo, fecha: fecha};
}

RADIO_URL='http://www.podemosaprender.org/data_radio_1';
RadioIdxMain= null; //DFTL U: el indice principal
RadioIdxMes= null; //DFLT U: el indice para un mes=una entrada del principal
RadioIdxMesK= null; //DFLT U: el mes que tengo cargado

async function radioIdxMain(wantsReload) {
	if (RadioIdxMain==null || wantsReload) {
		var s= await fetch(RADIO_URL+'/index.txt?'+Date.now()).then(res => res.text());
		RadioIdxMain= s.split('\n').filter(s=>s!=''); //TODO: error check
	}
	return RadioIdxMain;
}
async function radioIdxMes(mes, wantsReload) {
	if (RadioIdxMes==null || RadioIdxMesK!=mes || wantsReload) {
		var s= await fetch(RADIO_URL+'/index/'+mes+'.txt?'+Date.now()).then(res => res.text());
		RadioIdxMes= s.split('\n').filter(s=>s!=''); //TODO: error check
		RadioIdxMesK= mes;
	}
	return RadioIdxMes;
}

function radioFnameToUrl(fname) {
	var m= fname.match(/^([0-9a-zA-Z]+)(.*)$/);
	var pfx= m[1];
	var r= pfx.substr(0,6)+'/'+pfx+'/'+fname;
	return r;
}

function radioIdxDiaUrl(dia) {
	return RADIO_URL+'/audio/'+radioFnameToUrl(dia+'.msg.json');
}

ProgramaUrl= null;
ProgramaData= null;
ProgramaMedia= null;
function radioPrograma(url) {
	if (ProgramaUrl!=url) { ProgramaUrl=url;
		ProgramaData= null;
		ProgramaMedia= null;
		console.log("Radio loading Programa="+ProgramaUrl+" media="+ProgramaMedia);
		return fetch('https://cors-anywhere.herokuapp.com/'+ProgramaUrl).then(res => res.json())
			.then(data => { 
				console.log("Programa data",data);
				ProgramaData= data; 
				ProgramaMedia= ['audio/c_in.ogg'];

				ProgramaData.forEach(d => {
					if (d.audio) { ProgramaMedia.push(d.audio); }
					else if (d.video) { ProgramaMedia.push(d.video); }
				});	

				ProgramaMedia.splice(2,0,'https://www.youtube.com/watch?v=EzKImzjwGyM');

				ProgramaMedia.push('audio/c_out.ogg');
				console.log("Radio loaded Programa="+ProgramaUrl+" media="+ProgramaMedia);
			});
	}
	else {
		console.log("Radio have Programa="+ProgramaUrl+" media="+ProgramaMedia);
	}
}

//------------------------------------------------------------
//S: app RADIO, pantalla
//------------------------------------------------------------
//============================================================
function cmp_programa(my) { //U: escuchar la radio, un programa, radio/miprograma
	var wantsPlay= false;
	var mediaIdx= 0;
	var audioDone= false;
	var indexLoaded= false;

	function audioOnLoadedMetadata(e) {
		wantsPlay= true;
		//audioDuration: e.target.duration, 
		//TODO: no puedo cambiar estado en este evento porque vuelve a hacer render, y elemento de audio pierde estado, carga de nuevo, etc.
	}

	function audioOnEnded() {
		if (mediaIdx<ProgramaMedia.length-1) { mediaIdx++; }
		else { audioDone= true; }
		my.refresh(); //A: redibujar
	}

	function volverAEscuchar() {
		wantsPlay= true;
		mediaIdx= 0; audioDone= false;
		my.refresh();
	}
	
	my.render= function (props, state) { 
		//DBG: console.log("render", props, state);
		var p= radioPrograma(props.url);
		if (p) { //A: esta cargando datos
			mediaIdx= 0; //A: reiniciar por que programa vamos
			p.then(()=> my.refresh()); 
		} 

		var contenido= 'Cargando programa ...'; //DFLT
		var style= {width: '80%', maxWidth: '640px'};
		var styleHdr= { ...style, height: '3em', marginBottom: '5px', marginLeft: 'auto', marginRight: 'auto'}

		if (ProgramaMedia) { //A: si ya cargamos la lista de media
			if (audioDone) { //A: se termino el ultimo
				contenido= cmpGroup([
					{cmp: 'div', children: [
						{cmp: 'Button', onClick: volverAEscuchar, content: 'Volver a escuchar', icon: 'repeat', floated: 'right', labelPosition: 'right'},
					], style: styleHdr},
					{cmp: 'img', 
						src: 'img/portada.jpg',	
						style,
					},
				]);
			}
			else { //A: quedan para escuchar

				var url= ProgramaMedia[mediaIdx];
				var titulo= "(" + (mediaIdx+1) + "/" + ProgramaMedia.length+") "+url;

				var player; //U: componente para este tipo de audio
				var youtubeUrl= url.match(/youtu.?be/) && (url.match(/v=([^&]+)/))[1];
				if (youtubeUrl) { //A: es youtube
					player= cmp({cmp: 'youtube', onEnded: audioOnEnded, autoplay: wantsPlay,  video: youtubeUrl, width: '80%', style})
				}
				else { //A: es audio
					var audioUrl= url;
					if (! (audioUrl.match(/^http/) || audioUrl.match(/^audio\//))) {
						audioUrl= ProgramaUrl.match(/^https?:\/\/[^\/]+\/[^\/]+/)[0] + '/audio/' + radioFnameToUrl(audioUrl);
					}

					var style= {width: '80%', maxWidth: '640px'};
					player= cmpGroup([
						{	cmp: 'img', 
							src: 'img/portada.jpg',	
							style,
						},
						{cmp: 'br'},
						{	cmp: 'audio',
							src: audioUrl, 
							onEnded: audioOnEnded, 
							onLoadedmetadata: audioOnLoadedMetadata, 
							autoplay: wantsPlay,
							style,
						}
					])
				}
				//A: tengo el player correcto
				
				contenido= cmpGroup([
					{cmp: 'div', id:'titulo', children: [ 
						wantsPlay  	
							? {cmp: 'Button', onClick: audioOnEnded, icon: 'forward', floated: 'right'}
							: {cmp: 'Button', onClick: () => { wantsPlay= true; my.refresh(); }, icon: 'play', floated: 'right'}
						,
						{cmp: 'div',  txt: titulo},
					], style: styleHdr},
					player,
				]);
			}
		}

		return cmpGroup([
			{cmp: 'PaMenu', elements: ['img/logo.png','PodemosAprender radio']},	
			{cmp: 'Container', children: [
				contenido,
				h('a',{href: ProgramaUrl},ProgramaUrl),
			],
			textAlign: 'center',}
		]);
	}
}

function scr_programa(my) {
	my.render= function scr_programa_render(props) {
		var url= (location.hash.match(/url=([^&]+)/)||[])[1];
		return {cmp: 'programa', url: url};
	}
}

function eRadio_programa_boton(k) { //U: para la lista de programas, un boton para un programa
	return cmpAct(
		k,
		fAppGoTo('/radio/'+k),
		{
			icon: 'play', 
			labelPosition: 'right',
			style: {display: 'block', margin: '5px'}
		}); 
}
	
function eRadio_programa_card(k) { //U: para la lista de programas, una tarjeta en vez de solo boton
	//SEE: https://react.semantic-ui.com/views/card/#types-groups
	var datos= pathATitulo(k);

	return h(Cmp.Card,{},
		h(Cmp.Card.Content, {},
			h(Cmp.Image, {floated:'right',size:'mini',src:'img/logo.png'}),
			h(Cmp.Card.Header,{},
				datos.titulo,
				h('p',{style: {fontSize: '50%', color: 'gray'}}, '('+datos.fecha+')'),
			),
			h(Cmp.Card.Description,{},'Nos mandamos tremenda descripción. Somos unos genios!'),
		),	
		h(Cmp.Card.Content, {extra: true, style: {textAlign: 'center'}}, 
			cmpAct('escuchar',{icon:'play'}, fAppGoTo('/radio/'+k))
		)
	);
}

function scr_radio(my) { //U: escuchar la radio, ver programas
	var indexLoaded= false;

	my.componentWillMount= function () {
		radioFecth()
			.then(() => {indexLoaded= true; my.refresh()}); //A: cargue lista de programas
	}

	my.render= function (props, state) { 
		var eProgramas= 'Cargando programas ...'; //DFLT: lista de programas
		if (indexLoaded) {
			var elementos= Object.keys(RadioIdx).sort();
			eProgramas= h(Cmp.Container,{},h(Cmp.Card.Group, {centered: true}, elementos.map( eRadio_programa_card ))); //TODO: generalizar
		}

		return cmpGroup([
			{cmp: 'PaMenu', elements: ['img/logo.png','PodemosAprender radio']},	
			eProgramas
		]);
	}

}

//-----------------------------------------------------------------------------
//S: inicio
Routes["/"]= {cmp: "scr_radio"}
