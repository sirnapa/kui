function agregar_ejemplo(id,label,customDivExample){
    var wrapper = $('<div>').attr('id','div-'+id)
        .css('padding-top',70)
        .appendTo('#ejemplos');

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
        ).tooltip({title:'Ejemplo'});

    var ejemplo = $('<div>').attr('id','ejemplo-'+id)
        .attr('role','tabpanel')
        .addClass('tab-pane active')
        .appendTo(tabcontents);
    
    var exampleContent = customDivExample? 
        $(customDivExample) : $('<div>').attr('id',id);

    exampleContent.appendTo(ejemplo);  

    // Pestaña de código HTML
    $('<a>').attr('href','#html-'+id)
        .attr('aria-controls','html-'+id)
        .attr('role','tab')
        .attr('data-toggle','tab')
        .html('<i class="fa fa-html5"></i>')
        .appendTo(
            $('<li>').attr('role','presentation').appendTo(tabs)
        ).tooltip({title:'HTML'});

    var html = $('<div>').attr('id','html-'+id)
        .attr('role','tabpanel')
        .addClass('tab-pane')
        .appendTo(tabcontents);

    $('<pre>').html(parseHtmlChar(ejemplo.html().toString()))
        .appendTo(html);
    
    // Pestaña de código JS
    $('<a>').attr('href','#codigo-'+id)
        .attr('aria-controls','codigo-'+id)
        .attr('role','tab')
        .attr('data-toggle','tab')
        .html('<i class="fa fa-code"></i>')
        .appendTo(
            $('<li>').attr('role','presentation').appendTo(tabs)
        ).tooltip({title:'Javascript'});

    var codigo = $('<div>').attr('id','codigo-'+id)
        .attr('role','tabpanel')
        .addClass('tab-pane')
        .appendTo(tabcontents);

    var url = 'js/'+id+'.js';
    $.get(url,{},function(retorno){
        var parseado = parseHtmlChar(retorno + '\n\n' + funciones);
        $('<pre>').html(parseado).appendTo(codigo);
    });

    // Pestaña de datos
    if(datos_json!==undefined){
        $('<a>').attr('href','#datos-'+id)
            .attr('aria-controls','datos-'+id)
            .attr('role','tab')
            .attr('data-toggle','tab')
            .html('<i class="fa fa-database"></i>')
            .appendTo(
                $('<li>').attr('role','presentation').appendTo(tabs)
            ).tooltip({title:'Datos'});

        var datos = $('<div>').attr('id','datos-'+id)
            .attr('role','tabpanel')
            .addClass('tab-pane')
            .appendTo(tabcontents);
        $('<pre>').html(datos_json)
                .appendTo(datos);   

    }

    // Menú y código requerido
    $('<a>').attr('href','#div-'+id)
        .html(label)
        .appendTo(
                $('<li>').appendTo('#navbar-menu ul')
            );

}

function parseHtmlChar(s){
    var rules = [
        ['&','&amp;'],
        ['<','&lt;'],
        ['>','&gt;']
    ];

    for(var i=0;i<rules.length;i++){
        s = s.replace(new RegExp(rules[i][0],'g'), rules[i][1]);
    }

    return s;
}