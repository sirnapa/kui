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
	    		nombre: 'activo',
	    		titulo: 'Activo',
	    		tipo: 'booleano',
	    		placeholder: 'Ejemplo de tipo booleano',
	    		soloLectura: true
	    },{
	    		nombre: 'cantidad',
	    		titulo: 'Cantidad',
	    		tipo: 'numero',
	    		placeholder: 'Ejemplo de tipo número',
	    		soloLectura: true
	    },{
	    		nombre: 'porcentaje',
	    		titulo: 'Porcentaje',
	    		tipo: 'decimal',
	    		placeholder: 'Ejemplo de tipo decimal',
	    		soloLectura: true
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
	    		placeholder: 'Ejemplo de tipo fecha',
	    		soloLectura: true
	    },{
	    		nombre: 'entrada',
	    		titulo: 'Entrada',
	    		tipo: 'hora',
	    		placeholder: 'Ejemplo de tipo hora',
	    		soloLectura: true
	    },{
	    		nombre: 'alta',
	    		titulo: 'Alta',
	    		tipo: 'fecha-hora',
	    		placeholder: 'Ejemplo de tipo fecha-hora',
	    		soloLectura: true
	    }
    ],
    submit: submitFunction,
    afterSubmit: afterSubmitFunction
});