LAYOUT.BG_COLOR= '#FFFFF';

function cmp_ContainerDesktop(my) {
	function hideFixedMenu() {my.setState({ fixed: false })}
  function showFixedMenu() {my.setState({ fixed: true })}

	my.render= function (props, state) {
		var fixed= state.fixed;
		var children= props.children;
		return {
		 "cmp": "Responsive",
		 "getWidth": getWidth, "minWidth": Cmp.Responsive.onlyTablet.minWidth,
		 "children": [
			{
			 "cmp": "Visibility",
				"onBottomPassed": showFixedMenu, "onBottomPassedReverse": hideFixedMenu, 
				"once": false, 
				"children": [
				{
				 "cmp": "Segment",
				 "vertical": true,"textAlign": "center",
				 "inverted": true, "style": { "minHeight": "1em 0em" },
				 "children": [
					{
					 "cmp": "Menu",
					 "fixed": fixed ? 'top' : null,
					 "inverted": !fixed,
					 "pointing": !fixed,
					 "secondary": !fixed,
					 "size": "large",
					 "children": [
						{
						 "cmp": "Container",
						 "children": props.items.map( it => (
								{ "cmp": "Menu.Item", "as": "a", "children": it }
							))
						}
					 ]
					},
				 ]
				}
			]
			},
			children
		 ]
		};
	}
}

function cmp_ContainerMobile(my) {

	my.handleSidebarHide= function () { my.setState({ sidebarOpened: false }); }
  my.handleToggle= function () { my.setState({ sidebarOpened: true }); }

	my.render= function (props, state) {
		var sidebarOpened= state.sidebarOpened;
		var children= props.children;

		return {
		 "cmp": "Responsive",
		 "as": Cmp.Sidebar.Pushable,
		 "getWidth": getWidth,
		 "maxWidth": Cmp.Responsive.onlyMobile.maxWidth,
		 "children": [
			{
			 "cmp": "Sidebar",
			 "as": Cmp.Menu,
			 "animation": "push", "inverted": true,
			 "onHide": my.handleSidebarHide,
			 "visible": sidebarOpened,
			 "vertical": true,
			 "children": props.items.map( it => (
					{ "cmp": "Menu.Item", "as": "a", "children": it }
				))
			},
			{
			 "cmp": "Sidebar.Pusher",
			 "dimmed": sidebarOpened,
			 "children": [
				{
				 "cmp": "Segment",
				 "vertical": true, "inverted": true,
				 "textAlign": "center", "style": { "minHeight": "1em 0em" },
				 "children": [
					{
					 "cmp": "Container",
					 "children": [
						{
						 "inverted": true,
						 "pointing": true,
						 "secondary": true,
						 "size": "large",
						 "cmp": "Menu",
						 "children": [
							{
							 "onClick": my.handleToggle,
							 "cmp": "Menu.Item",
							 "children": [
								{
								 "name": "sidebar",
								 "cmp": "Icon"
								}
							 ]
							},
						 ]
						}
					 ]
					},
				 ]
				},
				children
			 ]
			}
		 ]
		}
	}
}

function cmp_ContainerResponsive(my) {
	my.render= function(props) {
		return {cmp: 'div', children: [
			{... props, cmp: 'ContainerDesktop'},
			{... props, cmp: 'ContainerMobile'},
		]};
	}
}

//SEE: https://www.chartjs.org/docs/latest/charts/bar.html
data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: [65, 59, 80, 81, 56, 55, 40]
    },
		{
      label: 'My Second dataset',
      backgroundColor: 'rgba(0,255,132,0.7)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: [65, 59, 80, 81, 56, 55, 40]
    }
  ]
};

data = {
  //labels: ['January'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: [65],
    },
		{
      label: 'My Second dataset',
      backgroundColor: 'rgba(0,255,132,0.7)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: [65],
    }
  ]
};


options= {
	legend: {
		display: false,
	},
	scales: {
			xAxes: [{ stacked: true }],
			yAxes: [{ stacked: true }]
	}
}

function cmp_chart(my) {
	my.render= function () {
		return {cmp: 'div', children: [
			{cmp: 'div', style: {position:'relative', width: '80%', margin: 'auto'}, children: [
				{cmp: 'HorizontalBar',
					//responsive: true,
					data:data,
	//        width: '80vw', height: '20vh',
					options: options,
				}, 
			]}
		]};
	}
}

function scr_foco(my) {
	my.render= function () {
		return {cmp: 'ContainerResponsive', items: ['Comprar','Hacer','Planear'],
		children: [
			{cmp: 'Segment', children: 'Que le ponemos adentro?'},
			{cmp: 'chart'},
		]};
	}
}
