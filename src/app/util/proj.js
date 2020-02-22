//XXX:GALILEO:LIMPIAR Y TESTEAR

const TILE_SZ= 500; //U: metros de lado que tiene un tile de datos
const TILE_SZ_dm= TILE_SZ*10; //U: el tamaño de los tiles en "decimentros"

//XXX:CFG:por dataset!!!
const XXX_OFS_X = -50; //U: correccion X de la proyeccion (despues hay que corregir los parametros)
const XXX_OFS_Y = -50 + 10; //U: correccion Y de la proyeccion (despues hay que corregir los parametros)

//*****************************************************************************
//S: proj
const ElipsoideIntl1924Major = 6378388.0;
const ElipsoideIntl1924Flattening = 1 / 297.0;
const LatMax = -39.2;
const LatMin = -23.4;
const LatOrigen = ((LatMax - LatMin) / 2.0 + LatMin);
const LatOrigenRad = ((LatMax - LatMin) / 2.0 + LatMin) * Math.PI / 180.0;
const LongMin = -61.5;
const LongMax = -58.5;

const LongCentro = ((LongMax - LongMin) / 2.0 + LongMin);
const LongCentroRad = ((LongMax - LongMin) / 2.0 + LongMin) * Math.PI / 180.0;

const XFalseMin = 5346654.6134;
const XFalseMax = 5653345.3866;
const XFalseCentro = ((XFalseMax - XFalseMin) / 2.0 + XFalseMin) + 91.878675789;

const YFalseMin = 5660435.2104;
const YFalseMax = 7412620.6223;
const YFalseCentro = ((YFalseMax - YFalseMin) / 2.0 + YFalseMin) + 1463.211680856;

const ProjectionDb = '+proj=tmerc +a=' + ElipsoideIntl1924Major + ' +b=' + (ElipsoideIntl1924Major * (1 - ElipsoideIntl1924Flattening)) + ' +y_0=' + YFalseCentro + ' +x_0=' + XFalseCentro + ' +lon_0=' + LongCentro + ' +lat_0=' + LatOrigen;

//S: conversion
function latlng2Dbxy(latlng) { //XXX:ver si usar leaflet
    var tunnedWgs84= "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    var r= proj4(tunnedWgs84, ProjectionDb, [latlng[1], latlng[0]]);
    return [r[0] + XXX_OFS_X, r[1] + XXX_OFS_Y];
}

function dbXy2Latlng(xy) { //U: recibe un array [x,y] en coords de la db y devuelve [lat,lng]
	if (xy) {
    var tunnedWgs84= "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    var r= proj4(ProjectionDb, tunnedWgs84, [xy[0] - XXX_OFS_X, xy[1] - XXX_OFS_Y]);
    logm("DBG", 9, "PROJ dbXy2Latlng", { xy: xy, latlng: r });
    return [r[1], r[0]];
	}
}

function xyToOffset(obj,rect) {
	obj.x= obj.x-rect.Xmin; 
	obj.y= obj.y-rect.Ymin;
	return obj;
}

function dbXy2Latlng_polygon(arrayOfVtxXy,ofsX,ofsY) { //U: [x0,y0,x1,y1...] a [[lat0,lng0],...] SUMANDO ofsX y ofsY, PERO con la clase de Leaflet! 
	var r= []; ofsX= ofsX||0; ofsY=ofsY||0;
	for (var i=0; i<arrayOfVtxXy.length;i+=2) {
		var latlngArray= dbXy2Latlng([(arrayOfVtxXy[i]+ofsX)/10, (arrayOfVtxXy[i+1]+ofsY)/10]);
		r.push(new L.LatLng(latlngArray[0], latlngArray[1]));
  };
	return r;
}

