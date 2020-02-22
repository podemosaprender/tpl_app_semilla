/**
* @file Generar X_Y en cuatro tiles para buscar con cercanos en especial al vertice donde se unen que es el caso más difícil
*
* Arbitrariamente para los tests elijo que el punto central es X=10000000 e Y=20000000 (8 digitos)
*
*/

var sprintf = require('sprintf-js').sprintf;
var fs= require('fs');

XC= 10000000;
YC= 20000000;
SZ= 5000;

var tc= { //U: coordenadas origen de cada tile
	no: [XC-SZ,YC-SZ], ne: [XC,YC-SZ],
  so: [XC-SZ,YC],    se: [XC,YC]
}

var ts= { //U: tiles
	no: [], ne: [],
  so: [], se: []
};

var TIPOS= ['ts', 'l', 'p'];
for (var d= 1; d<SZ; d+= 1000) { var l= Math.floor(d**0.5);
	for (var t in TIPOS){
		ts.no.push(["eNO_"+(d+t)+'_'+TIPOS[t],XC-l,YC-l]); ts.ne.push(["eN_"+(d+t)+'_'+TIPOS[t],XC,YC-d]); ts.ne.push(["eNE_"+(d+t)+'_'+TIPOS[t],XC+l,YC-l]);
		ts.so.push(["eSO_"+(d+t)+'_'+TIPOS[t],XC-l,YC+l]); ts.se.push(["eS_"+(d+t)+'_'+TIPOS[t],XC,YC+d]); ts.se.push(["eSE_"+(d+t)+'_'+TIPOS[t],XC+l,YC+l]);
		ts.so.push(["eO_"+(d+t)+'_'+TIPOS[t],XC-d,YC]); ts.se.push(["eE_"+(d+t)+'_'+TIPOS[t],XC+d,YC]);
	}
}

for (k in tc) {
	fs.writeFileSync(
		sprintf((process.env.OUTDIR||"../data/ds_a")+"/x_net_e_%08d_%08d.tsv",tc[k][0],tc[k][1]),
		ts[k].map(d => d.join("\t")).join("\n")+"\n"
	);
}
