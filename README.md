# Plantilla de proyecto node, pReact, Semantic UI

##TODO Leeme primero!

Estoy limpiando y simplificando código de principiantes y __para principiantes__ (y personas que quieren trabajar rápido). Hay código feo, malas prácticas, vulnerabilidades ... argumentá por qué y ayudame a mejorarlo.

## Qué hay?
La guía de las UserStories deberían ser mayormente los tests en `spec/` complementados por la documentación que se genera en la carpeta `doc/`

Los fuentes van en `src/` y separamos:
* app: la parte que no es visual, lógica, etc.
* lib: funciones comunes a servidor y ui
* ui: solamente como mostrarle e interactuar con usuarios.
* server (a su vez se podría separar para desplegar en varios)

## Desarrollo

Armá tu ambiente ejecutando `npm i` que va a bajar todos los paquetes necesarios.

Las otras tareas también las automatizamos con `npm` ej. 

* `npm run serve` (servidor http aqui)
* `npm run test` (test automaticos y covertura con karma)

Podés ver todos en la sección `scripts` de `package.json`.

## Build

*No queremos* depender de una herramienta de build durante el desarrollo. Por eso tratamos de *no usar* construcciones que impidan probar o actualizar código simplemente pegándolo en la consola del navegador.

Para *el despliegue* si hacemos un build y uglify.

## Docs
Usamos JSDOC y PlantUML.
OjO!
1. PlantUML requiere java 1.8 (revisar la version que necesitan los .jar en node_modules/node-plantuml/vendor)
2. PlantUML requiere graphviz

## Test

### Escribir

OjO! 
1. Hay que usar ```function``` y no ```=>``` para no perder acceso a las funciones de mocha como ```timeout``` 
1. Si recibis ```done``` como parametro la tenés que llamar, aunque la funcion sea sincrona ...
1. Si es asincrona podes devolver una promesa o llamar done.

### Generar datos

Usando ```npm run test-gen-data``` desde el directorio principal.
	
Se puede partir un archivo con ...


```
	split -C 100000 -d area_vtx_all.tsv  x_area.
```

	Se generan en spec_data/generate

### Ejecutar

Para testear: Esta incluido en spec/index.html como lo carga el browser (sin import ni cosas raras)
	index.html carga otros js con los tests
	Se ejecuta con MOCHA y KARMA
	Podemos usar 'npm run test -- -- --cov' y generar coverage/
	
	Si hay problemas con KARMA:
		npx karma --log-level debug --singleRun true --no-browsers --port 8080 start ./spec/karma.conf.js
	(conectarse con el browser http://127.0.0.1:8080/ o http://127.0.0.1:18080/ si estas desde Vagrant)

	Genera reportes en coverage/

#### Troubleshooting

Si falla Chromium
```
node_modules/puppeteer/.local-chromium/linux-637110/chrome-linux/chrome
```
sudo apt-get install libxss1

### Decisiones

Reemplazar proj4 para usar la de Leaflet MAS estas definiciones https://kartena.github.io/Proj4Leaflet/
