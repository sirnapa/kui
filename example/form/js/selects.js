$('#selects').kui('form',{
    origen: 'js/datos.json',
	campos : [
	    {
	            nombre : 'id',
	            oculto: true
	    },{
	            nombre : 'nombre',
	            requerido: true,
	            tipo: 'combo',
	            placeholder: 'Ejemplo de combo solo con strings',
	            opciones: {
	            	origen: ['Nelson Páez','Otro nombre']
	            }
	    },{
	            nombre : 'rol',
	            titulo: 'Rol',
	            tipo: 'combo',
	            placeholder: 'Ejemplo de tipo combo tradicional',
	            opciones: {
	            	origen: [
	            		{id:'1',nombre:'Administrador'},
	            		{id:'2',nombre:'Supervisor'},
	            		{id:'3',nombre:'Vendedor'},
	            	],
	            	id: 'id',
	            	formato: 'nombre'
	            }
	    }
    ],
    submit: submitFunction,
    afterSubmit: afterSubmitFunction
});