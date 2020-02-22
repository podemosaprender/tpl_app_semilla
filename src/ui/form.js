options = [
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' },
  { key: 'o', text: 'Other', value: 'other' },
]

function cmp_MiFormRadio(my) {
	my.handleChange= (e, { value }) => {
		my.setState({value});
	};

	my.render= function(props, state) {
		var { value }= state;
		value= value || '';
		return h(Cmp.Form.Group,{inline: true},
				h(Cmp.label,{style: {marginRight: '1em'}},props.label),
				props.options.map(o => h(Cmp.Form.Radio, {
					label: o,
					value: o,
					checked: (value === o),
					onChange: my.handleChange,
				}))
			);
	}
}

function def2form(def) {

}

function scr_form(my) {
	my.render= function (props,state) {
		return h(Cmp.Container,{},
			cmp({cmp: 'Form', error: true, children: [
				{cmp: 'Form.Group', widths:'equal', children: [
					{cmp: 'Form.Input', fluid: true, label:'First name', placeholder:'First name' },
					{cmp: 'Form.Input', fluid: true, label:'Last name', placeholder:'Last name' },
					{
						cmp: 'Form.Select', 
						fluid: true,
						label:'Gender',
						options: options,
						placeholder:'Gender',
					},
				]},
				{cmp: 'MiFormRadio',label: "Tamaño: ", options: "Chico Mediano Grande".split(" ")},
				{cmp: 'Form.TextArea', label:'About', placeholder:'Tell us more about you...' },
				{cmp: 'Form.Checkbox', label:'I agree to the Terms and Conditions' },
				{cmp: 'Message', 
					error: true, 
					header:'Action Forbidden',
					content: 'You can only sign up for an account once with a given e-mail address.',
				},
				{cmp: 'Form.Button',txt: 'Submit'},
			]}
		));
	}
}
