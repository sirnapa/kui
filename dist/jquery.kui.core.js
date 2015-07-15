/*! kui - v0.2.3 - 2015-07-15
* https://github.com/konecta/kui
* Copyright (c) 2015 Nelson Paez; Licensed MIT */
(function ($) {

  // Collection method.
  $.fn.kui = function (widget,data,aux) {
    return this.each(function () {
        $(this).attr('data-kui',true);

        if(widget){
          $(this).attr('data-widget',widget);
          $.kui.widgets[widget].call(this,data,aux);
        }
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

  // Widgets
  $.kui.widgets = {};

  // Widgets instances
  $.kui.instances = {};

}(jQuery));

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

                  if( inputVal && inputVal.toString() === id){
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
            var date = picker.getDate();
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

              $(form).find('input[data-rule-date=true]').each(function(i,input){
                  var picker = $(input).parent().data('datetimepicker');
                  var date = picker.getDate();
                  var dateIso = '';
                  if(date){
                    var month = date.getMonth()+1;
                    if(month<10){}
                    dateIso = date.getFullYear() + '-' + (month<10? '0' : '') + month + '-' + date.getDate();
                  }
                  $(input).val(dateIso);
              });

              o.submit.call(this,form);
              return false;
            }
        });
      }

    }

  };

}(jQuery));

(function ($) {

  $.kui.i18n = {

    /* Funciones de list */
    reload: 'recargar',
    page: 'pagina',
    first: 'primera',
    prev: 'anterior',
    next: 'siguiente',
    last: 'ultima',
    search: 'buscar',
    select: 'seleccionar',
    add: 'agregar',
    edit: 'editar',
    save: 'guardar',
    activate: 'activar',
    remove: 'remover',

    /* Mensajes de List y Wizard */
    editMsg: 'Editar',
    saveMsg: 'Guardar',
    activateMsg: 'Reactivar',
    removeMsg: 'Remover',
    prevMsg: 'Anterior',
    nextMsg: 'Siguiente',

    /* Campos de List */
    id: 'id',
    fields: 'campos',
    ajax: 'ajax',
    data: 'data',
    titles: 'titulos',
    actions: 'permisos',
    sourceFormat: 'retorno',
    buttons: 'botones',
    pager: 'paginador',
    selectable: 'seleccionable',
    selected: 'seleccionados',
    state: 'estado',
    loadComplete: 'loadComplete',
    onclick: 'onclick',
    ondblclick: 'ondblclick',

    /* Eventos de List */
    reloadGrid: 'reloadGrid',

    /* Data de List */
    totalData: 'totalDatos',
    totalPages: 'totalPaginas',

    /* Campos de Form */
    submit: 'submit',
    submitAjax: 'ajaxSubmit',
    submitButton: 'botonSubmit',
    source: 'origen',
    sourceAjax: 'ajaxOrigen',
    sourceData: 'dataOrigen',
    readOnly: 'soloLectura',
    afterSubmit: 'afterSubmit',

    /* Campos de Wizard */
    steps: 'pasos',
    indices: 'indices',
    validate: 'validacion',

    /* Date & time format */
    dateFormat: 'dd/MM/yyyy',
    hourFormat: 'hh:mm:ss',
    dateTimeFormat: 'dd/MM/yyyy hh:mm:ss',

  };

}(jQuery));

