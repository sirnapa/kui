var seleccionados = [17348,17400,18000];

$('#seleccionable').kGrid({
    url : 'js/datos.json',
    id : 'pkEncuesta',
    campos : [{
            nombre : 'nombre',
            titulo: 'Nombre',
            tipo: 'encabezado',
            ancho: 4
    },{
            nombre : 'fechaAlta',
            titulo: 'Creado'
    },{
            nombre : 'fechaModif',
            titulo: 'Modificado'
    },{
            nombre : 'vigenciaInicio',
            titulo: 'Vigencia',
            formato: function(campo,row){
                return campo + ' al ' + row['vigenciaFin']
            },
            tipo: 'destacado',
            atributos: {'readonly':false}
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
        remover: remover,
        activar: activar,
        editar: editar
    },
    seleccionable: true,
    seleccionados: seleccionados
});