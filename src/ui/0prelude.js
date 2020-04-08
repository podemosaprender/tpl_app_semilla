//INFO: vars globales, inicializa, libreria, etc.

GLOBAL= window; //U: para acceder a todo lo definido

/************************************************************************** */
//S: utiles
function loadJs(url) { //U: cargar js desde js, OjO! seguridad y eval ...
	console.log("loadJs",url);
	var proto= (url.match(/^([^:]+):/)||[])[1] || (runtimeEnv=='cordova' ? 'file' : 'http');
	//A: calculamos que protocolo usar, puede venir SIN proto!
	
	var loadp= (proto=='file' || proto=='cdvfile')
		? get_file_p(url,'txt')
		: fetch(url).then(r => r.text())
	
	return loadp.then(t => {
		//DBGconsole.log("loadJs then",url,t);
		var src= xfrmJsToGlobals(t,url);
		//DBG console.log(url,src);
		var p= eval(src); //A: devuelve una promesa
		return p;
	});
}

function paramsToTypeKv() { //U: devuelve un kv con los params separados por tipo
	var r= {};
	for (var i=0;i<arguments.length;i++) { var v= arguments[i];
		if (typeof(v)=="function" && r.f==null) { r.f= v; }
		else if (Array.isArray(v) && r.array==null) { r.array= v; }
		else if (typeof(v)=="object" && r.kv==null) { r.kv= v; }
		else if (typeof(v)!="object" && typeof(v)!="function" && r.txt==null) { r.txt= v; }
		else { r.array= r.array || []; r.array.push(v) } //A: sueltos agregamos a array
	}
	r.kv= r.kv || {};
	return r;
}

function getWidth() {
  const isSSR = typeof window === 'undefined';
  return isSSR ? Responsive.onlyTablet.minWidth : window.innerWidth;
}

function set_style_dom(csstxt) { //U: define estilos usando css (en especial clases)
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = csstxt;
	document.getElementsByTagName('head')[0].appendChild(style);
	return style;
}

function set_persistent(k,v) { //U: guarda en algun lado persistente v que puede ser un objeto
	localStorage[k]= ser_json(v);
}

function get_persistent(k,dflt) { //U: lee lo que se guardo con set_persistent
	var s= localStorage[k];
	return (s!=null && ser_json_r(s)) || dflt;
}

function loadJs_withTag_p(url) {
	var r= document.createElement('script');
	var p= new Promise(cb => { r.onload= (e	 => cb(e,r)) });
	r.src = url;
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(r, firstScriptTag);
	return p;
}

function loadJs_forTests_p() {
	return Promise.all(
		"node_modules/mocha/mocha.js node_modules/expect.js/index.js node_modules/mocha/mocha.js node_modules/happen/happen.js node_modules/prosthetic-hand/dist/prosthetic-hand.js node_modules/sinon/pkg/sinon.js".split(' ').map(loadJs_withTag_p)
	).then(x => {
		mocha.setup({
      ui: 'bdd',
      ignoreLeaks: true
    });
	});
}

Test= {}; //U: aca ponemos todos los tests
TestOut_el= null; //U: el div donde se ve el resultado
function run_tests_p() {
	TestOut_el= document.getElementById('mocha')
	if (! TestOut_el) {
		TestOut_el= document.createElement('div');
		TestOut_el.id= 'mocha';
		document.body.prepend(TestOut_el);
	}

	TestOut_el.innerHTML= '';

	function runTestsImpl() { (window.mochaPhantomJS || window.mocha).run(); }
	return loadJs_forTests_p().then( () => {

		var suites= {};
		Object.keys(Test).sort().forEach( k => {
			var que='g'; var txt=k; //DFLT
			var m= k.match(/^([^:]+):\s*(.*)/);
			if (m) { que= m[1]; txt= m[2]; }
			suites[que]= suites[que] || {};
			suites[que][txt]= Test[k];
		});
		//A: tengo todos los tests en sus suites, ordenados por jerarquia
		Object.keys(suites).forEach(sk => { var sv =suites[sk];
			describe(sk, function () { 
				Object.keys(sv).forEach( txt => it(txt,sv[txt]) );
			});
		});

		if (window._cordovaNative) { document.addEventListener('deviceready',runTestsImpl,false); }
		else { runTestsImpl(); }
	});
}

/************************************************************************** */
//S: UI: pReact + Router + Semantic UI, pero mas comodo
Routes= {}; //U: RUTAS PREACT ROUTE, path -> {cmp: componente }, las usa la pantalla principal