(function ($) {

	$.kui.list = {

        /**
         * @param o = {
         *      {Object} element
         *      {Object} constructor
         *      {Object} instances
         *      {Object} data
         *      {Object} aux
         * }
         */
    	actions: function(o){

    		if(typeof o.data === 'string'){
                var instance = o.instances[o.element.id];

                if( instance === undefined || instance === null){
                    return;
                }

                switch(o.data) {
                    case $.kui.i18n.reload:
                        // o.aux sirve para sobre-escribir el data
                        if(o.aux!==undefined){
                            instance.setData(o.aux);
                        }
                        instance.load();
                        break;
                    case $.kui.i18n.page:
                        // o.aux recibe la pagina de destino, tambien puede recibir
                        // estas opciones: primera, anterior, siguiente, ultima
                        if(o.aux===undefined){
                            return;
                        }
                        var pagina = parseInt(o.aux);
                        if(isNaN(pagina)){
                            pagina = 0;
                            switch(o.aux) {
                                case $.kui.i18n.first:
                                    pagina = 1;
                                    break;
                                case $.kui.i18n.prev:
                                    pagina = parseInt(instance.pagina) - 1;
                                    break;
                                case $.kui.i18n.next:
                                    pagina = parseInt(instance.pagina) + 1;
                                    break;
                                case $.kui.i18n.last:
                                    pagina = instance.totalPaginas;
                                    break;
                                default:
                                    return;
                            }
                        }
                        if(pagina<1 || pagina>parseInt(instance.totalPaginas)){
                            return;
                        }
                        instance.setData({page:pagina});
                        instance.load();
                        break;
                    case $.kui.i18n.search:
                        // o.aux es la clave de búsqueda
                        if(o.aux===undefined){
                            return;
                        }

                        var groupOp = 'AND';
                        if(o.aux.groupOp!==undefined){
                            groupOp=o.aux.groupOp;
                        }
                        var reglas = [];
                        $.each(o.aux.reglas,function(c,campo){
                            reglas.push({
                                'field': campo.field,
                                'data': (campo.data!==undefined)? campo.data : o.aux.data,
                                'op': (campo.op!==undefined)? campo.op : 'cn'
                            });
                        });
                        instance.setData({
                            _search: true,
                            filters: JSON.stringify({
                                "groupOp":groupOp,
                                "rules": reglas
                                })
                        });
                        instance.setData({page:1});
                        instance.load();
                        break;
                    case $.kui.i18n.select:
                        instance.seleccionar(o.aux);
                        break;
                    case $.kui.i18n.add:
                        instance.agregar(o.aux);
                        break;
                    default:
                        return;
                }
            }else{
                var newList = new o.constructor(o.element,o.data);
                o.instances[o.element.id] = newList;
            }

    	},

        /**
         * @param o = {
         *      {Object} list
         *      {Object} div
         *      {Object} params
         *      {number} rows
         * }
         */
        params: function(o){

            /*
             * Required params
             */

            if( o.params[$.kui.i18n.source]===undefined ||
                o.params[$.kui.i18n.id]===undefined ||
                o.params[$.kui.i18n.fields]===undefined){
                window.console.error(
                    'The params ' +
                    '"' + $.kui.i18n.source + '", ' +
                    '"' + $.kui.i18n.id + '" and ' +
                    '"' + $.kui.i18n.fields + '"' +
                    ' are required.'
                );
                return;
            }

            /*
             * Optional params
             */

             var finalParams = {};
            finalParams[$.kui.i18n.ajax] = 'GET';
            finalParams[$.kui.i18n.titles] = true;
            finalParams[$.kui.i18n.serviceFormat] = {};
            finalParams[$.kui.i18n.buttons] = [];
            finalParams[$.kui.i18n.data] = {
							_search:false,
							filters:null,
							page:1,
							rows:o.rows,
							sidx:o.params.id,
							sord:'asc',
							todos:false
						};

            var finalActions = {};
            finalActions[$.kui.i18n.add] = null;
            finalActions[$.kui.i18n.edit] = null;
            finalActions[$.kui.i18n.save] =  null;
            finalActions[$.kui.i18n.activate] = null;
            finalActions[$.kui.i18n.remove] = null;
            finalParams[$.kui.i18n.actions] = finalActions;

            if(o.params[$.kui.i18n.pager]===undefined){
                o.params[$.kui.i18n.pager] = $('<div>')
                    .addClass('text-center')
                    .appendTo(o.div);
            }

            /*var retorno_final = {
                lista: 'lista',
                pagina: 'pagina',
                totalDatos: 'totalDatos'
            }

            $.each(o.params[$.kui.i18n.sourceFormat],function(key,value){
                retorno_final[key] = value;
            });*/

            if(o.params[$.kui.i18n.selectable]){
                // Agregar campo de selección al principio;
                var campo_seleccion = {
                    nombre: 'kui_seleccionado',
                    titulo: '',
                    tipo: 'booleano',
                    ancho: 1,
                    editonly: true,
                    atributos: {
                        'class': o.div.id + '_seleccionar_row'
                    }
                };
                o.params[$.kui.i18n.fields].unshift(campo_seleccion);

                if(!o.params[$.kui.i18n.selected]){
                    o.params[[$.kui.i18n.selected]] = [];
                }

                o.list.checkall = $('<input>');
            }

            $.extend(true,finalParams,o.params);

            $.extend(o.list,{
                div : o.div,
                source : finalParams[$.kui.i18n.source],
                data : finalParams[$.kui.i18n.data],
                id : finalParams[$.kui.i18n.id],
                showTitles : finalParams[$.kui.i18n.titles],
                campos : finalParams[$.kui.i18n.fields],
                ajax : finalParams[$.kui.i18n.ajax],
                permisos : finalParams[$.kui.i18n.actions],
                botones : finalParams[$.kui.i18n.buttons],
                estado : finalParams[$.kui.i18n.state],
                //retorno : finalParams[$.kui.i18n.sourceFormat],
                loadComplete : finalParams[$.kui.i18n.loadComplete],
                pager : finalParams[$.kui.i18n.pager],
                onclick : finalParams[$.kui.i18n.onclick],
                ondblclick : finalParams[$.kui.i18n.ondblclick],
                seleccionable : finalParams[$.kui.i18n.selectable],
                seleccionados : {},
                preseleccionados : finalParams[$.kui.i18n.selected],
                nuevos : 0
            });

            $.kui.list.load_estilos();
            $.kui.list.loadPager(o.list);
            o.list.titulos();
            o.list.load();

            $(o.div).on('reloadGrid',function(){
								$('#'+o.list.div.id).kui(o.list.name,$.kui.i18n.reload);
            });

        },

        loadPager : function(list){
            if(!$(list.pager).length){
                return;
            }
            var pk = 'kui_' + list.div.id + '_';
            var contenedor = $('<div>').attr('id',pk+$.kui.i18n.pager)
                .addClass('kui-pager btn-group')
                .appendTo(list.pager);

            $('<button>').attr('id',pk+'primera_pagina')
                .attr('type','button')
                .addClass('btn btn-default')
                .html($('<i>').addClass('fa fa-step-backward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+list.div.id).kui(list.name,$.kui.i18n.page,$.kui.i18n.first);
                });

           $('<button>').attr('id',pk+'pagina_anterior')
                .attr('type','button')
                .addClass('btn btn-default')
                .html($('<i>').addClass('fa fa-backward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+list.div.id).kui(list.name,$.kui.i18n.page,$.kui.i18n.prev);
                });

          var alto = $('#'+pk+'pagina_anterior').outerHeight();
          var ancho = $('#'+pk+'pagina_anterior').outerWidth();

          var centro = $('<div>').addClass('btn btn-default kpagina')
                .css('height',alto>0? alto : 34)
                .appendTo(contenedor);

          $('<label>').html('Página ').appendTo(centro);
          $('<input>').attr('id',pk+'pagina')
            .attr('type','text')
            .addClass('pagina')
            .css('width',ancho>0? ancho : 39)
            .appendTo(centro)
            .keyup(function(e){
                if(e.keyCode === 13){
                    e.preventDefault();
                    var pagina = parseInt($('#'+pk+'pagina').val());
                    if(isNaN(pagina) || pagina<0 || pagina > list.totalPaginas){
                        $('#'+pk+'pagina').val($('#'+pk+'pagina').data('pagina'));
                        return;
                    }
                    if(pagina!==$('#'+pk+'pagina').data('pagina')){
                        $('#'+list.div.id).kui(list.name,'pagina',pagina);
                    }
                }
            });
          var totalPaginas = $('<label>').html(' de ').appendTo(centro);
          $('<span>').attr('id',pk+'totalPaginas')
            .appendTo(totalPaginas);

          $('<button>').attr('id',pk+'siguiente_pagina')
                .attr('type','button')
                .addClass('btn btn-default')
                .html( $('<i>').addClass('fa fa-forward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+list.div.id).kui(list.name,$.kui.i18n.page,$.kui.i18n.next);
                });

           $('<button>').attr('id',pk+'ultima_pagina')
                .attr('type','button')
                .addClass('btn btn-default')
                .html($('<i>').addClass('fa fa-step-forward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+list.div.id).kui(list.name,$.kui.i18n.page,$.kui.i18n.last);
                });
        },

        reloadPager: function(list){
            $('#kui_' + list.div.id + '_pagina')
                .val(list.pagina)
                .data('pagina',list.pagina);
            $('#kui_' + list.div.id + '_totalPaginas')
                .html(list.totalPaginas);
            $('#kui_' + list.div.id + '_primera_pagina')
                .prop('disabled',list.pagina===1);
            $('#kui_' + list.div.id + '_pagina_anterior')
                .prop('disabled',list.pagina===1);
            $('#kui_' + list.div.id + '_ultima_pagina')
                .prop('disabled',list.pagina===list.totalPaginas);
            $('#kui_' + list.div.id + '_siguiente_pagina')
                .prop('disabled',list.pagina===list.totalPaginas);
        },

        load_estilos: function(){
            if($('#kcard_estilos').length){
                return;
            }
            var reglas = {
                '.kui-list .kbtn':
                        [
                            'cursor: pointer'
                        ],
                '.kui-list .kbtn:hover':
                        [
                            'background: #ECECF0',
                            'border: 1px solid #cacaca'
                        ],
                '.kui-list h2':
                        [
                            'padding-bottom: 10px'
                        ],
                '.kui-list .kscore':
                        [
                            'width: 0',
                            'height: 0',
                            'border: 1px solid #999999',
                            'background: #ECECF0',
                            'font-size: 1.7em',
                            'margin-left: 10px',
                            'overflow: hidden',
                            'border-radius: 50%'
                        ],
                '.kui-list .kscore p':
                        [
                            'margin-top: 25%'
                        ],
                '.kui-list .kscore small':
                        [
                            'font-size: 0.5em'
                        ],
                '.kui-list .klabel':
                        [
                            'margin-top: 20px'
                        ],
                '.kui-list .kacciones':
                        [
                            'white-space: nowrap'
                        ],
                '.kui-list .kaccion':
                        [
                            'margin-left: 15px'
                        ],
                '.kui-list .kpagina':
                        [
                            'overflow: hidden',
                            'padding-top: 2px'
                        ],
                '.kui-list .kpagina input':
                        [
                            'margin: 0 5px',
                            'text-align: center'
                        ],
                '.kui-list .writing td':
                        [
                            'background: #777777'
                        ],
                '.kui-list .writing td:not(.kacciones)':
                        [
                            'vertical-align: middle',
                            'padding: 0 !important'
                        ],
                '.kui-list .writing .form-control, .kui-list .writing .input-group-addon':
                        [
                            'background: none',
                            'box-shadow: none',
                            'border-radius: 0',
                            'border: none',
                            'color: #FFFFFF'
                        ],
                '.kui-list .writing .kacciones a':
                        [
                            'color: #FFFFFF'
                        ]
                };

            var estilo = '';
            $.each(reglas,function(elemento,regla){
                estilo += elemento+'{';
                $.each(regla,function(l,linea){
                    estilo += linea + ';';
                });
                estilo += '}';
            });

            var primer_estilo = $('head').find('link,style').first();
            var estilos_k = $('<style>').attr('id','kcard_estilos')
                .html(estilo);

            if(primer_estilo.length){
                primer_estilo.before(estilos_k);
            }else{
                estilos_k.prependTo('head');
            }
        }

    };

}(jQuery));

