var datos_json = JSON.stringify($.parseJSON($.ajax({
      url:'js/datos.json',
      success:function(data){
        return data;
      },
      async: false
    }).responseText),null,4);

var estilos = {
    'Bootstrap' : 'bootstrap-theme',
    'Konecta'   : 'k',
    'Personal'  : 'personal' 
}

$(document).ready(function () {
    agregarGrilla('simple','Simple');
    agregarGrilla('seleccionable','Seleccionable');
    agregarGrilla('tarjetas','Tarjetas');
    agregarGrilla('tarjetasconscores','Tarjetas con score');
    agregarGrilla('tarjetasmixtas','Tarjetas mixtas');
});

function cambioEstilo(btn){
    $('#tema').html($(btn).html());
    $('#hojaEstilo').attr('href','../assets/css/'+estilos[$(btn).html()]+'.css');
}

function agregarGrilla(id,label){
    var wrapper = $('<div>').attr('id','div-'+id)
        .css('padding-top',70)
        .appendTo('#grillas');

    $('<h3>').html(label).appendTo(wrapper);

    var tabpanel = $('<div>').attr('role','tabpanel')
        .appendTo(wrapper);
    var tabs = $('<ul>').attr('role','tablist')
        .addClass('nav nav-tabs')
        .appendTo(tabpanel);

    var tabcontents = $('<div>').addClass('tab-content')
        .appendTo(tabpanel);

    // Pestaña de ejemplo
    $('<a>').attr('href','#ejemplo-'+id)
        .attr('aria-controls','ejemplo-'+id)
        .attr('role','tab')
        .attr('data-toggle','tab')
        .html('<i class="fa fa-desktop"></i>')
        .appendTo(
            $('<li>').attr('role','presentation')
                .addClass('active')
                .appendTo(tabs)
        );

    var ejemplo = $('<div>').attr('id','ejemplo-'+id)
        .attr('role','tabpanel')
        .addClass('tab-pane active')
        .appendTo(tabcontents);

    $('<div>').attr('id',id).appendTo(ejemplo);

   

    // Pestaña de código
    $('<a>').attr('href','#codigo-'+id)
        .attr('aria-controls','codigo-'+id)
        .attr('role','tab')
        .attr('data-toggle','tab')
        .html('<i class="fa fa-code"></i>')
        .appendTo(
            $('<li>').attr('role','presentation').appendTo(tabs)
        );

    var codigo = $('<div>').attr('id','codigo-'+id)
        .attr('role','tabpanel')
        .addClass('tab-pane')
        .appendTo(tabcontents);

    var url = 'js/'+id+'.js';
    $.get(url,{},function(retorno){
        $('<pre>').html(retorno)
            .appendTo(codigo);
        //$('<script>').html(retorno).appendTo('body');
    });

    // Pestaña de datos
    $('<a>').attr('href','#datos-'+id)
        .attr('aria-controls','datos-'+id)
        .attr('role','tab')
        .attr('data-toggle','tab')
        .html('<i class="fa fa-database"></i>')
        .appendTo(
            $('<li>').attr('role','presentation').appendTo(tabs)
        );

    var datos = $('<div>').attr('id','datos-'+id)
        .attr('role','tabpanel')
        .addClass('tab-pane')
        .appendTo(tabcontents);
    $('<pre>').html(datos_json)
            .appendTo(datos);   

    // Menú y código requerido
     $('<a>').attr('href','#div-'+id)
        .html(label)
        .appendTo(
                $('<li>').appendTo('#navbar-menu ul')
            );

}