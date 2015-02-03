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
            }
    },{
            nombre : 'empresa',
            titulo: 'Empresa',
            ancho: 4,
            requerido: true,
            atributos: {
                'readonly':true,
                'data-creable': true
                },
            tipo: 'combo',
            opciones: {
                origen: [
                    {pkEmpresa:'1',nombre:'Konecta'},
                    {pkEmpresa:'2',nombre:'Documenta'},
                    {pkEmpresa:'3',nombre:'Otra empresa'},
                ],
                id: 'pkEmpresa',
                formato: 'nombre'
            }
    },{
            nombre : 'fechaAlta',
            titulo: 'Creado',
            requerido: true,
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
        guardar: guardar,
        agregar: agregar
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