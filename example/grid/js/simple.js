$('#simple').kui('grid',{
    origen : 'js/datos.json',
    id : 'pkEncuesta',
    campos : [{
            nombre : 'nombre',
            titulo: 'Nombre',
            ancho: 4,
            soloLectura: true
    },{
            nombre : 'fechaAlta',
            titulo: 'Creado',
            tipo: 'fecha'
    },{
            nombre : 'fechaModif',
            titulo: 'Modificado',
            tipo: 'fecha'
    },{
            nombre : 'anonimo',
            titulo: 'NN',
            ancho: 1,
            tipo: 'booleano',
            formato: function(campo,row){
                    return campo=='S';
            }
    }],
    estado : function(item) {
            if (item['activo'] == 'S') {
                    return true;
            }
            return false;
    },
    permisos: {
        remover: true,
        activar: activar,
        editar: true,
        guardar: guardar
    },
    ondblclick: true
});