function fRef(k,dst) { //U: para pasar como parametro a "ref" de pReact y guardarse la referencia
	return function (e) { set_p(dst,k, e); }
}

function fId(x) { return x; }

function asFun(x) { //U: devuelve x si es funcion, sino una funcion que busca en x
	return (typeof(x)=='function') ? x 
					: (x!=null && typeof(x)=='object') ? function (k) { return x[k] }
					: (x!= null) ? function (ignored) { return x }
					: fId;
}

function asArray(x) { //U: si x es escalar no nulo devuelve como Array, si es Array tal cual
	return (x && !Array.isArray(x)) ? [x] : x;
}

function fSetValue(k,dst, xfrm) { //U: una funcion que recive e, y guarda e.target.value en la clave k de dst, llama refresh si dst tiene esa funcion
	var xfrm= asFun(xfrm); //A: siempre lo transformamos de alguna manera, aunque sea fId
	return function (e) { 
		XY= e;
		var v= typeof(e)=='object' && e.target 
			? (e.target.type=='file')
			? e.target.files 
			: ('value' in e.target)
					? e.target.value 
					: e.target.parentElement.children[0].checked //A: el checkbox es HORRIBLE
			: e; //A: si es evento, value, sino el valor en si
		var v0= get_p(dst,k);
		var v1= xfrm(v,v0); //A: llamamos xfrm con el valor nuevo y el anterior
		logm("DBG",3,"Value Set",{k,v,v1,v0});
		set_p(dst,k, v1); 
		if (typeof(dst.refresh)=='function') dst.refresh(); 
	}
}


function cmpAct() { //U: un elemento accionable tipo boton
	var d= paramsToTypeKv.apply(null,arguments);	
	d.kv.children= d.array || (d.txt && [d.txt]);
	if (d.kv.icon) {
		d.kv.children.unshift(h(Cmp.Icon,{name:d.kv.icon}))
		//A: agregue el icono que me pidio al principio
	}
	d.kv.onClick= d.f;
	return h(d.kv.cmp || Cmp.Button, d.kv);
}

function cmpOut() { //U: elemento de salida tipo div
	var d= paramsToTypeKv.apply(null,arguments);	
	d.kv.children= d.array || (d.txt && [d.txt]);
	d.kv.onClick= d.f;
	return h(d.kv.cmp || Cmp.Fragment, d.kv);
}

function cmpGroup() { //U: array con grupo de elementos
	return cmp.apply(this,arguments);
}

function cmp() { //U: elemento "si adivina" que tipo
	var d= paramsToTypeKv.apply(null,arguments);	
	//A: separamos los params en kv, array y f
	d.kv.children= d.kv.children || d.array;
	//DBG console.log("cmp A",d.kv);
	d.kv.children= (d.kv.children && !Array.isArray(d.kv.children)) ? [d.kv.children] : d.kv.children;
	d.kv.children= (d.kv.children && Array.isArray(d.kv.children)) ? 
		d.kv.children.map( p => {
			var r= p; //DFLT
			if (typeof(p)=='object' && p!=null) {
				var isObjectButNotCmp= p.$$typeof!=Symbol.for("react.element");
				r= isObjectButNotCmp ? cmp(p) : p; //A: si no era cmp, llamamos a esta misma
				//DBG logm("DBG",9,"cmp children",{isObjectButNotCmp, p, r});
			}
			return r;
		})
		: ((d.txt || d.kv.txt)!=null ? [d.txt || d.kv.txt] : null);
	//A: si kv tenia children, les aplicamos esta misma funcion

	if (typeof(d.kv.cmp)=='string') {
		if (d.kv.cmp[0]=='<') { d.kv.cmp= d.kv.cmp.slice(1); } //A: es html
		else {
			var xcmp= get_p(Cmp,'.'+d.kv.cmp,false,/(\.)/); //A: separamos por . ej Form.Select
			if (xcmp) { d.kv.cmp= xcmp; } //A: estaba definido en Cmp, usamos ese
		}
	}
	//A: si cmp era el path a uno en Cmp, pusimos el objeto
	//DBG console.log("cmp Z",d.kv);

	return h(d.kv.cmp || d.f || Cmp.Fragment, d.kv.cmp ? d.kv : {children: d.kv.children});
}

