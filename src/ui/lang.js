console.log("LANG0");
GLOBAL=window; GLOBAL.LogLvlMax=1; LogLvl.Max=1 //XXX: sino lib lo sube a 9

SaveNames= 'cmp'.split(' ');
SaveDef= {};
SaveNames.forEach(n => {SaveDef[n]= GLOBAL[n]});

await loadJs("lib/lib2.js"); 
await loadJs("lib/liblang.js");
LogLvlMax=1;
function evalRtl(src,path) { eval(parse_rtl_toSrc_js(src,path)); }
async function loadRtl_url(url) { 
	var src= await get_url_p(url);
	evalRtl(src,url);
}
loadRtl_url('lib/prelude.rtl');

SaveNames.forEach(n => {GLOBAL[n]= SaveDef[n]});
//------------------------------------------------------------
await loadRtl_url('slides.rtl');

//------------------------------------------------------------
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

myRenderer= new marked.Renderer();
myRenderer.codespan= function (txt) {
	return '<code class="microlight" style="color: rgba(0,0,0,90);" onclick="codeTryEval(this)">'+txt+'</code>';
}
marked.setOptions({
	highlight: miHiglighter,
	renderer: myRenderer,	
});

//------------------------------------------------------------

loadJs_withTag_p('/node_modules/react-simple-code-editor/browser.js');

function scr_lang(my) {
	my.state= { code: "alert('Hola Mundo!');" };

	my.render= function () { 
		return [{cmp: 'Markdown', children: Slides.Intro.texto },
//		{cmp: CodeEditorSimple.default, value: my.state.code, highlight: miHiglighter, onValueChange: v => my.setState({code: v}), style: { background: 'white', color: 'transparent', caretColor: 'green', fontFamily: 'monospace'}},
	];
	}
}

