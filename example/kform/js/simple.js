$('#simple').kForm({
    campos : [

		{
	            nombre : 'linea',
	            titulo: 'Línea',
	            requerido: true
	    },
	    {
	            nombre : 'nombre',
	            titulo: 'Nombre'
	    },{
	            nombre : 'apellido',
	            titulo: 'Apellido'
	    },{
	            nombre : 'documento',
	            titulo: 'Documento'
	    },{
	            nombre : 'nombreRol',
	            titulo: 'Rol',
	            tipo: 'combo',
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
	    		nombre: 'activo',
	    		titulo: 'Activo',
	    		tipo: 'Boolean'
	    }
    ],
    submit: '/exito'
});