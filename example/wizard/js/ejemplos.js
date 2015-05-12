var funciones = '';
$.get('js/funciones.js',{},function(retorno){
    funciones = retorno;
});

var datos_json;

$(document).ready(function () {
    agregar_ejemplo('custom-html','HTML Personalizado','#custom-html');
});