function latlngBox2DbXyRect(nw, se, wantsTile) {
    var ll0= nw.lat ? [nw.lat, nw.lng] : nw;
    var ll1= se.lat ? [se.lat, se.lng] : se;
    var llr= [ll0[0], ll1[1]];
    var xy0db= latlng2Dbxy(ll0);
    var xy1db= latlng2Dbxy(ll1);
    var xyrdb= latlng2Dbxy(llr);
    var rot= (xyrdb[1] - xy0db[1]) / (xyrdb[0] - xy0db[0]);
    var rect= {
        ll0: ll0,
        ll1: ll1,
        rot: rot,
        s: 0.1
    };

    var rsz= Math.floor(Math.abs(xy0db[0] - xy1db[0]));
    var xmin= Math.floor(Math.min(xy0db[0], xy1db[0]));
    var ymin= Math.floor(Math.min(xy0db[1], xy1db[1]));
    if (wantsTile) {
        xmin= Math.floor(xmin / TILE_SZ) * TILE_SZ;
        ymin= Math.floor(ymin / TILE_SZ) * TILE_SZ;
        rsz= TILE_SZ;
        rect.Xmin= xmin * 10;
        rect.Ymin= ymin * 10;
        rect.Xmax= (xmin + rsz) * 10;
        rect.Ymax= (ymin + rsz) * 10;
        rect.d= rsz * 10;
    } else {
        rect.Xmin= xmin * 10;
        rect.Ymin= ymin * 10;
        rect.Xmax= Math.floor(Math.max(xy0db[0], xy1db[0])) * 10;
        rect.Ymax= Math.floor(Math.max(xy0db[1], xy1db[1])) * 10;
    }

    return rect;
}

function mapUrlForDbXy_google(dbXy) {
    ll= dbXy2Latlng([dbXy.x / 10, dbXy.y / 10]);
    return "https:/"+"/maps.google.com/maps?q=loc:" + ll
}

//****************************************************************************
//S: UTIL/Leaflet/Cuentas
function mapPointToArray(pointObject) {
    return [pointObject.lat, pointObject.lng];
}

function mapBoundsToArray(boundsObject) {
    return [mapPointToArray(boundsObject.getSouthWest()), mapPointToArray(boundsObject.getNorthEast())];
}

function mapSquareAround(latlngArray, margin) {
    return [
        [latlngArray[0] - margin, latlngArray[1] - margin],
        [latlngArray[0] + margin, latlngArray[1] + margin]
    ];
}

function mapVisibleRect(map) { //U: devuelve el area de mapa que esta mostrando leafleat como un rect en el sistema de coordenadas que usa la DB
	var bounds= map.getBounds();
	var nw= bounds.getNorthWest();
	var se= bounds.getSouthEast();
	var rect= latlngBox2DbXyRect(nw, se, false);
	rect.pixelsEn100m= map100MetersInPixels(map);
	return rect;
}

function map100MetersInPixels(map) {
	//D: Devuelve la distancia (en pixels) de 100 metros
	//D: Toma dos puntos geográficos, que sabemos están a 100m y calcula la distancia para el zoom actual.
	var centerLatLng = map.getCenter(); // get map center
	var pointC = map.latLngToContainerPoint(centerLatLng); // convert to containerpoint (pixels)

	// convert containerpoints to latlng's
	var latLngC = map.containerPointToLatLng(pointC);

	/*
	var pointX = [pointC.x + 1000, pointC.y]; // add 1000 pixel to x
	var latLngX = map.containerPointToLatLng(pointX);
	var distanceX = latLngC.distanceTo(latLngX); // calculate distance between c and x (latitude)
	*/

	var pointY = [pointC.x, pointC.y + 1000]; // add 1000 pixel to y
	var latLngY = map.containerPointToLatLng(pointY);
	var distanceY = latLngC.distanceTo(latLngY); // calculate distance between c and y (longitude)

	return (100*1000)/distanceY;
}

//*****************************************************************************
//S: funciones para calculos con tiles

