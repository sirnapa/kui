var estilos = {
    'Bootstrap' : 'bootstrap-theme',
    'Konecta'   : 'k',
    'Personal'  : 'personal' 
}

$(document).ready(function () {
    $('#grilla').kGrid({
        url : 'js/datos.json',
        id : 'pkEncuesta',
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
        //paginador: '#paginador',
        onclick: function(item){
            alert('on click!');
        }
    });    
});

function cambioEstilo(btn){
    $('#tema').html($(btn).html());
    $('#hojaEstilo').attr('href','../assets/css/'+estilos[$(btn).html()]+'.css');
}

function remover() {
    alert('Remover');
}
function activar() {
    alert('Activar');
}
function editar() {
    alert('Editar');
}