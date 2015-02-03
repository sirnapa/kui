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
    botones: [
        {
            comentario: 'Ejemplo de botón personalizado',
            icono: 'link',
            onclick: function(){
                alert('Acción personalizada');
            }
        },{
            comentario: 'Botón que sale solo cuando el nombre empieza con A',
            icono: 'at',
            onclick: function(){
                alert('Esta tarjeta tiene un nombre que empieza con A.')
            },
            mostrar: function(item){
                return item.nombre.charAt(0)=='A';
            }
        }
    ],
    onclick: click
});