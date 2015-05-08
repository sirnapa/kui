var seleccionados = [17348,17400,18000];

$('#seleccionable').kGrid({
    url : 'js/datos.json',
    id : 'pkEncuesta',
    campos : [{
            nombre : 'nombre',
            titulo: 'Nombre',
            ancho: 4
    },{
            nombre : 'fechaAlta',
            titulo: 'Creado',
            tipo: 'fecha'
    },{
            nombre : 'fechaModif',
            titulo: 'Modificado',
            tipo: 'fecha'
    },{
            nombre : 'vigenciaInicio',
            titulo: 'Vigencia',
            formato: function(campo,row){
                return campo + ' al ' + row['vigenciaFin']
            },
            atributos: {'readonly':false}
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
        remover: remover,
        activar: activar,
        editar: editar
    },
    seleccionable: true,
    seleccionados: seleccionados
});