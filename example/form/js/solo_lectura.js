$('#solo_lectura').kui('form',{
	soloLectura: true,
	origen: 'js/datos.json',
    campos : [
	    {
	            nombre : 'nombre',
	            titulo: 'Nombre',
	            placeholder: 'Ejemplo de tipo texto',
	            requerido: true
	    },{
	    		nombre: 'activo',
	    		titulo: 'Activo',
	    		tipo: 'booleano',
	    		placeholder: 'Ejemplo de tipo booleano'
	    },{
	    		nombre: 'cantidad',
	    		titulo: 'Cantidad',
	    		tipo: 'numero',
	    		placeholder: 'Ejemplo de tipo número'
	    },{
	    		nombre: 'porcentaje',
	    		titulo: 'Porcentaje',
	    		tipo: 'decimal',
	    		placeholder: 'Ejemplo de tipo decimal'
	    },{
	            nombre : 'rol',
	            titulo: 'Rol',
	            tipo: 'combo',
	            placeholder: 'Ejemplo de tipo combo',
	            opciones: {
	            	origen: [
	            		{id:'1',nombre:'Administrador'},
	            		{id:'2',nombre:'Supervisor'},
	            		{id:'3',nombre:'Vendedor'},
	            	],
	            	id: 'id',
	            	formato: 'nombre'
	            }
	    },{
	    		nombre: 'nacimiento',
	    		titulo: 'Nacimiento',
	    		tipo: 'fecha',
	    		placeholder: 'Ejemplo de tipo fecha'
	    },{
	    		nombre: 'entrada',
	    		titulo: 'Entrada',
	    		tipo: 'hora',
	    		placeholder: 'Ejemplo de tipo hora'
	    },{
	    		nombre: 'alta',
	    		titulo: 'Alta',
	    		tipo: 'fecha-hora',
	    		placeholder: 'Ejemplo de tipo fecha-hora'
	    }
    ],
    submit: '/exito'
});