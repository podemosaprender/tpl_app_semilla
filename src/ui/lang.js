set_logLvlMax(1);
loadJs_withTag_p('/node_modules/microlight/microlight.js');

function codeTryEval(e) {
	var src= e.innerText;
	//DBG: console.log("codeTryEval",e.innerText);
	try { var r= eval(src); alert("Resultado:\n"+ser_json(r,1)); return true; }
	catch (ex) { alert("No se puede evaluar"); console.error("codeTryEval",ex,src); }
}

miHiglighter= function(code, language) {
		console.log("HIGLIGHT",language,code);
		setTimeout(()=> { microlight.reset(); },100);  //XXX:buscar algo con api MENOS horrible
    return '<code class="microlight" style="color: rgba(0,0,0,90);" onclick="codeTryEval(this)">'+code+'</code>';
}


loadJs_withTag_p('/node_modules/react-simple-code-editor/browser.js');
myRenderer= new marked.Renderer();
myRenderer.codespan= function (txt) {
	return '<code class="microlight" style="color: rgba(0,0,0,90);" onclick="codeTryEval(this)">'+txt+'</code>';
}
marked.setOptions({
	highlight: miHiglighter,
	renderer: myRenderer,	
});

xsrc=`
esto es
	una prueba
		de mi
			lenguaje indentado
	deberia andar
		en el browser
		"eso es un string"
		"este es otro string con \\"comillas\\" adentro"
		"pero \\n se convierte en barra n?"

y parece : bastante comoda
	de usar
`;

xsrc2=`
FunTop rtlSi : nombre edad
	print : + "Hola " nombre " tenes " edad " años "
`

xsrcDb=`
Mau hijoDe Mary
Pablo hijoDe Mary
`

xsrcJs=`
pueden(ser);
varias(lineas);
if (pregunto) {
	bien= 2;
}
`;

function parseYlog() { console.log(ser_json(toArrays(parse(xsrc)),1)) }

function scr_lang(my) {
	my.state= { code: xsrcJs };

	my.render= function () { 
		return [{cmp: 'Markdown', children: `
${Slides.Intro.texto}
`},
	{cmp: CodeEditorSimple.default, value: my.state.code, highlight: miHiglighter, onValueChange: v => my.setState({code: v}), style: { background: 'white', color: 'transparent', caretColor: 'green', fontFamily: 'monospace'}},
	];
	}
}

SaveDef= {};
SaveNames= 'cmp'.split(' ');
SaveNames.forEach(n => {SaveDef[n]= GLOBAL[n]});

console.log("LANG0");
GLOBAL=window; GLOBAL.LogLvlMax=1; LogLvl.Max=1 //XXX: sino lib lo sube a 9
await loadJs("lib/lib2.js"); 
await loadJs("lib/liblang.js");
LogLvlMax=1;
path= 'lib/prelude.rtl';
src= await get_url_p(path);
srcjs= parse_rtl_toSrc_js(src,path);
eval(srcjs);
parseYlog();
function evalRtl(src) {
	eval(parse_rtl_toSrc_js(src));
}
evalRtl(xsrc2);
SaveNames.forEach(n => {GLOBAL[n]= SaveDef[n]});

Db= toArrays(parse(xsrcDb)).slice(1);
console.log("Listo!");


SlidesSrc= await get_url_p('slides.rtl');
evalRtl(SlidesSrc);
