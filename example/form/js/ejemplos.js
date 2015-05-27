var funciones = '';
var datos_json = JSON.stringify($.parseJSON($.ajax({
      url:'js/datos.json',
      success:function(data){
        return data;
      },
      async: false
    }).responseText),null,4);

$(document).ready(function () {
    agregar_ejemplo('agregar','Agregar');
    agregar_ejemplo('editar','Editar');
    agregar_ejemplo('solo_lectura','Sólo lectura');
});