function appGoTo(route) { //U: navega a una ruta
	if (Routes[route]==null) { console.error("Route "+route+" not defined, AppGo"); }
	preactRouter.route(route);
}

function fAppGoTo(link) { //U: una funcion para ir a un link que se puede poner en onClick
	return appGoTo.bind(null,link); 
}

//------------------------------------------------------------
//S: Hacer mas comodo e inicializar preact
var { Component, h, render } = window.preact;
var Cmp= window.semanticUIReact; //U: para acceder con Cmp.Button, a todos de una (MEJOR)
Object.keys(SemanticUiCalendarReact).forEach( k => { Cmp.Form[k]= SemanticUiCalendarReact[k] });

render_str= preactRenderToString; //U: genera el html para un componente

function CmpDef(f, proto) { //U: definir un componente de UI que se puede usar como los otros de pReact+Semantic ej. Button, le pasa una variable "my" como parametro a "f" ej. para hacer "my.render= ..."
	proto= proto || Component;
	f= f || function () {};

	var myComponentDef= function (...args) {
		var my= this; 
		proto.apply(my,args);  //A: initialize with parent
		my.state= my.state || {}; //A: siempre hay state

		my.withValue= function (k, xfrm, dst, xfrmShow, onRef) { 
			if (k[0]!='{') k='{state{'+k; //A: set y get_p requieren que empiece con sep
			dst= dst || my;
			xfrmShow= asFun(xfrmShow);
			onRef= asFun(onRef);

			var v= get_p(dst,k);
			var vs= xfrmShow(v);
			var r= { //U: conectar un input a estado usando { ... my.withValue('/pepe') }
				onChange: fSetValue(k,dst,xfrm),
				value: vs,
				ref: el => { onRef(el,vs)},
			};
			logm("DBG",3,"Value Get",{k,v,r});	
			return r;	
		};

		my.setValue= function (k, xfrm, dst, cmp) { 
			if (k[0]!='{') k='{state{'+k; //A: set y get_p requieren que empiece con sep
			xfrm= xfrm==null ? true : xfrm; //DFLT
			dst= dst || my;
			var v= get_p(dst,k);
			return { //U: conectar un input a estado usando { ... my.withValue('/pepe') }
				onClick: fSetValue(k,dst,xfrm),
				value: v,
				active: cmp && cmp.toggle && (v==xfrm),
			}
		};

		my.forValue= function (k,cmp,xfrm,xfrmShow,onRef) { 
			if (cmp && cmp.cmp=='Checkbox') { //A: necesita adaptacion :P
				var xfrm0= asFun(xfrm);
				xfrm= (_,vp) => (!vp); //A: toggle, lo contrario de lo que estaba
				var onRef0= asFun(onRef0);
				onRef= (e,v) => { e && e.setState({checked: v}); }; //A: hay que sincronizarlo a mano
			}
			return Object.assign({cmp: 'Form.Input', placeholder: k, ... my.withValue(k,xfrm,null,xfrmShow, onRef)}, cmp); 
		}

		my.toSet= function(k,xfrm,cmp) { return Object.assign({cmp: 'Button', children: k, ... my.setValue(k,xfrm,my,cmp)}, cmp);}
 
		f.apply(my,[my].concat(args));
		//A: llamamos la funcion que define el componente con la instancia
		my.renderImpl= my.render;
		my.render= function (props, state) {
			var x= my.renderImpl.apply(this,[props,state]);
			if (typeof(x)=='object') { 
				if (x.$$typeof) { return x; } //A: es pReact
				else { return cmp(x); }
			}
			else { return h('div',{},x); };
		}
	}

	var p= myComponentDef.prototype= new proto(); 

	p.toProp= function (name) {	//U: para usar con onChange u onInput
		return (e) => { this[name]= e.target.value; } 
	}
	p.refresh= function (kv) { this.setState(kv || {}); } //U: redibujar 

	return myComponentDef;
}

Cmp.NA= () => h('div',{},'UiNA:NOT IMPLEMENTED'); //U: para usar donde todavia no implementaste

