/*
 *
 *   +++++++++++++++++++++ Form +++++++++++++++++++++
 *
 */

(function ($) {

  $.kui.form = {

    newElement: function(readOnly,element,item,field,create){

      /*
       * Tipos de field:
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


       readOnly = readOnly || field.soloLectura;
       if(create && field.atributos!==undefined && field.atributos['data-creable']){
        readOnly = false;
       }

       var input;
       var inputVal  = $.kui.data.format(
        item,field.nombre,field.formato,field.opciones,readOnly
       );

       var newInputSelect = function(type){

          return $('<'+type+'>').addClass('form-control')
              .attr('data-rol','input')
              .attr('name',field.nombre)
              .attr('placeholder',
                  field.placeholder===undefined?
                  field.titulo : field.placeholder)
              .attr('title',
                  field.mensaje===undefined?
                  'El formato ingresado no es correcto para ' + field.titulo : field.mensaje)
              .val(inputVal)
              .prop('required',field.requerido);
       };

       var newInput = function(icono){

          if(field.icono!==undefined){
              icono=field.icono;
          }

          var input = newInputSelect('input');

          if(field.simple){
            input.appendTo(element);
          }else{
            var inputGroup = $('<div>').addClass('input-group')
              .appendTo(element);

            $('<span>').addClass('input-group-addon')
                .html('<i class="fa fa-' + icono + '"></i>')
                .appendTo(inputGroup);

            input.appendTo(inputGroup);
          }

          return input;
       };

       var newSelect = function(){
          var stringOnly = !field.opciones.id || !field.opciones.formato;
          var name = field.nombre;
          if(!stringOnly){
            name += '.' + field.opciones.id;
          }
          var select = newInputSelect(readOnly?
              'input' : 'select');
          select.attr('name',name);
          select.appendTo(element);

          if(!readOnly){
              var opciones = [];

              if(typeof field.opciones.origen === 'string'){
                  $.ajax({
                      type: field.opciones.ajax,
                      url: field.opciones.origen,
                      data: field.opciones.data===undefined?
                      {
                          _search: false,
                          filters: null,
                          page:    1,
                          rows:    10,
                          sidx:    field.opciones.id,
                          sord:    'asc',
                          todos:   true
                      } : field.opciones.data,
                      success: function(retorno){
                          if (!retorno.error) {
                              opciones = retorno.respuesta.datos;
                          }
                      },
                      async: false
                  });
              }else if(typeof field.opciones.origen === 'function'){
                  opciones = field.opciones.origen.call(this,item);
              }else{
                  opciones = field.opciones.origen;
              }

              var seleccionado = false;

              $.each(opciones,function(o,opcion){
                  var $opcion = $('<option>');
                  var id = '';

                  if(stringOnly){
                    id = opcion.toString();
                    $opcion.html(opcion).attr('value',opcion);
                  }else{
                    id = opcion[field.opciones.id];
                    $opcion.attr('value',id)
                      .html(
                        typeof field.opciones.formato==='function'?
                          field.opciones.formato.call(this,opcion)
                          : opcion[field.opciones.formato]
                      );
                  }

                  $opcion.appendTo(select);

                  if( inputVal && inputVal.toString() == id){
                      $opcion.attr('selected',true);
                      seleccionado = true;
                  }
              });

              if(!seleccionado){
                  $('<option>').html('')
                      .attr('selected',true)
                      .prependTo(select);
              }

              select.combobox();
          }

          return select;
       };

       var confDateTime = {
          'fecha': {
                  icono: 'calendar',
                  formato: $.kui.i18n.dateFormat,
                  rule: 'date',
                  constructor: {pickTime: false}
              },
          'hora': {
                  icono: 'clock-o',
                  formato: $.kui.i18n.hourFormat,
                  rule: 'hour',
                  constructor: {pickDate: false}
              },
          'fecha-hora': {
                  icono: 'calendar-o',
                  rule: 'datetime',
                  formato: $.kui.i18n.datetimeFormat
              }
       };

       var newDateTimeCombobox = function(type){
          // Los datetimepicker siempre deberán tener íconos
          field.simple = false;

          var input = newInput(confDateTime[type].icono);
          var inputGroup = input.parent();
          inputGroup.addClass('date');

          input.attr('data-format',confDateTime[type].formato)
              .attr('type','text')
              .attr('data-rule-'+confDateTime[type].rule,true)
              .prependTo(inputGroup);

          if(!readOnly){
              inputGroup.find('.input-group-addon').addClass('add-on')
                .find('i').attr({
                  'data-time-icon': 'fa fa-clock-o',
                  'data-date-icon': 'fa fa-calendar'
                });

              var constructor = {language: "es",autoclose: true};
              $.extend(constructor,confDateTime[type].constructor);
              inputGroup.datetimepicker(constructor);

              var widgets = $('.bootstrap-datetimepicker-widget.dropdown-menu');

              widgets.find('ul').addClass('list-unstyled');
              widgets.find('.icon-chevron-up').addClass('fa fa-chevron-up');
              widgets.find('.icon-chevron-down').addClass('fa fa-chevron-down');
              widgets.find('th.prev').html($('<i>').addClass('fa fa-chevron-left').css('font-size','0.5em'));
              widgets.find('th.next').html($('<i>').addClass('fa fa-chevron-right').css('font-size','0.5em'));
          }

          return input;
       };

       switch(field.tipo) {

          case 'booleano':
              input = newInputSelect('input');
              input.appendTo(element);
              input.prop('type','checkbox');
              input.prop('checked',inputVal);
              input.removeClass('form-control');
              element.addClass('checkbox');
          break;

          case 'numero':
              input = newInput('circle-thin');
              input.attr('type','number');
          break;

          case 'decimal':
              input = newInput('circle-thin');
              input.attr('type','number');
              input.attr('step','any');
          break;

          case 'archivo':
              input = newInput('file');
              input.attr('type','file');
              //kForm.form.attr('enctype','multipart/form-data');
          break;

          case 'combo':
              input = newSelect();
          break;

          case 'fecha':
              input = newDateTimeCombobox('fecha');
          break;

          case 'hora':
              input = newDateTimeCombobox('hora');
          break;

          case 'fecha-hora':
              input = newDateTimeCombobox('fecha-hora');
          break;

          default:
              /* Tipo texto */
              input = newInput('align-right');
              input.attr('type','text');
          break;
      }

      if(field.atributos!==undefined){
          $.each(field.atributos,function(atributo,valor){
              input.attr(atributo,valor);
          });
      }

      if(readOnly){
        input.attr(field.tipo==='booleano'?
          'disabled':'readonly',true);
      }

    },

    validate: {

      hasRules: false,

      rules: function(){

        if($.kui.form.validate.hasRules){
          return;
        }

        // var isDate = function(value,separator,iso){
        //     var check = false;
        //     var adata = value.split(separator);
        //     var gg = parseInt(adata[iso? 2 : 0],10);
        //     var mm = parseInt(adata[1],10);
        //     var aaaa = parseInt(adata[iso? 0 : 2],10);
        //     var xdata = new Date(aaaa,mm-1,gg);
        //     if ( ( xdata.getFullYear() === aaaa ) &&
        //          ( xdata.getMonth () === mm - 1 ) &&
        //          ( xdata.getDate() === gg ) ){
        //       check = true;
        //     } else{
        //       check = false;
        //     }
        //     return check;
        // };

        $.validator.methods["date"] = function(value, element) {
            var picker = $(element).parent().data('datetimepicker');
            var date = picker.getLocalDate();
            return this.optional(element) || date !== undefined;
        };

        $.kui.form.validate.hasRules = true;

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

      add: function(o){
        $(o.form).validate({
            showErrors: function(errorMap, errorList) {
              $.kui.form.validate.error(this, errorMap, errorList);
            },
            submitHandler: function(form) {

              // $(form).find('input[data-rule-date=true]').each(function(i,input){
              //     var picker = $(input).parent().data('datetimepicker');
              //     var date = picker.getLocalDate();
              //     var dateIso = '';
              //     if(date){
              //       var month = date.getMonth()+1;
              //       dateIso = date.getFullYear() + '-' + (month<10? '0' : '') + month + '-' + (date.getDate()<10? '0' : '') + date.getDate();
              //     }
              //     $(input).val(dateIso);
              // });
              o.submit.call(this,form);
              return false;
            }
        });
      }

    }

  };

}(jQuery));