function rectParaXy(xp,yp,tileSz) { //U: devuelve el rect al que pertenece ej. el xy de un elemento
		tileSz= tileSz||TILE_SZ;
    var x= Math.floor(xp / (10 * tileSz)) * tileSz;
    var y= Math.floor(yp / (10 * tileSz)) * tileSz;
    return {
        Xmin: x * 10,
        Ymin: y * 10,
        Xmax: (x + tileSz) * 10,
        Ymax: (y + tileSz) * 10,
        d: tileSz * 10,
        s: 0.1
    };
}

function extent_points_arrays(points) {
	var rectangle= {}

	var xcoords= points.map(function (p) { return p[0]; }); //XXX:generalizar, mover a lib
	var ycoords= points.map(function (p) { return p[1]; });
	var Xmax= Math.max.apply(null, xcoords);
	var Xmin= Math.min.apply(null, xcoords);
	var Ymax= Math.max.apply(null, ycoords)
	var Ymin= Math.min.apply(null, ycoords);

	rectangle= {Xmax : Xmax, Xmin : Xmin, Ymax : Ymax, Ymin : Ymin}
	return rectangle;
}

function rectIncluyeRect(rectAfuera,tileXY) { //U: devuelve verdadero si el primer rect incluye al segundo
   var result= false;
   if(rectAfuera){
      var xmin= rectAfuera.Xmin;
      var ymin= rectAfuera.Ymin;
      var xmax= rectAfuera.Xmax;
      var ymax= rectAfuera.Ymax;

   	result= 
			(tileXY.Xmin >= xmin && tileXY.Xmin <= xmax &&  tileXY.Ymin >= ymin &&  tileXY.Ymin <= ymax) ||
      (tileXY.Xmin >= xmin && tileXY.Xmin <= xmax &&   tileXY.Ymax >= ymin &&  tileXY.Ymax <= ymax) ||
      (tileXY.Xmax >= xmin && tileXY.Xmax <= xmax &&   tileXY.Ymax >= ymin &&  tileXY.Ymax <= ymax)||
      (tileXY.Xmin >= xmin && tileXY.Xmin <= xmax &&   tileXY.Ymin >= ymin &&  tileXY.Ymin <= ymax);
   }
   return result;
}

function rectIncluyeXy(rectAfuera,x,y) { //U: devuelve verdadero si el primer rect incluye al segundo
   var result= false;
   if(rectAfuera){
      var xmin= rectAfuera.Xmin;
      var ymin= rectAfuera.Ymin;
      var xmax= rectAfuera.Xmax;
      var ymax= rectAfuera.Ymax;

	    if (x >= xmin && x <= xmax &&  y >= ymin &&  y <= ymax) { result=true; }
   }
   return result;
}


function rectCentro(aRect,escala) { //U: devuelve  el punto medio de un rectangulo, divide por escala ej. si estaba en metros y hay que pasar a decimetros, usar escala=10
	escala= escala || 1;
	var x= promedio(aRect.Xmin, aRect.Xmax);
	var y= promedio(aRect.Ymin, aRect.Ymax);
	return [Math.floor(x / escala), Math.floor(y / escala)]
}

function rectExtenderHasta(aRect,ladoMin) { //U: extiende el rectangulo para que tenga como MINIMO ladoMin de lado
	var centro= rectCentro(aRect);
	return rectCentradoEn(centro[0],centro[1],Math.max(ladoMin,dX_rect(aRect),dY_rect(aRect)));
}

function rectCentradoEn(xCentro,yCentro,ladoSz) { //U: devuelve un rectangulo centrado en xCentro,yCentro de lado ladoSx
	var l2= Math.floor(ladoSz/2);
	return { 
		Xmin: xCentro-l2, Xmax: xCentro+l2,
		Ymin: yCentro-l2, Ymax: yCentro+l2,
	}
}

function rectCentroLatlng(aRect,escala) {
	return dbXy2Latlng(rectCentro(aRect,escala));
}

