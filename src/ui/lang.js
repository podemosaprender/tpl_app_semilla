set_logLvlMax(1);
loadJs_withTag_p('/node_modules/microlight/microlight.js');
miHiglighter= function(code, language) {
		console.log("HIGLIGHT",language,code);
		setTimeout(()=> { microlight.reset(); },100);  //XXX:buscar algo con api MENOS horrible
    return '<code class="microlight" style="color: rgba(0,0,0,90);">'+code+'</code>';
}

loadJs_withTag_p('/node_modules/react-simple-code-editor/browser.js');
marked.setOptions({
	 highlight: miHiglighter,
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
# La computación ésta lista

${Slides.Intro.texto}

Puedo poner \`codigo aca\` sin problemas?

~~~
${xsrcJs}
~~~

Entiende que esto no es código?

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


SrcProducto=`
FunTop paraProducto : listas conCadaUno anteriores
	fold_e	
		first listas
		. elemento	
		if (< 1 (length listas))
			paraProducto 	
				rest listas
				. conCadaUno
				concat anteriores (array elemento)
			ApplyCb conCadaUno : concat anteriores (array elemento)
`

evalRtl(SrcProducto);

function sonHermanosP(hechoA,hechoB) {
	return (
		hechoA[0] != hechoB[0] 	
		&& hechoA[1]=="hijoDe" && hechoB[1]=="hijoDe"
		&& hechoA[2]==hechoB[2]
	)
}

function encontrarHermanos() {
	var r= [];
	paraProducto([Db,Db], (A,B) => sonHermanosP(A,B) && r.push([A[0],'esHermano',B[0]]));
	return r;
}

SlidesSrc= await get_url_p('slides.rtl');
evalRtl(SlidesSrc);
