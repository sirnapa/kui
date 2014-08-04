$('#tarjetas').kGrid({
    url : 'js/datos.json',
    id : 'pkEncuesta',
    tarjetas: true,
    campos : [{
            nombre : 'nombre',
            titulo: '',
            tipo: 'encabezado'
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
            tipo: 'destacado'
    }],
    jqGrid: true,
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
    onclick: onclick
});