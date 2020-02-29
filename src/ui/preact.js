//INFO: convertir ejemplos React a nuestro formato

function xmlAttrToKv(str, keySep) {
	keySep= keySep || '=';

	var r= {};
	var tokens= str.split(new RegExp('(\\s+|'+keySep+'|\{\{|\{|\}}|\}|\"|\')'));
	
	var k= null;
	for (var i=0; i<tokens.length; i++) { var tok= tokens[i];
		//
		logm("DBG",0,"xmlAttrToKv",{i,k,tok,r});
		if (k) {
			var stop= null;
			if (tok=='{{') { stop= '}}'; } else if (tok=='{') { stop= '}'; }
			else if (tok=='"') { stop= '"'; } else if (tok=="'") { stop= "'"; }
			if (stop) {
				var s=''; 
				for (i++; i<tokens.length && tokens[i]!=stop; i++) { s+=tokens[i]; } 
				//TODO: error si falta cierre 
				r[k]= tok=='{{' ? xmlAttrToKv(s,':') : s; k= null;
				//logm("DBG",0,"xmlAttrToKv v",{i,k,stop,tok:tokens[i],s});
			}
		}
		else if (tok==keySep) { k= tokens[i-1]; }
		else if (i>0 && tok.match(/\s+/) && tokens[i-1].match(/\w+/)) { r[tokens[i-1]]= true; }
	}
	return r;
}

function xmlToPaPreact(xmlstr) {
	var tokens= xmlstr.split(/(<[^>]+>)/);
	var st= [{}]; //A: stack para armar el resultado, empieza con un "top"
	var tos= null; //A: top of stack
	tokens.forEach(tok => {
		var m= tok.match(/<(\/?)([^ >]+)\s*([^>]*)>$/);
		if (m) { //A: es un tag
			var abre= !m[1];
			var cierra= m[1] || (m[3] && m[3].match(/\/$/));
			logm("DBG",0,"xmlToPaPreact",{abre, cierra, tok, m, st});
			if (abre) { 
				var attr= m[3] ? xmlAttrToKv(m[3].replace(/\/$/,'')) : {};	
				tos= {... attr, cmp: m[2]};
				st.push(tos);
			}			
			if (cierra) { 
				var cur= st.pop();
				tos= st[st.length-1];

				tos.children= tos.children || [];
				tos.children.push(cur);
			}
		}
		else if (tos) { //A: texto suelto, si ya aparecio el primer tag
			var v= tok.trim();
			if (v!='') {
				tos.children= tos.children || [];
				tos.children.push(v);
			}
		}
	});
	return tos.children[0];
}

function scr_preact(my) {
	var src= '';
	var nuestro_src='';

	function set_src(e) { src= e.target.value; }; //U: recibir onChange y guardar el valor

	function onConvertir() {
		window.src= src;
		nuestro_src= '//convertido\n'+ser_json( xmlToPaPreact(src), 1);	
		my.refresh();
	}

	my.render= function preact_render() {
		return {cmp: 'Form', children: [
			{cmp: 'TextArea', onChange: set_src, placeholder: 'ejemplo de react tipo html'},
			{cmp: 'Button', onClick: onConvertir, txt: 'Convertir'},
			{cmp: 'TextArea', value: nuestro_src},
		]};
	}
}


