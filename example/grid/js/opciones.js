var empresas =  [
    {pkEmpresa:'1',nombre:'Konecta'},
    {pkEmpresa:'2',nombre:'Documenta'},
    {pkEmpresa:'3',nombre:'Otra empresa'},
];

$('#opciones').kui('grid',{
    origen : 'js/datos.json',
    id : 'pkEncuesta',
    campos : [{
            nombre : 'nombre',
            titulo: 'Nombre',
            ancho: 4,
            requerido: true,
            soloLectura: true,
            atributos: {
                'data-creable': true
            }
    },{
            nombre : 'empresa',
            titulo: 'Empresa',
            ancho: 4,
            requerido: true,
            tipo: 'combo',
            opciones: {
                origen: function(row){
                    var opciones = empresas.slice(0);
                    for(var i=1;i<6;i++){
                        opciones.push({
                            pkEmpresa: i,
                            nombre: 'Adicional ' + i + ' para ' + row.nombre
                        });
                    }
                    return opciones;
                },
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
        $('#opciones').before(
            $('<button>').html('Agregar entrada')
            .addClass('btn btn-default')
            .click(function(){
                $('#opciones').kGrid('agregar');
            })
        );
        $('#opciones').before('<br><br>');
    }
});