Cmp.Main= CmpDef(function CmpMain(my) { //U: el que inicia todo, usa las rutas para tus pantallas
  my.componentWillMount = function () {
    var body = document.getElementsByTagName('body')[0];
    body.style.backgroundColor =  LAYOUT.BG_COLOR;
 		//A: cambie el color del fondo 
 }
 
	my.render= function (props, state) {
		return (
			h('div', {id:'app'},
				//VER: https://github.com/preactjs/preact-router
				h(preactRouter.Router, {history: History.createHashHistory()},
					Object.entries(Routes).map( ([k,v]) => {
						var cmp= typeof(v.cmp)=="function" ? v.cmp : Cmp[v.cmp]; //A: si es string, buscar en definidos
						if (cmp==null) { console.error("Route "+k+" component not defined "+v.cmp); }
						return h(cmp, {path: k, ...v}); //A: el comoponente para esta ruta
					}),
				), //A: la parte de la app que controla el router
			)
		);
	}
});

function CmpDefAuto() { //U: para todas las definiciones tipo function cmp_MiPantalla te genera Cmp.MiPantalla, asi podes definir pantallas con solo definir funciones
	var k; for (k in GLOBAL) {
		if (typeof(GLOBAL[k])=="function") {
			var m;
			if (m= k.match(/^cmp_(.*)/)) { //A: es una funcion que define un componente
				Cmp[m[1]]= CmpDef(GLOBAL[k]); //A: defino el componente
			}
			else if (m= k.match(/^scr_(.*)/)) { //A: es una funcion que define una pantalla, puede ser scr_factura_$fecha_$cliente y tener params!
				Cmp[k]= CmpDef(GLOBAL[k]); //A: defino el componente, mismo nombre que funcion
				var parts= k.replace("$",":").split("_"); parts.shift(); //A: las partes, menos scr, con : como usa el router para las variables
				var route= parts.join("/");
				Routes[route]= Routes[route] || {};
				Routes[route].cmp= k;
				//A: agregue la ruta si no estaba, actualice el componente que dibuja esa pantalla
			}
		}
	}
}

AppRoot_= GLOBAL.AppRoot_;
function AppStart(theme, wantsRestart) { //U: inicia la app!
	console.log("AppStart");
	UiSetTheme(theme || 'chubby');
	CmpDefAuto();
	if (wantsRestart || !Routes['/']) { //A: no hay main, tomar la ultima funcion
		var main_k=null;
		Object.keys(Cmp).map(k => { if (k.match(/scr_/)) { main_k= k }});
		console.log("AppStart main inferred "+main_k);
		Routes['/']= {cmp: Cmp[main_k]};
		//A: dejamos como main la ultima scr_ que se definion
	}
	if (AppRoot_) { render(null, document.body, AppRoot_);}
	AppRoot_= render(h(Cmp.Main), document.body);
}

/************************************************************************** */
//S: colores y formatos UI
var UiThemes= "cerulean chubby cosmo cyborg darkly flatly journal lumen paper readable sandstone simplex slate solar spacelab superhero united yeti".split(' '); //U: vienen preinstalados!

function UiSetTheme(nombre) { //U: activar este tema de ui (colores, tamaños, etc.)
  var st= document.getElementById("tema");
  st.href='node_modules/semantic-ui-forest-themes/semantic.'+nombre+'.min.css';
}

COLOR= { } //U: para definir colores por nombre o funcion, ej. "FONDO" y poder cambiarlos
COLOR.azulOscuro= 'rgb(56,87,162)';
COLOR.azulClaro= 'rgb(105,178,226)';
COLOR.gris= 'rgb(194,195,201)';
C_ROJIZO='#ad5d4e';
C_AZUL='#40476d';
//--826754--eb6534
C_TOOLBAR= C_AZUL;


LAYOUT= { //U: para poder definir directamente CSS y cambiarlo desde cfg
	BG_COLOR: COLOR.gris, //U: el fondo la pagina para el sitio 
	ICONS: {}, //U: iconos con nombre
}

VIDEO_ICON_URL= '/ui/imagenes/video_play.png'

//------------------------------------------------------------
//S: componentes comodos

function cmp_audio(my) { //U: un componente para reproducir audio
	my.render= function cmp_audio_render(props) {
		//eventos interesates onEnded: fLog("ended"), onLoadedmetadata: fLog("load")
		//SEE: https://www.w3schools.com/tags/ref_av_dom.asp
		return cmp({... props, cmp: '<audio',controls: true,  children: [
				{cmp:'source',src: props.src , type: "audio/ogg"}
		]});
	}
}

//------------------------------------------------------------
function read_inputFile(file, fmt, cb) { //U: lee un archivo del valor de un elemento input file
	reader = new FileReader();
	reader.onload= function (revt) {
		cb(revt.target.result);
	};
	if (fmt=='bin') { reader.readAsBinaryString(file); }
	else { reader.readAsText(file); }
};