function dX_rect(rect) { return rect.Xmax - rect.Xmin; } //U: ancho X de un rect
function dY_rect(rect) { return rect.Ymax - rect.Ymin; } //U: alto Y de un rect

//Poligonos: Funciones para calcular tiles en segmentos y poligonos 
function searchPointOnList(arr, point) {
    return arr.findIndex(function(obj) {
        if(obj[0] === point[0] && obj[1] === point[1]) {
            return true;
        }
    });
};

function polyVtxCloserTo(arrayLatLngs, center) { //U: devuelve el vertice del poligono mas cercano al punto "center"
    var minDist;
    var ret;
    arrayLatLngs.map( function (o) {
        var dist= center.distanceTo(o);
        if (!minDist || minDist > dist) {
            minDist= dist;
            ret= o;
        }
    });
    return ret;
};


/**
*	Revisa si un punto está adentro de un polígono
* @param point {array} - Un array [X, Y]
* @param pol {array} - Un array con todas las esquinas del polígono [X0,Y0, X1,Y1,...]
* @return true | false
*
* @example
* var point= [1, 1];
* var pol= [0,0, 0,2, 2,0, 2,2];
* isPointInPolygon(point, pol);
*/
function isPointInPolygon(point, pol) { //A: verdadero si el punto [x,y] esta contenido en el poligono [[x0,y0],[x1,y1], ...]
	var ptX= point[0], ptY= point[1];
	for(var c= false, i= -2, l= pol.length, j= l - 2; (i= i+2) < l; j= i) { 
		var vtxIX= pol[i], vtxIY=pol[i+1], vtxJX= pol[j], vtxJY= pol[j+1];
		//DBG: console.log('XXX Variables', {i, point, vtxIX, vtxIY, vtxJX, vtxJY});
		//A: para cada par de vertices consecutivos, comenzando por el ultimo y el primero
		((vtxIY <= ptY && ptY < vtxJY) || (vtxJY <= ptY && ptY < vtxIY)) 
		//A: el Y del punto esta entre los Y de estos dos vertices
			&& (ptX < (ptY-vtxIY) * (vtxJX-vtxIX)/(vtxJY-vtxIY) + vtxIX) 
		//A: el X del punto esta a la derecha de la linea
			&& (c= !c); //A: si quedo a la derecha de una linea una cant de veces IMPAR, entonces esta adentro
	}
	return c;
};

function tilesForSegment(vI,vF,tileSz,acc) {
    logm("NFO", 8, "TILES IN POLYGON SEGMENT", {vi:vI,vf:vF,tileSz:tileSz});

    var acc= acc || [];

    var dx= vF[0]-vI[0];
    var dy= vF[1]-vI[1];

    var m= dy / dx;

    var dirX,dirY,nx,ny;

    var x= tileSz * Math.floor(vI[0]/tileSz);
    var xF= tileSz * Math.floor(vF[0]/tileSz);
    var y= tileSz * Math.floor(vI[1]/tileSz);
    var yF= tileSz * Math.floor(vF[1]/tileSz);

    acc.push([x,y]);

    var dx_dt= Math.abs(xF-x);
    var dy_dt= Math.abs(yF-y);

    if (dx >= 0) { dirX= 1; } 
		else if (dx < 0 ) {
        x= tileSz * Math.ceil(vI[0]/tileSz);
        dirX= -1;
    }
    nx= Math.floor(dx_dt/tileSz);

    if (dy >= 0) { dirY= 1; } 
		else if (dy < 0 ) {
        y= tileSz * Math.ceil(vI[1]/tileSz);
        dirY= -1;
    }
    ny= Math.floor(dy_dt/tileSz);

    for (; nx>0; nx--) {
        x+=dirX*tileSz;
        var ya= (m*(x-vF[0])+vF[1]);
        var point= [x,ya];
        var corner= [dirX>0?x:x+dirX*tileSz, tileSz*Math.floor(ya/tileSz)];
       	acc.push(corner); 
    }

    for (; ny>0; ny--) {
        y+=dirY*tileSz;
        var xa= vI[0]+(y-vI[1])/m;
        var point= [xa,y];
        var corner= [tileSz*Math.floor(xa/tileSz), dirY>0?y:y+dirY*tileSz];
       	acc.push(corner); 
    }

    acc.push([xF,yF]);

    logm("NFO", 7, "TILES IN POLYGON SEGMENT RESULT", {vi:vI,vf:vF,tileSz:tileSz,pointsCnt:acc.length});
    return acc;
}

