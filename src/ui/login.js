function scr_login(my){ //U: formulario de ingreso 
  var tecleando= (e, { name, value }) => my.setState({[name]: value});
	toState= (k) => { return { name: k, value: my.state[k], onChange: tecleando} };

  var enviarFormulario= () => {
    Auth_usr= my.state.nombre.trim();
    Auth_pass= my.state.password.trim();

    if(Auth_usr !='' && Auth_usr != null & Auth_usr != undefined){
      if(my.state.password !='' && my.state.password != null & my.state.password != undefined)
			auth_save();
      appGoTo("/home")
    }
  }

  my.render= function(){
    return (
      h(Grid,{textAlign:'center', style:{ height: '100vh' }, verticalAlign:'middle'},
        h(Grid.Column, {style: {maxWidth: 450}},
          h(Image,{style: {width: "10em", height: "10em", margin: 'auto'}, src:'./imagenes/logo.png'},), 
          h(Form, {size:'large',onSubmit: enviarFormulario },
            h(Segment,{stacked:true},
              h(Form.Input,{name: 'nombre',onChange: tecleando , fluid:true, icon:'user', iconPosition:'left', placeholder:'E-mail address',value: my.state.nombre}),
              h(Form.Input,{name: 'password', onChange: tecleando, fluid:true, icon:'lock',iconPosition:'left',placeholder:'Password',type:'password',value: my.state.password}),
              h(Button,{color:'blue', fluid:true,size:'large'},"Login")  //onClick: () =>appGoTo("/menu")
            )
          )  
        )
      )
    )
  }
}