function cmp_InputFile(my) { //U: un input file invisible, para controlar con otros componentes
	function onChange(e, props) {
		 my.setState({file: e.target.files ? e.target.files[0].name : ''});
		 props.onChange(e,my);
	}

	my.click= function () { my.fileInputRef.click(); };
	my.open= my.click;

	my.render= function(props) {
		if (props.cref) { setTimeout(() => (props.cref(my)) , 10); }
		return {
					cmp:'input',
					accept: props.accept,
    			ref: r => (my.fileInputRef=r),
    			type:'file',
    			hidden: true,
					onChange: e => onChange(e,props),
 		}; 
	}
}

//------------------------------------------------------------
function cmp_youtube(my) {
	//SEE: https://developers.google.com/youtube/iframe_api_reference

	var divId= 'playerYt'+Date.now();
	var player= null;
	var init_i= null; 

	my.componentWillMount= function yt_componentWillMount() {
		if (window.YTScript==null) {
			YTScript= loadJs_withTag("https://www.youtube.com/iframe_api");
		}
	}

	function onPlayerStateChange(props, ev) {
		if (ev.data===0) { 
			console.log("YT termino"); 
			if (typeof(props.onEnded)=='function') {
				props.onEnded(ev);
			}
		}
		else if (ev.data==null && props.autoplay) {
			ev.target.playVideo();
		}
		else if (typeof(props.onChange)=='function') {
			props.onChange(ev);
		}
	}

	my.render= function cmp_yt_render(props) {
		if (init_i== null) { 
			init_i= setInterval(() => {
				var e= document.getElementById(divId);
				console.log('YT '+window.YT+' '+e);
				if (window.YT==null || window.YT.Player==null || e==null) return ;
				//A: tenemos todo
				clearInterval(init_i);

				player = new YT.Player(divId, {
					height: props.height || '390', width: props.width || '640',
					videoId: props.video,
					playerVars: { autoplay: props.autoplay, controls: props.controls!==false },
					events: {
						onReady: e => onPlayerStateChange(props,e),
						onStateChange: e => onPlayerStateChange(props,e),
					}
				});

			},100);
		}
		return {cmp: 'div', children: [{cmp: 'div', id: divId}]};
	}
}

//------------------------------------------------------------
function cmp_PaMenu(my) {
	my.render= function PaMenu_render(props) {
		var items= props.items.map(t => {return typeof(t)=='object' ? t : {
			cmp: Cmp.Menu.Item, 
			onClick: ()=> props.onClick(t), 
			txt: t.match(/(.png|.jpg)$/) ? h('img',{src: t}) : t,
			fitted: true,
		}});

		var menu= {
			... props,
			cmp: Cmp.Menu, 
			style: {marginBottom: '15px', ... props.style}, 
			children: [ {cmp: Cmp.Container,children: items} ],
		};

		return menu;
	}
}

function cmp_ContainerDesktop(my) {
	function hideFixedMenu() {my.setState({ fixed: false })}
  function showFixedMenu() {my.setState({ fixed: true })}

	my.render= function (props, state) {
		var fixed= state.fixed;
		var children= props.children;
		return {
		 "cmp": "Responsive",
		 "getWidth": getWidth, "minWidth": Cmp.Responsive.onlyTablet.minWidth,
		 "children": [
			{
			 "cmp": "Visibility",
				"onBottomPassed": showFixedMenu, "onBottomPassedReverse": hideFixedMenu, 
				"once": false, 
				"children": [
				{
				 "cmp": "Segment",
				 "vertical": true,"textAlign": "center",
				 "inverted": true, "style": { "minHeight": "1em 0em" },
				 "children": [
					{
					 "cmp": "Menu",
					 "fixed": fixed ? 'top' : null,
					 "inverted": !fixed,
					 "pointing": !fixed,
					 "secondary": !fixed,
					 "size": "large",
					 "children": [
						{
						 "cmp": "Container",
						 "children": props.items.map( it => (
								{ "cmp": "Menu.Item", "as": "a", "children": it.match(/(.png|.jpg)$/) ? h('img',{src: it}) : it }
							))
						}
					 ]
					},
				 ]
				}
			]
			},
			children
		 ]
		};
	}
}