function collectXMaxMinInRows(point,k,rowsAsKv) { //U: actualiza el Xmin y Xmin para cada Y como clave en rowsAsKv, ej. para calcular el Xmin y Xmax en cada franja de tiles de un poligono
	var x= point[0];
	var y= point[1];
	var row= rowsAsKv[y];
	if (!row) { rowsAsKv[y]= {Xmin:x,Xmax:x}; } //A: no estaba y lo agregue
	else {
		if (row.Xmin > x) { row.Xmin= x; } //A: estaba y este X es menor
		if (row.Xmax < x) { row.Xmax= x; } //A: estaba y este X es mayor
	}
	return rowsAsKv;
};

function foldTileRowsInPolygon(polygonAsArrayOfXYArray,tileSz,onTileRowInPoly, acc) { //U: llama la funcion onTileInPoly para cada tile en el poligono definido por los vertices en polygonAsArrayOfXYArray
    logm("NFO",8, "TilesInPolygon", {polygon:polygonAsArrayOfXYArray,tileSz:tileSz});
    var tilesFoundCnt= 0;
		
		var col= {push: function (p) { collectXMaxMinInRows(p,p,this.rows) }, rows: {}}; //XXX:LIB generalizar una funcion compatible con fold y el estado donde guarda

    // Points para segmentos
    for (var vtcIdx= 0; vtcIdx < polygonAsArrayOfXYArray.length; vtcIdx++) {
        var vI= polygonAsArrayOfXYArray[vtcIdx]; //First vertex
        var vF= vtcIdx+1 < polygonAsArrayOfXYArray.length ? polygonAsArrayOfXYArray[vtcIdx+1] : polygonAsArrayOfXYArray[0]; // Next vertex
        tilesForSegment(vI,vF,tileSz,col);
    }

    logm("NFO",9,"TilesInPolygon SEGMENT TILES", {polygon:polygonAsArrayOfXYArray,tileSz:tileSz, tilesFoundCnt: tilesFoundCnt});
		
    //A: Calcule para cada "y" el Xmin y Xmax
    logm("NFO",9,"TilesInPolygon SEGMENT TILES MAX MIN", {polygon:polygonAsArrayOfXYArray,tileSz:tileSz, tilesFoundCnt: tilesFoundCnt});

		var ys= col.rows;
    for (var k in ys) { var y= parseInt(k); var row= ys[y];
        var dx= row.Xmax-row.Xmin;
        var dir= dx >= 0 ? 1:-1;
        logm("NFO", 9, "TILES IN POLYGON ROW", {'y':y,dx:dx});
				acc= onTileRowInPoly({y: y,Xmin: row.Xmin,Xmax: row.Xmax, tileSz: tileSz},y,acc);
    }

    logm("NFO",8,"TILES IN POLYGON RESULT", {polygon:polygonAsArrayOfXYArray,tileSz:tileSz, tilesFoundCnt: tilesFoundCnt});
    return acc;
};

