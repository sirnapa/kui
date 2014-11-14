var estilos = {
    'Bootstrap' : 'bootstrap-theme',
    'Konecta'   : 'k',
    'Personal'  : 'personal' 
}

$(document).ready(function () {
    agregarGrilla('simple','Simple');
    agregarGrilla('seleccionable','Grilla seleccionable');
    agregarGrilla('tarjetas','Tarjetas');
    //agregarGrilla('tarjetasconscores','Con score');
});

function cambioEstilo(btn){
    $('#tema').html($(btn).html());
    $('#hojaEstilo').attr('href','../assets/css/'+estilos[$(btn).html()]+'.css');
}

function agregarGrilla(id,label){
    var wrapper = $('<div>').attr('id','div'+id)
        .css('padding-top',70)
        .appendTo('#grillas');
    $('<h3>').html(label).appendTo(wrapper);
    $('<hr>').appendTo(wrapper);
    $('<div>').attr('id',id).appendTo(wrapper);
    $('<a>').attr('href','#div'+id)
        .html(label)
        .appendTo(
                $('<li>').appendTo('#navbar-menu ul')
            );

    $('<script>').attr('src','js/'+id+'.js').appendTo('body');
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
function onclick(item){
    alert('on click!');
}