function cmp_ContainerMobile(my) {

	my.handleSidebarHide= function () { my.setState({ sidebarOpened: false }); }
  my.handleToggle= function () { my.setState({ sidebarOpened: true }); }

	my.render= function (props, state) {
		var sidebarOpened= state.sidebarOpened;
		var children= props.children;

		return {
		 "cmp": "Responsive",
		 "as": Cmp.Sidebar.Pushable,
		 "getWidth": getWidth,
		 "maxWidth": Cmp.Responsive.onlyMobile.maxWidth,
		 "children": [
			{
			 "cmp": "Sidebar",
			 "as": Cmp.Menu,
			 "animation": "push", "inverted": true,
			 "onHide": my.handleSidebarHide,
			 "visible": sidebarOpened,
			 "vertical": true,
			 "children": props.items.map( it => (
					{ "cmp": "Menu.Item", "as": "a", "children": it.match(/(.png|.jpg)$/) ? h('img',{src: it}) : it }
				))
			},
			{
			 "cmp": "Sidebar.Pusher",
			 "dimmed": sidebarOpened,
			 "children": [
				{
				 "cmp": "Segment",
				 "vertical": true, "inverted": true,
				 "textAlign": "center", "style": { "minHeight": "1em 0em" },
				 "children": [
					{
					 "cmp": "Container",
					 "children": [
						{
						 "cmp": "Menu",
						 "inverted": true, "pointing": true, "secondary": true, "size": "large",
						 "children": [
							{
							 "onClick": my.handleToggle,
							 "cmp": "Menu.Item",
							 "children": [ { "name": "sidebar", "cmp": "Icon" } ]
							},
						 ]
						}
					 ]
					},
				 ]
				},
				children
			 ]
			}
		 ]
		}
	}
}

function cmp_ContainerResponsive(my) {
	my.render= function(props) {
		return {cmp: 'div', children: [
			{... props, cmp: 'ContainerDesktop'},
			{... props, cmp: 'ContainerMobile'},
		]};
	}
}


/************************************************************************** */
//S: server and files cfg
Server_url= (location.href.match(/(https?:\/\/[^\/]+)/)||[])[0]; //A: tomar protocolo, servidor y puerto de donde esta esta pagina
Api_url= Server_url+'/api'; //U: la base de la URL donde atiende el servidor

var Auth_usr= ''; //U: que ingreso en el form login, se pueden usar ej. para acceder a server
var Auth_pass= '';

function auth_save() { //U: guardar usuario y pass ej. para recuperar si entra de nuevo o reload, NOTAR que solo se accede desde esta url, el store es "mas o menos" seguro
	localStorage.setItem('usuario', Auth_usr);
	localStorage.setItem('password', Auth_pass);
}

function auth_load() { //U: recuperar usuario y pass si se guardaron
	if (!Auth_usr){
		Auth_usr = localStorage.getItem('usuario');
		Auth_pass = localStorage.getItem('password');
	}
	return Auth_usr;
}

function auth_token() { //U: genera un token unico para autenticarse con el servidor ej. para cuando queres acceder directo a la url de una imagen o archivo para download desde un link
  var salt= Math.floor((Math.random() * 10000000)).toString(16).substr(0,4);
  var token= salt+CryptoJS.SHA256(salt + Auth_usr + Auth_pass).toString(); //TODO: defenir stringHash() como en el server //TODO: EXPIRAR el token!!!
  return token;
}


async function FetchUrl(url, usuario, password, quiereJsonParseado, data, method){ //U: hacer una peticion GET y recibir un JSON
  let response= await fetch(url,{
		method: method || 'GET', //U: puede ser POST
    headers: new Headers({
      'Authorization': 'Basic '+btoa(`${usuario}:${password}`), 
      'Content-Type': 'application/json',
    }),
		body: data!=null ? JSON.stringify(data): null,
  })
  if(quiereJsonParseado=="text") { return await response.text(); }
	else if (quiereJsonParseado) { return await response.json(); }

  return response;
}

async function GetUrl(url,quiereJsonParseado, data) {
	return FetchUrl(url, Auth_usr, Auth_pass, quiereJsonParseado, data);
}

async function PostUrl(url, quiereJsonParseado, data) {
	return FetchUrl(url, Auth_usr, Auth_pass, quiereJsonParseado, data, 'POST');
}


/************************************************************************** */
//S: Util

