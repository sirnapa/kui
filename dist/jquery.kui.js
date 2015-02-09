/*! kui - v0.0.5 - 2015-02-09
* https://github.com/konecta/kui
* Copyright (c) 2015 Nelson Paez; Licensed MIT */
/*! 
 *
 *   +++++++++++++++++++++ Core +++++++++++++++++++++ 
 *
 */

(function ($) {

  // Collection method.
  $.fn.kui = function () {
    return this.each(function (i) {
      // Do something to each selected element.
      $(this).html('kui' + i);
    });
  };

  // Static method.
  $.kui = function (options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.kui.options, options);
    // Return the name of your plugin plus a punctuation character.
    return 'kui' + options.punctuation;
  };

  // Static method default options.
  $.kui.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].kui = function (elem) {
    // Does this element contain the name of your plugin?
    return $(elem).text().indexOf('kui') !== -1;
  };

  // Formularios
  $.kui.formulario = {

    nuevo_elemento: function(solo_lectura,elemento,item,campo){

      /*
       * Tipos de campo:
       * - texto (no hace falta aclarar, es el tipo por defecto)
       * - booleano
       * - numero (enteros)
       * - decimal 
       * - archivo
       * - combo (requiere que se envíe "campo.opciones", que es un objeto que contiene:
                  * origen (requerido, puede ser una URL a un servicio o un array de objetos)
                  * id (requerido)
                  * formato (requerido)
                  * ajax (opcional, por defecto GET)
                  * data (opcional, por defecto {
                      _search false
                      filters null
                      page    1
                      rows    10
                      sidx    // acá va el valor de campo.opciones.id
                      sord    asc
                      todos   true
                  })
       * - fecha
       * - hora
       * - fecha-hora
       */

       var input;
       var valor_input;

       if(typeof campo.formato === 'function'){
          valor_input = function(){
            campo.formato.call(this,item[campo.nombre],item);
          };
       }else if(campo.tipo==='combo'){
          var identificador = solo_lectura? campo.opciones.formato : campo.opciones.id;

          valor_input = typeof campo.opciones.formato==='function'?
            campo.opciones.formato : function(){
              return item[campo.nombre]? item[campo.nombre][identificador] : 
              (item[campo.nombre+'.'+identificador]? item[campo.nombre+'.'+identificador]: '');
            };

       }else{
          valor_input = function(){
            return item[campo.nombre];
          };
       }


       var crear_input_select = function(tipo){

          return $('<'+tipo+'>').addClass('form-control')
              .attr('data-rol','input')
              .attr('name',campo.nombre)
              .attr('placeholder',
                  campo.placeholder===undefined?
                  campo.titulo : campo.placeholder)
              .attr('title',
                  campo.mensaje===undefined?
                  'El formato ingresado no es correcto para ' + campo.titulo : campo.mensaje)
              .val(valor_input())
              .prop('required',campo.requerido);
       };

       var crear_input = function(icono){

          if(campo.icono!==undefined){
              icono=campo.icono;
          }

          var nuevo_input = crear_input_select('input');

          if(campo.simple){
            nuevo_input.appendTo(elemento);
          }else{
            var inputGroup = $('<div>').addClass('input-group')
              .appendTo(elemento);

            $('<span>').addClass('input-group-addon')
                .html('<i class="fa fa-' + icono + '"></i>')
                .appendTo(inputGroup);

            nuevo_input.appendTo(inputGroup);
          }

          return nuevo_input;
       };

       var crear_select = function(){
          var nuevo_input = crear_input_select(solo_lectura?
              'input' : 'select');
          nuevo_input.attr('name',campo.nombre+'.'+campo.opciones.id);
          nuevo_input.appendTo(elemento);

          if(!solo_lectura){
              var opciones = [];

              if(typeof campo.opciones.origen === 'string'){
                  $.ajax({
                      type: campo.opciones.ajax,
                      url: campo.opciones.origen,
                      data: campo.opciones.data===undefined?
                      {
                          _search: false,
                          filters: null,
                          page:    1,
                          rows:    10,
                          sidx:    campo.opciones.id,
                          sord:    'asc',
                          todos:   true
                      } : campo.opciones.data,
                      success: function(retorno){ 
                          if (!retorno.error) {
                              opciones = retorno.respuesta.datos;
                          }
                      },
                      async: false
                  });
              }else{
                  opciones = campo.opciones.origen;
              }

              var seleccionado = false;

              $.each(opciones,function(o,opcion){
                  var item = $('<option>')
                      .attr('value',opcion[campo.opciones.id])
                      .html(
                          typeof campo.opciones.formato==='function'?
                          campo.opciones.formato.call(this,opcion) 
                          : opcion[campo.opciones.formato]
                      )
                      .appendTo(nuevo_input);
                  
                  if(valor_input().toString()===opcion[campo.opciones.id].toString()){
                      item.attr('selected',true);
                      seleccionado = true;
                  }
              });

              if(!seleccionado){
                  $('<option>').attr('value','').html('')
                      .attr('selected',true)
                      .prependTo(nuevo_input);
              }

              nuevo_input.combobox();    
          }

          return nuevo_input;
       };

       var conf_fecha_hora = {
          'fecha': {
                  icono: 'calendar',
                  formato: 'dd/MM/yyyy',
                  constructor: {pickTime: false}
              },
          'hora': {
                  icono: 'clock-o',
                  formato: 'hh:mm:ss',
                  constructor: {pickDate: false}
              },
          'fecha-hora': {
                  icono: 'clock-o',
                  formato: 'dd/MM/yyyy hh:mm:ss'
              }
       };

       var crear_combo_fecha_hora = function(tipo){
          var nuevo_input = crear_input(conf_fecha_hora[tipo].icono);
          var inputGroup = nuevo_input.parent();
          inputGroup.addClass('date');

          nuevo_input.attr('data-format',conf_fecha_hora[tipo].formato)
              .attr('type','text')
              .prependTo(inputGroup);

          if(tipo!=='hora'){
              nuevo_input.attr('data-rule-date',true);
          }

          if(!solo_lectura){
              inputGroup.find('.input-group-addon').addClass('add-on');

              var constructor = {language: "es",autoclose: true};
              $.extend(constructor,conf_fecha_hora[tipo].constructor);
              inputGroup.datetimepicker(constructor);
          }

          return nuevo_input;
       };

       switch(campo.tipo) {

          case 'booleano':
              input = crear_input_select('input');
              input.appendTo(elemento);
              input.prop('type','checkbox');
              if(input.val()==='true' || input.val().toUpperCase()==='S') {
                  input.attr('checked','checked');
              }
              input.removeClass('form-control')
                  .css('margin-top','10px');
          break;

          case 'numero':
              input = crear_input('circle-thin');
              input.attr('type','number');
          break;

          case 'decimal':
              input = crear_input('circle-thin');
              input.attr('type','number');
              input.attr('step','any');
          break;

          case 'archivo':
              input = crear_input('file');
              input.attr('type','file');
              //kForm.form.attr('enctype','multipart/form-data');
          break;

          case 'combo':
              input = crear_select();
          break;

          case 'fecha':
              input = crear_combo_fecha_hora('fecha');
          break;

          case 'hora':
              input = crear_combo_fecha_hora('hora');
          break;

          case 'fecha-hora':
              input = crear_combo_fecha_hora('fecha-hora');
          break;

          default:
              /* Tipo texto */
              input = crear_input('align-right');
              input.attr('type','text');
          break;
      }

      if(campo.atributos!==undefined){
          $.each(campo.atributos,function(atributo,valor){
              input.attr(atributo,valor);
          });
          
          var campos_especiales = ['disabled','readonly'];
          $.each(campos_especiales,function(e,especial){
              if(campo.atributos[especial]==='false'){
                  input.removeAttr(especial);
              }
              input.attr('data-'+especial,campo.atributos[especial]);
          });
      }
    },

    validar: {

      reglas: function(){

          // Validaciones extras para el formulario

          $.validator.methods["date"] = function(value, element) {
              var check = false;
              var re_con_barras = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
              var re_con_guiones = /^\d{1,2}-\d{1,2}-\d{4}$/;
              var es_fecha = function(separador){
                  var adata = value.split(separador);
                  var gg = parseInt(adata[0],10);
                  var mm = parseInt(adata[1],10);
                  var aaaa = parseInt(adata[2],10);
                  var xdata = new Date(aaaa,mm-1,gg);
                  if ( ( xdata.getFullYear() === aaaa ) && 
                       ( xdata.getMonth () === mm - 1 ) && 
                       ( xdata.getDate() === gg ) ){
                    check = true;
                  } else{
                    check = false;
                  }
              };

              if(re_con_barras.test(value)){
                  es_fecha('/');
              } else if(re_con_guiones.test(value)){
                  es_fecha('-');
              } else{
                  check = false;
              }
              return this.optional(element) || check;
          };

      },

      error: function(form, errorMap, errorList) {
          // Clean up any tooltips for valid elements
          $.each(form.validElements(), function (index, element) {
              var $element = $(element);
              $element.data("title", "") // Clear the title - there is no error associated anymore
                  .removeClass("error")
                  .tooltip("destroy");
              $element.parent().removeClass("has-error");
          });
  
          // Create new tooltips for invalid elements
          $.each(errorList, function (index, error) {
              var $element = $(error.element);
              $element.tooltip("destroy") // Destroy any pre-existing tooltip so we can repopulate with new tooltip content
                  .data("title", error.message)
                  .addClass("error")
                  .tooltip(); // Create a new tooltip based on the error messsage we just set in the title
              $element.parent().addClass("has-error");
          });
      },

      fecha: function(form){
          $(form).find('input[data-rule-date=true]').each(function(i,input){
              var fechaVal = $(input).val();
              var fechaArray;
              var fechaFormato = {
                      dd: 0,
                      MM: 1,
                      yyyy: 2
              };
              if (fechaVal.indexOf('/') > 0){
                  fechaArray = fechaVal.split('/');
              } else {                
                  fechaArray = fechaVal.split('-');
                  fechaFormato.yyyy = 0;
                  fechaFormato.dd = 2;
              }
              $(input).val(
                      (fechaArray.length===3)?
                              (fechaArray[fechaFormato.yyyy] +'-' + fechaArray[fechaFormato.MM] + '-' + fechaArray[fechaFormato.dd])
                      : ''
              );
          });
      }

    }

  };


}(jQuery));
