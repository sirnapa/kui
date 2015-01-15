$('#conagregar').kGrid({
    url : 'js/datos.json',
    id : 'pkEncuesta',
    campos : [{
            nombre : 'nombre',
            titulo: 'Nombre',
            ancho: 4,
            requerido: true,
            atributos: {
                'readonly':true,
                'data-creable': true
                },
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
            nombre : 'fechaAlta',
            titulo: 'Creado',
            requerido: true,
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
            },
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
    ondblclick: true,
    loadComplete: function(){
        // Agrego un botón para agregar entradas
        $('#conagregar').before(
            $('<button>').html('Agregar entrada')
            .addClass('btn btn-default')
            .click(function(){
                $('#conagregar').kGrid('agregar');
            })
        );
        $('#conagregar').before('<br><br>');
    }
});