CopyToClipboardEl= null; //U: el elemento donde ponemos texto para copiar
function copyToClipboard(texto) { //U: pone texto en el clipboard
	if (CopyToClipboardEl==null) {
		CopyToClipboardEl= document.createElement("textarea");   	
		CopyToClipboardEl.style.height="0px"; 
		CopyToClipboardEl.style.position= "fixed"; 
		CopyToClipboardEl.style.bottom= "0"; 
		CopyToClipboardEl.style.left= "0"; 
		document.body.append(CopyToClipboardEl);
	}
	CopyToClipboardEl.value= texto;	
	CopyToClipboardEl.textContent= texto;	
	CopyToClipboardEl.select();
	console.log("COPY "+document.execCommand('copy')); 
	document.getSelection().removeAllRanges();
}

/******************************************************************************/
//S: QR, generar imagen

function QR(str) { //U: genera un objeto QR para generar distintos formatos de grafico para la str recibida como parametro
  var typeNumber = 10; //U: cuantos datos entran VS que calidad requiere, con 10 y las tabletas baratas de VRN escaneando monitor laptop funciona ok, entran mas de 150 bytes
  var errorCorrectionLevel = 'L'; //U: mas alto el nivel de correcion, menos fallas pero menos datos, con L funciona ok
  var qr= qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(str);
  qr.make();
  return qr
}

function QRGenerarTag(str) { //U: devuelve un tag html "img" con el QR para str
  return QR(str).createImgTag();
}

function QRGenerarData(str) { //U: devuelve la data url para usar en un tag img con el QR para str
	return QR(str).createDataURL();
}

/************************************************************************** */
//S:

function JSONtoDATE(JSONdate) {  //U: recibe una fecha en formato json y devuelve un string con la fecha dia/mes/anio
	let fecha = new Date(JSONdate);
	if (isNaN(fecha)) return 'error en fecha'
	return  [fecha.getDate(), fecha.getMonth()+1, fecha.getFullYear()].map(n => (n+'').padStart(2,"0")).join("/");
	//A: ojo, Enero es el mes CERO para getMonth
}

function JSONtoHour(JSONdate) {
	let date = new Date(JSONdate);
	return [date.getHours(), date.getMinutes()].map(n => (n+'').padStart(2,"0")).join(":");
}             

/************************************************************************** */
//S:
function cmp_Markdown(my) {
	my.render= function (props) {
		var txt= asArray(props.children||'').join('\n\n');
		var html= marked(txt).replace(/href="#CALL:([^"]*)"/, 'onclick="$1"');
		delete(props.children);
		delete(props.cmp);
		return {cmp: props.cmp || 'Segment', dangerouslySetInnerHTML: { __html: html }, ... props}	
	}	
}

function cmp_PaMenuYCerrar(my) {
	my.render= function () {
		return {
			cmp: 'PaMenu', inverted: true, style: { background: C_TOOLBAR }, items: [
			'img/logo.png', 
			'PodemosAprender Semilla',
			{cmp: 'Menu.Menu', position: 'right', children: {
				cmp: 'Menu.Item', icon: 'close', style: {paddingRight: '16px'},
				onClick: () => { if (location.hash=='#/') scr_AppReload(); else appGoTo('/'); }
			}}
		]}
	}
};