(function ($) {

  $.kui.messages = function(div,caja,tipo,mensaje){
      
      if(div){
          div.remove();
      }

      div = $('<div>')
          .attr('role','alert')
          .addClass('alert')
          .addClass(tipo? tipo : 'alert-info')
          .html(mensaje)
          .prependTo(caja);

      $('<button>').attr('data-dismiss','alert')
          .addClass('close')
          .attr('type','button')
          .html('<i class="fa fa-times"></i>')
          .appendTo(div);
      
  };

}(jQuery));

(function ($) {

  // Generate random ID
  $.kui.randomId = function() {
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g,
      function(c) {
        var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
  };

  // Dummy link
  $.kui.dummyLink = 'javascript'+':'.toLowerCase()+'void(0)';

  // Data & Format
  $.kui.data = {

    /*
     * @param o = {
     *      {Object} source
     *      {String} sourceAjax
     *      {Object} sourceData
     *      {Function} sourceParse
     *      {String} key,
     *      {Object} message,
     *      {Object} messageContainer,
     * }
     */

    source : function(o){

      window.console.log('Params',o.source,o.sourceAjax,o.sourceData);

      var data = {};

      if(o.source===undefined){
          data = {};
      }else if(typeof o.source === 'string'){

          $.ajax({
              type: o.sourceAjax,
              url: o.source,
              data: o.sourceData,
              success: function(remoteData){
                  if(typeof o.sourceParse === 'function'){
                    data = o.sourceParse.call(this,remoteData);
                  }else if(remoteData.error && remoteData.mensaje){
                      $.kui.messages(o.message,o.messageContainer,remoteData.tipoMensaje,remoteData.mensaje);
                  }else{
                    data = remoteData[o.key];
                  }
              },
              async: false
          });

      }else{
          data = o.source;
      }

      window.console.log('Data >>> ',data);

      return data;
    },

  	format: function(item,name,format,combobox,readOnly){

  		if(combobox && combobox.id && combobox.formato){
          if(readOnly){
            return typeof combobox.formato==='function'?
                combobox.formato.call(this,
                  item[name]?
                  item[name] :
                  item[name+'.'+combobox.id]) :
                $.kui.data.valueFromJson(item,name,combobox.formato);
          }else{
          	return $.kui.data.valueFromJson(item,name,combobox.id);
          }
    	}

      return typeof format === 'function'?
        format.call(this,item[name],item) : item[name];
    },

    valueFromJson: function(data,level1,level2){
      return data[level1]? data[level1][level2] :
             (data[level1+'.'+level2]?
              data[level1+'.'+level2] : '');
    },

    dateToIso: function(value){
      var date;
      var format = {
        dd: 0,
        MM: 1,
        yyyy: 2
      };

      if (value.indexOf('/') > 0){
          date = value.split('/');
      } else {
          date = value.split('-');
          format.yyyy = 0;
          format.dd = 2;
      }

      return (date.length===3)?
        (date[format.yyyy] +'-' + date[format.MM] + '-' + date[format.dd])
        : '';
    }

  };

  // Ajax
  $.kui.ajax = function(o) {
    var div = o.div? $(o.div) : $('body');
    $('<div>').appendTo(div);
    window.alert('Ajax start');
    var ajaxRequest = $.ajax(o);
    window.alert('Ajax stop');
    return ajaxRequest;
  };

}(jQuery));