function foldTilesInPolygon(polygonAsArrayOfXYArray,tileSz, onTileInPoly, acc) { //U: llama la funcion onTileInPoly para cada tile en el poligono definido por los vertices en polygonAsArrayOfXYArray
	logm("NFO", 8, "TilesInPolygon", {polygon:polygonAsArrayOfXYArray,tileSz:tileSz});
	var tilesFoundCnt= 0;
	acc= foldTileRowsInPolygon(polygonAsArrayOfXYArray,tileSz,function (row,acc) {
		var y= row.y;
		var dx= row.Xmax-row.Xmin;
		var dir= dx >= 0 ? 1:-1;
		logm("NFO", 9, "TILES IN POLYGON ROW", {'y':y,dx:dx});
		for (var inc= row.Xmin; inc != row.Xmax; inc+=dir*tileSz) {
			var tile= rectParaXy(inc,y);
			acc= onTileInPoly(tile, acc); tilesFoundCnt++;
		}
	}, acc);
	logm("NFO", 8, "TILES IN POLYGON RESULT", {polygon:polygonAsArrayOfXYArray,tileSz:tileSz, tilesFoundCnt: tilesFoundCnt});
	return acc;
};

function tilesParaRect_stream(rect, tile_sz, cntMax) { //U: tiles que necesito para un rectangulo que quiero mostrar, como STREAM, que solo ocupa en memoria los parametros y un poquito de estado, en vez de un graaaan array de tiles
		tile_sz= tile_sz || TILE_SZ;
    var xmin= Math.floor(rect.Xmin / (10 * tile_sz)) * tile_sz;
    var ymin= Math.floor(rect.Ymin / (10 * tile_sz)) * tile_sz;
    logm("DBG", 7, "TILES PARA RECT", { rect: rect, xmin: xmin, ymin: ymin, tile_sz: tile_sz});

    var r= [];
		var ys= nuevo_stream_range(rect.Ymax/10,ymin,tile_sz);
		var xs= nuevo_stream_range(rect.Xmax/10,xmin,tile_sz);
		var xys= nuevo_stream_cross([xs,ys]);
		var tiless= nuevo_stream_map(xys,function (xy) { return rectParaXy(xy[0]*10,xy[1]*10,tile_sz) }, "isSync");
		return cntMax>-1 ? nuevo_stream_truncado(tiless,cntMax) : tiless;
}

//XXX:STREAMS!
function tilesParaRect(rect, tile_sz, cntMax) { //U: tiles que necesito para un rectangulo que quiero mostrar, como array que ocupa mas memoria
		var r= [];

		tile_sz= tile_sz || TILE_SZ;
    var xmin= Math.floor(rect.Xmin / (10 * tile_sz)) * tile_sz;
    var ymin= Math.floor(rect.Ymin / (10 * tile_sz)) * tile_sz;
    logm("DBG", 7, "TILES PARA RECT", { rect: rect, xmin: xmin, ymin: ymin, tile_sz: tile_sz});

    var r= [];
		for (var ys= ymin; ys<=rect.Ymax/10; ys+=tile_sz) {
		for(var xs= xmin; xs<=rect.Xmax/10; xs+=tile_sz) {
		var xy= [xs,ys];
		r.push( rectParaXy(xy[0]*10,xy[1]*10,tile_sz) );
		}
		}
		return r;
}

function alrededor_xy_rect_tile(xy,d) {
	return {
		Xmin: Math.floor( (xy.X - d)/TILE_SZ_dm ) * TILE_SZ_dm,
		Xmax: Math.floor( (xy.X + d)/TILE_SZ_dm ) * TILE_SZ_dm,
		Ymin: Math.floor( (xy.Y - d)/TILE_SZ_dm ) * TILE_SZ_dm,
		Ymax: Math.floor( (xy.Y + d)/TILE_SZ_dm ) * TILE_SZ_dm,
	};
}

function alrededor_xy_tiles(xy,d) {
	var rect= alrededor_xy_rect_tile(xy,d);
	var r= [];
	for (var x0= rect.Xmin; x0 <= rect.Xmax; x0+=TILE_SZ_dm) {
		for (var y0= rect.Ymin; y0 <= rect.Ymax; y0+=TILE_SZ_dm) {
			r.push({Xmin: x0, Ymin: y0, d: TILE_SZ_dm});
		}
	}
	return r;
}


