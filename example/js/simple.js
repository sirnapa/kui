$('#simple').kGrid({
    url : 'js/datos.json',
    id : 'pkEncuesta',
    campos : [{
            nombre : 'nombre',
            titulo: 'Nombre',
            ancho: 4,
            atributos: {
                'readonly':true,
                'data-creable': true
                }
    },{
            nombre : 'fechaAlta',
            titulo: 'Creado'
    },{
            nombre : 'fechaModif',
            titulo: 'Modificado'
    },{
            nombre : 'anonimo',
            titulo: 'NN',
            ancho: 1,
            formato: function(campo,row){
                    return campo=='S';
            },
            atributos: {'type':'checkbox'}
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
        $('#simple').before(
            $('<button>').html('Agregar entrada')
            .addClass('btn btn-default')
            .click(function(){
                $('#simple').kGrid('agregar');
            })
        );
        $('#simple').before('<br><br>');
    }
});