//INFO: base de datos sql y forms
var L= require(__dirname+'/lib.js');
var Sequelize= require('sequelize');
var Joi= require('@hapi/joi'); //A: para validar input, definir esquema //VER: https://github.com/hapijs/joi

var fs= require('fs');
eval(fs.readFileSync(__dirname+'/../lib/lib.js','utf-8')); //TODO: emprolijar/hacer modulo?

var Cx= null;
var M= {}; //U: los modelos

//S: definir tipos de datos una sola vez para validar, db, forms, etc.
var UserDefJoi= toJoi(tUser);

//------------------------------------------------------------
// default user list
var users = [
      ["Podemos","Aprender"],
      ["Los Maestros","Roban"],
      ["Mauricio","Cap"],
			["Hola","Mundo"],
    ];
var Contextos= {
			 "batman": {protagonista: "Batman", meta: "salvar ciudad gotica", ayudante: "Alfred", vehiculo: "Batimovil" },
			 "cenicienta": {protagonista: "Cenicienta", meta: "ir al baile", ayudante: "el hada Madrina", vehiculo: "carroza" },
			};


var QuiereReiniciarLaDb= true; //OjO! Borra los datos
function load_data(){// populate table with default users
  if (!QuiereReiniciarLaDb) { return }

  //A: si llego aqui, borramos las tablas y las cargamos de nuevo! 
  M.User.sync({force: true}) // using 'force' it drops the table users if it already exists, and creates a new one
    .then(function(){
      // Add the default users to the database
      for(var i=0; i<users.length; i++){ // loop through all users
        M.User.create({ firstName: users[i][0], lastName: users[i][1]}); // create a new entry in the users table
      }
    }); 

	M.CuentoContexto.sync({force: true}) //TODO: generalizar tipos de datos y datos iniciales
    .then(function(){
			Object.keys(Contextos).forEach( k => {
				var v= Contextos[k];
				v.nombre= k;
				M.CuentoContexto.create(v);
			});	
		});
}

function connect(wantsReconnect) { //U: load_data a new database, using credentials in .env
	if (Cx && !wantsReconnect) { return Cx; }
	L.ensureDir(".data");
	Cx= new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
		host: '0.0.0.0',
		dialect: 'sqlite',
		pool: {
			max: 5,
			min: 0,
			idle: 10000
		},
			// Security note: the database is saved to the file `database.sqlite` on the local filesystem. It's deliberately placed in the `.data` directory
			// which doesn't get copied if someone remixes the project.
		storage: '.data/database.sqlite'
	});
}

function init() {
	connect();
	return Cx.authenticate()
  .then(function(err) {
    console.log('DB Connection has been established successfully.');
    M.User= Cx.define('users', toSequelize(tUser)); //A: define a new table 'users'
		M.CuentoContexto= Cx.define('cuentos', toSequelize(tCuentoContexto)); 
		//TODO: leer de directorio app un archivo de inicio que defina para cada app
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });
}

module.exports= {Cx, connect, init, load_data, M};