function scr_AppReload(my) { 
	window.location.replace(window.location.href.replace(/#.*/,''));
}


function link_whatsapp(data) {
  //U: "https://api.whatsapp.com/send?phone=573105010573&text=*_Destacado_*%0A*texto"
  return 'https://api.whatsapp.com/send?phone='+data.dst+'&text='+encodeURIComponent(data.body);
}

//============================================================
//S: speech
function speech_from_text_p(msg) { //A: lee en voz alta
	//SEE: https://www.npmjs.com/package/cordova-plugin-texttospeech
	if (typeof(msg)!='object') { msg= {text: (msg||'')+''} }
	//A: msg es un kv
	msg= Object.assign({lang: 'es-AR', rate: 0.75}, msg);

	return new Promise( (onOk,onError) => 
		TTS.speak({
				text: msg.text,
				locale: msg.lang,
				rate: msg.rate,
			}, 
			onOk,	
			onError,	
		)
	);
}
	
//SEE: https://www.npmjs.com/package/phonegap-plugin-speech-recognition
//SEE: https://wicg.github.io/speech-api/#speechreco-attributes
SpeechRecognition= window.webkitSpeechRecognition || window.SpeechRecognition;
Recognition_= SpeechRecognition && new SpeechRecognition();
RecognitionEstaDictando_= false;

function speech_to_text_stop() { Recognition_.stop(); }
function speech_to_text_estaDictando() { return RecognitionEstaDictando_; }
function speech_to_text_p(params) {
	params= params || {};
	Recognition_.lang= params.lang || 'es-AR'; //SEE: https://github.com/libyal/libfwnt/wiki/Language-Code-identifiers
	return new Promise( onOk => {
		var textoNuevo='';

		function onRecognitionResult(event) {
			console.log("Recognition",event);
			//XXX:deberia ser un interim PERO la implementacion actual del plugin solo envia finales y no marca el flag isFinal :(
			if (event.type=='end') {
				RecognitionEstaDictando_= false;
				setTimeout(() => onOk(textoNuevo), 500); //A: end llega antes que results :P
			}
			else if (event.type=='result') {
				if (event.results.length > 0) {
					textoNuevo= event.results[0][0].transcript;
				}
			}
		}

		Recognition_.onend= onRecognitionResult; //A: restaurar estado
		Recognition_.onresult= onRecognitionResult;
		RecognitionEstaDictando_= true;
		setTimeout(()=> Recognition_.start(),100); //A: le doy tiempo al refresh de UI
	});
}

//============================================================
//S: media capture
//SEE: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-media-capture/index.html

function capture_media_p(opts) {
	if (opts==null || typeof(opts)!='object') { opts= {type: opts||'Image'} }

	return new Promise( (onOk, onError) => {
		function captureSuccess(mediaFiles) {
			console.log("capture_media_p ok",mediaFiles);
			onOk(mediaFiles);
		};

		var captureError = function(error) {
			console.error("capture_media_p err",error);	
		};

		var fun= 	navigator.device.capture['capture'+opts.type];
		if (fun) { 
			document.addEventListener('pendingcaptureresult', captureSuccess);
    	document.addEventListener('pendingcaptureerror', captureError);
			fun(captureSuccess, captureSuccess, {limit:1}); 
		}
		else { onError({error: 'unknown type '+opts.type+' valid are Audio, Image, Video'}) }
	});
}

//============================================================
//S: barcode

Capture_barcode_Opts= { //DFLT
	preferFrontCamera : false, // iOS and Android
	showFlipCameraButton : true, // iOS and Android
	showTorchButton : true, // iOS and Android
	torchOn: false, // Android, launch with the torch switched on (if available)
	saveHistory: true, // Android, save scan history (default false)
	prompt : "Place a barcode inside the scan area", // Android
	resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	formats : "QR_CODE,PDF_417,EAN_13", // leyo DNI, qr wikipedia y codigo barras libro
	orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
	disableAnimations : true, // iOS disable
	SuccessBeep: false // iOS and Android
}

function capture_barcode_p(opts) {
	//SEE: https://www.npmjs.com/package/cordova-plugin-qr-barcode-scanner
	opts= opts || Capture_barcode_Opts;
	return new Promise( (onBarCodeOk, onBarCodeError) =>
		cordova.plugins.barcodeScanner.scan( onBarCodeOk, onBarCodeError, opts));
}


//========================================================
//S: MAIN

set_style_dom('.test .duration { margin-left: 2em; }');

for (k in PRecharts) { Cmp[k]= PRecharts[k]; }

runtimeEnv= (typeof window != 'undefined') ? (window.location && window.location.href.indexOf('android_asset')>-1) ? 'cordova' : 'browser' : 'node'; //XXX:asegurarse que en node nunca existe 'window'

m= location.href.match(/app=([^&#]+)/);
if (runtimeEnv=='cordova') { main='file:///android_asset/www/cordova_main.js'; }
else if (m) { main= m[1]+'.js'+'?_'+Date.now(); } //A: habia un parametro 
else {
	main= location.pathname.match(/[^\/]+$/)  ? location.pathname+'.js' : location.pathname+'index.js';
	main+='?_'+Date.now();
}

console.log("MAIN",main);
document.title= main.replace(/\.js.*/,'');

function _init() {
	platform_init(); //A: necesita funciones de cordova
	loadJs(main).then( x => {
	console.log("AppStarted "+x);
	AppStart();
	});
}

function onDocumentReady(fn) { //U: see if DOM is already available
	if (document.readyState === "complete" || document.readyState === "interactive") { 
		//U: ya cargo, call on next available tick
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}    

if (runtimeEnv=='cordova') {
	document.addEventListener("deviceready", _init, false);
}
else {
	onDocumentReady(_init);	

}
