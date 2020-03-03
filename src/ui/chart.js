for (k in PRecharts) { Cmp[k]= PRecharts[k]; }

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

function scr_chart(my) {
	my.render= function () {
		return {cmp: 'div', style: {position:'relative', width: '80%', margin: 'auto'}, children: [
			{cmp: 'HorizontalBar',
				//responsive: true,
        data:data,
//        width: '80vw', height: '20vh',
        options: options,
     	}, 
			'Hola',
		]};
	}
}

