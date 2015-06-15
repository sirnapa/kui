var funciones = '';
$.get('js/funciones.js',{},function(retorno){
    funciones = retorno;
});

var datos_json = JSON.stringify($.parseJSON($.ajax({
      url:'js/datos.json',
      success:function(data){
        return data;
      },
      async: false
    }).responseText),null,4);

$(document).ready(function () {
    agregar_ejemplo('simple','Simple');
    agregar_ejemplo('seleccionable','Seleccionable');
    agregar_ejemplo('conagregar','Agregar entradas');
    agregar_ejemplo('conbotones','Botones');
    agregar_ejemplo('sinbotones','Sin botones');
});
