/*! kui - v0.1.4 - 2015-05-28
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

    newElement: function(readOnly,element,item,field){

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

       var input;
       readOnly = readOnly || field.soloLectura;
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
              }else{
                  opciones = field.opciones.origen;
              }

              var seleccionado = false;

              $.each(opciones,function(o,opcion){
                  var item = $('<option>');

                  if(stringOnly){
                    item.html(opcion);
                  }else{
                    item.attr('value',opcion[field.opciones.id])
                      .html(
                        typeof field.opciones.formato==='function'?
                          field.opciones.formato.call(this,opcion) 
                          : opcion[field.opciones.formato]
                      );
                  }
                     
                  item.appendTo(select);
                  
                  if( inputVal.toString() === 
                      (stringOnly? opcion : opcion[field.opciones.id].toString())
                    ){
                      item.attr('selected',true);
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
                  formato: 'dd/MM/yyyy',
                  rule: 'date', 
                  constructor: {pickTime: false}
              },
          'hora': {
                  icono: 'clock-o',
                  formato: 'hh:mm:ss',
                  rule: 'hour',
                  constructor: {pickDate: false}
              },
          'fecha-hora': {
                  icono: 'calendar-o',
                  rule: 'datetime',
                  formato: 'dd/MM/yyyy hh:mm:ss'
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
          
          var fields_especiales = ['disabled','readonly'];
          $.each(fields_especiales,function(e,especial){
              if(field.atributos[especial]==='false'){
                  input.removeAttr(especial);
              }
              input.attr('data-'+especial,field.atributos[especial]);
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
    pass: 'permisos',
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
    validate: 'validacion'

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

             var data_final = {
                _search:false,
                filters:null,
                page:1,
                rows:o.rows,
                sidx:o.params.id,
                sord:'asc', 
                todos:false
            };

            $.extend(data_final,o.params[$.kui.i18n.data]);
            finalParams[$.kui.i18n.data] = data_final;
            
            var permisos_finales = {};
            permisos_finales[$.kui.i18n.add] = null;
            permisos_finales[$.kui.i18n.edit] = null;
            permisos_finales[$.kui.i18n.save] =  null;
            permisos_finales[$.kui.i18n.activate] = null;
            permisos_finales[$.kui.i18n.remove] = null;

            $.extend(permisos_finales,o.params[$.kui.i18n.pass]);
            finalParams[$.kui.i18n.pass] = permisos_finales;
            
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

            $.extend(finalParams,o.params);

            $.extend(o.list,{
                div : o.div,
                url : finalParams[$.kui.i18n.source],
                data : finalParams[$.kui.i18n.data],
                id : finalParams[$.kui.i18n.id],
                mostrar_titulos : finalParams[$.kui.i18n.titles],
                campos : finalParams[$.kui.i18n.fields],
                ajax : finalParams[$.kui.i18n.ajax],
                permisos : finalParams[$.kui.i18n.pass],
                botones : finalParams[$.kui.i18n.buttons],
                estado : finalParams[$.kui.i18n.state],
                //retorno : finalParams[$.kui.i18n.sourceFormat],
                load_complete : finalParams[$.kui.i18n.loadComplete],
                paginador : finalParams[$.kui.i18n.pager],
                onclick : finalParams[$.kui.i18n.onclick],
                ondblclick : finalParams[$.kui.i18n.ondblclick],
                seleccionable : finalParams[$.kui.i18n.selectable],
                seleccionados : {},
                preseleccionados : finalParams[$.kui.i18n.selected],
                nuevos : 0
            });
                    
            $.kui.list.load_estilos();
            $.kui.list.load_paginador(o.list);
            o.list.titulos();
            o.list.load();
            
            $(o.div).on('reloadGrid',function(){
                $.kui.instances.kgrid[o.list.id].load();
            });
            
        },

        load_paginador : function(list){
            if(!$(list.paginador).length){
                return;
            }
            var pk = 'kui_' + list.div.id + '_';
            var contenedor = $('<div>').attr('id',pk+'paginador')
                .addClass('kui-paginador btn-group')
                .appendTo(list.paginador);
            
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
    }

  };

}(jQuery));
(function ($) {

    // Instances
    $.kui.instances.kcard = {};
    
    // Widget definition.
    $.kui.widgets.cards = function (data,aux) {
        return $.kui.list.actions({
            element: this,
            constructor: KCard,
            instances: $.kui.instances.kcard,
            data: data,
            aux: aux
        });
    };
    
    var KCard = function(div,params){
    	$.kui.list.params({
            list: this,
            div: div,
            params: params,
            rows: 5
        });
    };
    
    KCard.prototype = {

        name: 'cards',
    		
        setData: function(data){
            var kCard = this;
            $.each(data,function(key,value){
                kCard.data[key] = value;
            });            
        },

        nueva_grilla : function(){
            var kCard = this;
            $(kCard.div).addClass('kui-list form-horizontal');
            kCard.contenido = $('<div>').attr('id',kCard.div.id + '_grilla')
                    .prependTo(kCard.div);
        },

        titulos: function(){
        	return;
        },
        
        load : function() {
            
            var kCard = this;
            if(kCard.contenido){
                kCard.contenido.empty();
            }else{
                kCard.nueva_grilla();
            }
            
            $.ajax({
                type: kCard.ajax,
                url: kCard.url,
                data: kCard.data,
                success: function(retorno){                                    
                    if (!retorno.error) {

                        var lista = retorno.respuesta.datos;
                        var datos = {};
                        
                        kCard.totalDatos = parseInt(retorno.respuesta.totalDatos);
                        kCard.pagina = parseInt(retorno.respuesta.pagina);
                        kCard.totalPaginas = Math.ceil(kCard.totalDatos/kCard.data.rows);

                        kCard.grilla = $('<div>').addClass('kCard').prependTo(kCard.contenido);                       
                        
                        $.each(lista,function(i,item){
                            datos[item[kCard.id]] = item;
                            kCard.load_entrada(item);                          
                        });

                        kCard.grilla.find('.kscore').each(function(s,score){
                            var lado = parseInt($(score).parent().parent().parent().height()) * 0.8;
                            $(score).css('width',lado);
                            $(score).css('height',lado);
                        });
                        
                        kCard.grilla.find('.kacciones,.kscores').each(function(e,elemento){
                            var top = $(elemento).parent().parent().height() - $(elemento).height();
                            var siguiente = $(elemento).next();
                            if(siguiente.hasClass('kscores') && !siguiente.is(':empty')){
                                $(elemento).css('font-size','0.5em');
                            }else{
                                top = top/2;
                            }
                            if(top > 0){
                                $(elemento).css('padding-top',top);
                            }
                        });

                        $(kCard.div).data($.kui.i18n.source,datos);
                        $(kCard.div).data($.kui.i18n.totalData,kCard.totalDatos);
                        $(kCard.div).data($.kui.i18n.page,kCard.pagina);
                        $(kCard.div).data($.kui.i18n.totalPages,kCard.totalPaginas);
                                                
                        $.kui.list.reloadPager(kCard);
                        
                    }else if(retorno.mensaje){
                        $.kui.messages(kCard.mensaje,kCard.contenido,retorno.tipoMensaje,retorno.mensaje);
                    }
            
                    if(typeof kCard.load_complete === 'function'){
                        kCard.load_complete.call(this,retorno);
                    }
                },
                async: false
            });
        },

        load_entrada: function(item){

            var kCard = this;
            var nueva_entrada = item===undefined;
            var pk = 'kCard_' + kCard.div.id + '_' + 
                (nueva_entrada? ('nuevo_'+kCard.nuevos) : item[kCard.id]);
            var guardar = (nueva_entrada && kCard.permisos[$.kui.i18n.add])?
                kCard.permisos[$.kui.i18n.add] : kCard.permisos['guardar'];

            var formGroup = $('<div>').attr('id',pk)
                .attr('data-pk',item[kCard.id])
                .addClass('form-group well');

            var activo = nueva_entrada? true : false;
            if(!nueva_entrada && typeof kCard.estado === 'function'){
                activo = kCard.estado.call(this,item);
            }
            
            if(kCard.onclick){
                var onclick = typeof kCard.onclick === 'function'?
                    kCard.onclick : function(){
                       window.open(kCard.onclick,'_self');
                    };
                formGroup.addClass('kbtn')
                    .click(function(){
                       onclick.call(this,item);
                    });
            }else if(kCard.ondblclick){
                if( (typeof kCard.ondblclick === 'function') || 
                    (activo && typeof kCard.permisos['editar'] === 'function')){
                    var ondblclick = typeof kCard.ondblclick === 'function'?
                        kCard.ondblclick : function(){
                            kCard.permisos['editar'].call(this,item);
                        };
                    formGroup.dblclick(function(){
                        ondblclick.call(this,item);
                    });
                }
            }
                                        
            var izquierda = $(guardar? '<form>' : '<div>')
                .addClass('col-sm-7')
                .appendTo(formGroup);
            var derecha = $('<div>').addClass('text-right col-sm-5')
                .appendTo(formGroup);
            var botones = $('<div>').addClass('pull-right')
                .addClass('kacciones')
                .appendTo(derecha);
            var scores = $('<div>').addClass('kscores pull-right')
                .appendTo(derecha);
                            
            $.each(kCard.campos,function(c,campo){ 
                var columna;

                if(campo.tipo!=='score'){
                    var ancho_columna = 6;
                    var contenedor = '<p>';

                    if(campo.tipo==='destacado' || campo.tipo==='encabezado'){
                        ancho_columna = 12;
                    }
                    if(campo.tipo==='encabezado'){
                        contenedor = '<h2>';
                    }
                    
                    columna = $(contenedor)
                        .addClass('col-sm-'+ancho_columna)
                        .appendTo(izquierda);
                }else{
                    columna = $('<p>').appendTo(
                            $('<div>')
                                .addClass('text-center pull-left kscore')
                                .appendTo(scores)
                        );
                }

                columna.html($.kui.data.format(item,campo.nombre,campo.formato));

                if(campo.titulo && campo.titulo!==''){
                    if(campo.tipo!=='score'){
                        $('<label>').addClass('text-muted')
                            .html(campo.titulo + '&nbsp; &nbsp;')
                            .prependTo(columna);
                    }else{
                        $('<br>').appendTo(columna);
                        $('<small>').html(campo.titulo)
                            .appendTo(columna);
                    }
                } 

                if(typeof campo.formato === 'function'){
                    item[campo.nombre] = campo.formato.call(this,item[campo.nombre],item);
                }                         
            });                            
                                            
            var dimension = 'fa-3x';

            var crear_boton = function(id,titulo,icono,hover){
                    var boton = $('<a>').attr('id', pk + '_' + id)
                        .addClass('text-muted kaccion')
                        .attr('title',titulo)
                        .attr('href',$.kui.dummyLink)
                        .html('<i class="fa ' + dimension + ' fa-'+icono+'"></i>')
                        .hover( function(){ $(this).removeClass('text-muted').addClass('text-'+hover);}, 
                                function(){ $(this).addClass('text-muted').removeClass('text-'+hover);});
                    return boton;
                };

            var habilitar_edicion = function(){
                    // Deshabilitamos ediciones anteriores
                    //kCard.load();

                    // Habilitar edición inline
                     $('#'+pk+' form').find('input[readonly]').each(function(x,input){
                        if(($(input).attr('data-disabled')!=='true' && $(input).attr('data-readonly')!=='true') || 
                            (nueva_entrada && $(input).attr('data-creable'))){
                            $(input).removeAttr('readonly')
                                .removeAttr('disabled')
                                .attr('data-editando',true)
                                .keyup(function(e){
                                    if(e.keyCode === 13){
                                        e.preventDefault();
                                        $('#'+pk+' form').submit();
                                    }
                                });
                        }
                    });

                    // Cambio de botones        
                    $('#'+ pk + '_editar').hide();
                    if(!nueva_entrada){
                        $('#'+ pk + '_remover').hide();
                        $('#'+ pk + '_deshacer').fadeIn();
                    }
                    $('#'+ pk + '_guardar').fadeIn();

                    // Focus
                    $('#'+pk).find('input[data-editando]').first().focus();
                };

            var deshabilitar_edicion = function(){
                // Deshabilitar edición
                $('#'+pk+' form').find('input[data-editando]').each(function(x,input){
                    $(input).attr('readonly',$(input).attr('data-readonly')!=='false')
                        .removeAttr('data-editando')
                        .unbind('keyup');
                    if($(input).attr('type')==='checkbox'){
                        $(input).attr('disabled',$(input).attr('data-disabled')!=='false');
                    }
                });

                // Cambio de botones
                $('#'+ pk + '_guardar').hide();
                $('#'+ pk + '_deshacer').hide();
                $('#'+ pk + '_editar').fadeIn();
                $('#'+ pk + '_remover').fadeIn();
            };

            var deshacer_cambios = function(){
                    var original = $(kCard.div).data($.kui.i18n.source)[$('#'+pk).attr('data-pk')];
                    var editados = $('#'+pk+' form').find('input[data-editando]');
                    deshabilitar_edicion();
                    editados.each(function(x,input){
                        if($(input).attr('type')==='checkbox'){
                            $(input).prop('checked',original[$(input).attr('name')]);
                        }else{
                            $(input).val(original[$(input).attr('name')]);
                        }
                    });
                };

            if(activo){

                if(kCard.permisos['editar']){
                    var btn_editar = crear_boton('editar',$.kui.i18n.editMsg,'pencil','primary');

                    if(typeof kCard.permisos['editar'] === 'function'){
                        btn_editar.click(function(e){
                            e.stopPropagation();
                            kCard.permisos['editar'].call(this,item);
                        });
                    }else if(guardar){

                        // Guardar cambios
                        var btn_guardar = crear_boton('guardar',$.kui.i18n.saveMsg,'save','primary');
                        btn_guardar.hide();

                        var guardar_cambios = typeof guardar === 'function'?
                            function(formulario){
                                guardar.call(this,formulario);
                            } : function(formulario){
                                $.ajax({
                                    type: 'POST',
                                    url: guardar,
                                    data: formulario,
                                    success: function(/*retorno*/){  
                                        kCard.load();
                                    }
                                });
                            };

                        $.kui.form.validar.reglas();

                        $(izquierda).validate({
                            showErrors: function(errorMap, errorList) {
                                $.kui.form.validar.error(this, errorMap, errorList);
                            },
                            submitHandler: function(form) {
                                $.kui.form.validar.fecha(form);
                                
                                deshabilitar_edicion();
                                var dato = {};

                                // Serialize Array para todos los inputs excepto checkbox
                                $.each($('#'+pk+' form').serializeArray(), function(_, it) {
                                    dato[it.name] = it.value;
                                });

                                // Checkboxs
                                $.each($('#'+pk+' form input[data-rol=input][type=checkbox]'), function(_, checkbox) {
                                    dato[$(checkbox).attr('name')] = $(checkbox).is(':checked');
                                });

                                dato = $.extend({}, item, dato);

                                guardar_cambios(dato);

                                return false;
                            }
                        });

                        btn_guardar.click(function(e){
                            e.stopPropagation();
                            $('#'+pk+' form').submit();                      
                        }).appendTo(botones);

                        // Deshacer cambios
                        var btn_deshacer = crear_boton('deshacer','Deshacer cambios','undo','danger');
                        btn_deshacer.hide()
                            .click(function(e){
                                e.stopPropagation();
                                deshacer_cambios();
                            }).appendTo(botones);

                        // Editar (o hacer cambios)
                        btn_editar.click(function(e){
                            e.stopPropagation();
                            habilitar_edicion();
                        });
                    }

                    if(!nueva_entrada){
                        btn_editar.appendTo(botones);
                    }
                }
                if(kCard.permisos['remover']){
                    var btn_remover = crear_boton('remover',$.kui.i18n.removeMsg,'times','danger');

                    if(!nueva_entrada && typeof kCard.permisos['remover'] === 'function'){
                        btn_remover.click(function(e){
                            e.stopPropagation();
                            kCard.permisos['remover'].call(this,item);
                        });
                    }else{
                        btn_remover.click(function(e){
                            e.stopPropagation();
                            $('#'+pk).remove();
                        });
                    }

                    btn_remover.appendTo(botones);
                }
                
            } else{                                    
                if(typeof kCard.permisos['activar'] === 'function'){
                    formGroup.addClass('has-error');
                    var btn_activar = crear_boton('reactivar',$.kui.i18n.activateMsg,'check','success');

                    btn_activar.click(function(e){
                            e.stopPropagation();
                            kCard.permisos['activar'].call(this,item);
                        }).appendTo(botones);
                }
            }
            
            if(kCard.botones.length){

                var ubicar_boton = function(btn){
                    $(btn).appendTo(botones);
                };

                $.each(kCard.botones,function(b,boton){
                    if(typeof boton.mostrar !== 'function' || boton.mostrar.call(this,item)){
                        var btn = crear_boton($.kui.randomId(),boton.comentario,boton.icono,'primary');

                        btn.attr('href', (boton.enlace!==undefined)? boton.enlace : $.kui.dummyLink);
                        
                        if(boton.onclick!==undefined){
                            btn.click(function(e){
                                e.stopPropagation();
                                boton.onclick.call(this,item);
                            });
                        }
                        
                        if(boton.atributos!==undefined){
                            $.each(boton.atributos,function(atributo,valor){
                                btn.attr(atributo,valor);
                            });
                        }

                        ubicar_boton(btn);
                    }   
                });
            }

            if(nueva_entrada){
                formGroup.prependTo(kCard.grilla);
                habilitar_edicion();
            }else{
                formGroup.appendTo(kCard.grilla);
            }
        },

        agregar: function(nuevo){
            var kCard = this;
            kCard.load_entrada(nuevo);
        }

    };
    
}(jQuery));
(function ($) {

    $.kui.instances.kform = {};

    // Collection method.
    $.fn.kForm = function (data) {
        return $(this).kui('form',data);
    };

    // Widget definition
    $.kui.widgets['form'] = function (data) {
        return $.kui.instances.kform[this.id] = new KForm(this,data);
    };
    
    var KForm = function(div,dato){
        
        /* 
         * Si no se provee algun campo obligatorio, 
         * no se puede continuar.
        */

        if( dato.campos===undefined || dato.submit===undefined){
            window.console.error('Los parámetros "campos" y "submit" son obligatorios.');
            return;
        }        
                
        this.div = div;
        this.campos = dato.campos;        
        this.submit = dato.submit;
        this.origen = dato.origen;
        this.ajax_origen = dato.ajaxOrigen===undefined? 'GET' : dato.ajaxOrigen;
        this.ajax_submit = dato.ajaxSubmit===undefined? 'POST' : dato.ajaxSubmit;
        this.load_complete = dato.loadComplete;
        this.boton_submit = dato.botonSubmit;
        this.readOnly = dato.soloLectura===undefined? false : dato.soloLectura;
        this.data_origen = dato.dataOrigen;
        this.after_submit = dato.afterSubmit;
        
        this.load();
        
    };
    
    KForm.prototype = {

        nuevo_form : function(){
            var kForm = this;
            kForm.form = $('<form>').attr('id',kForm.div.id + '_form')
                    .addClass('kform form-horizontal')
                    .attr('action','#')
                    .prependTo(kForm.div);
        },
        
        load : function() {
            
            var kForm = this;
            if(kForm.form){
                kForm.form.empty();
            }else{
                kForm.nuevo_form();
            }

            if(kForm.origen===undefined){
                
                /*
                 * En kForm.dato está la entidad con la que rellenaremos el formulario.
                 */
                kForm.dato = {};
            }else if(typeof kForm.origen === 'string'){
            
                $.ajax({
                    type: kForm.ajax_origen,
                    url: kForm.origen,
                    data: kForm.data_origen,
                    success: function(retorno){ 
                        if (!retorno.error) {
                            kForm.dato = retorno.objeto;
                        }
                    },
                    async: false
                });

            }else{
                kForm.dato = kForm.origen;
            }

            kForm.load_campos();
        },

        load_campos : function(){
            
            var kForm = this;
            var item = kForm.dato;

            kForm.fieldset = $('<fieldset>').appendTo(kForm.form);
            if(kForm.readOnly){
                kForm.fieldset.attr('disabled',true);
            }
            
            $.each(kForm.campos,function(c,campo){ 
                var formGroup = $('<div>')
                    .addClass('form-group' + (campo.oculto? ' hidden' : ''))
                    .appendTo(kForm.fieldset);

                if(campo.titulo===undefined){
                    campo.titulo = campo.nombre;
                }

                /* 
                 * Lado izquierdo: Label 
                 */
                $('<label>').addClass('klabel col-sm-4 control-label')
                    .html(campo.titulo)
                    .appendTo(formGroup);

                /* 
                 * En el centro: Input 
                 */
                var centro = $('<div>').addClass('col-sm-8')
                    .appendTo(formGroup);

                $.kui.form.newElement(kForm.readOnly,centro,item,campo);                         
            });
            
            $(kForm.div).data('dato',kForm.dato);

            kForm.funcion_submit();
                
            if(typeof kForm.load_complete === 'function'){
                kForm.load_complete.call(this,kForm.dato);
            }
        
        },

        funcion_submit: function(){
            var kForm = this;

            if(kForm.boton_submit===undefined){
                kForm.boton_submit = $('<button>').addClass('btn btn-primary')
                    .html($.kui.i18n.saveMsg)
                    .appendTo(
                        $('<div>').addClass('form-group text-right')
                            .appendTo(kForm.fieldset)
                    );
            }else{
                kForm.boton_submit = $(kForm.boton_submit);
            }

            kForm.boton_submit.click(function(e){
                e.preventDefault();
                kForm.form.submit();
            });

            $.kui.form.validar.reglas();

            var afterSubmit = typeof kForm.after_submit === 'function'?
                function(retorno){
                    kForm.after_submit.call(this,retorno);
                }:function(){};

            var on_submit = typeof kForm.submit === 'function'?
                function(){
                    afterSubmit(kForm.submit.call(this,kForm.contenido(),kForm.dato));
                } : function(){

                    $.ajax({
                        type: kForm.ajax_submit,
                        url: kForm.submit,
                        data: kForm.contenido(),
                        success: function(retorno){
                            if(retorno.mensaje){
                                $.kui.messages(kForm.mensaje,kForm.div,retorno.tipoMensaje,retorno.mensaje);
                            }
                            afterSubmit(retorno);
                        },
                        async: false
                    });

                };

            $(kForm.form).validate({
                showErrors: function(errorMap, errorList) {
                    $.kui.form.validar.error(this, errorMap, errorList);
                },
                submitHandler: function(form) {
                    $.kui.form.validar.fecha(form);
                    on_submit();
                    return false;
                }
            });

        },

        contenido: function(){
            var kForm = this;
            var dato = {};

            // Serialize Array para todos los inputs excepto checkbox
            $.each(kForm.form.serializeArray(),function(_, it) {
                dato[it.name] = it.value;
            });

            // Checkboxs
            $.each(kForm.form.find('input[data-rol=input][type=checkbox]'),function(_, checkbox) {
                dato[$(checkbox).attr('name')] = $(checkbox).is(':checked');
            });

            return dato;
        }
        
    };

}(jQuery));
(function ($) {

    // Instances
    $.kui.instances.kgrid = {};
    
    // Collection method.
    $.fn.kGrid = function (data,aux) {
        return $(this).kui('grid',data,aux);
    };

    // Widget definition
    $.kui.widgets['grid'] = function (data,aux) {
        return $.kui.list.actions({
            element: this,
            constructor: KGrid,
            instances: $.kui.instances.kgrid,
            data: data,
            aux: aux
        });
    };
    
    var KGrid = function(div,params){
    	$.kui.list.params({
            list: this,
            div: div,
            params: params,
            rows: 10
        });
    };
    
    KGrid.prototype = {

        name: 'grid',
    		
        setData: function(data){
            var kGrid = this;
            $.each(data,function(key,value){
                kGrid.data[key] = value;
            });            
        },

        nueva_grilla : function(){
            var kGrid = this;

            $(kGrid.div).addClass('kui-list');

            kGrid.table = $('<table>')
                .addClass('table table-bordered table-striped')
                .prependTo(
                    $('<div>').addClass('table-responsive')
                        .prependTo(kGrid.div)
                    );

            kGrid.tbody = $('<tbody>')
                .attr('id',kGrid.div.id + '_grilla')
                .prependTo(kGrid.table);

            if(kGrid.seleccionable){
                kGrid.seleccionar(kGrid.preseleccionados);
            }

            $.kui.form.validar.reglas();
        },

        titulos: function(){
            var kGrid = this;
            kGrid.nueva_grilla();

            if(!kGrid.mostrar_titulos){
                return;
            }

            var row = $('<tr>');
            kGrid.thead = $('<thead>').prependTo(kGrid.table);
                                                                            
            $.each(kGrid.campos,function(c,campo){                       
                var label = $('<strong>');

                if(campo.titulo!==undefined){
                    label.append(campo.titulo);
                }else{
                    label.append(campo.nombre);
                }

                // if(!campo.ancho){
                //     campo.ancho = parseInt(12/kGrid.campos.length);
                // }

                var titulo = $('<th>')
                    .html(label)
                    .appendTo(row);

                if(kGrid.seleccionable && c===0){
                    titulo.addClass('text-center');

                    kGrid.checkall.attr('id',kGrid.div.id+'_seleccionar_todo')
                        .attr('type','checkbox')
                        .change(function(){
                            var todos = $(this).is(':checked');
                            $('.' + kGrid.div.id + '_seleccionar_row').each(function(i,item){
                                $(item).prop('checked',todos);
                                $(item).trigger('change');
                            });
                        });
                    label.html(kGrid.checkall);

                }
            });

            $('<th>').addClass('kacciones').appendTo(row);
            row.appendTo(kGrid.thead);
        },
        
        load : function() {
            
            var kGrid = this;

            if(kGrid.tbody){
                kGrid.tbody.empty();
            }else{
                kGrid.nueva_grilla();
            }
            
            $.ajax({
                type: kGrid.ajax,
                url: kGrid.url,
                data: kGrid.data,
                success: function(retorno){                                    
                    if (!retorno.error) {

                        var lista = retorno.respuesta.datos;
                        var datos = {};
                        kGrid.totalDatos = parseInt(retorno.respuesta.totalDatos);
                        kGrid.pagina = parseInt(retorno.respuesta.pagina);
                        kGrid.totalPaginas = Math.ceil(kGrid.totalDatos/kGrid.data.rows);
                        
                        $.each(lista,function(i,item){
                            datos[item[kGrid.id]] = item;
                            kGrid.load_entrada(item);                          
                        });

                        $(kGrid.tbody).find('.' + kGrid.div.id + '_seleccionar_row')
                            .each(function(i,item){
                                if(kGrid.seleccionados[$(item).data('pk')]){
                                    $(item).attr('checked','checked');
                                }
                                $(item).change(function(){
                                    kGrid.cambiar_seleccion($(item).data('pk'),$(item).is(':checked'));
                                });
                            });

                        $(kGrid.div).data('datos',datos);
                        $(kGrid.div).data('totalDatos',kGrid.totalDatos);
                        $(kGrid.div).data('pagina',kGrid.pagina);
                        $(kGrid.div).data('totalPaginas',kGrid.totalPaginas);
                                                
                        $.kui.list.reloadPager(kGrid);
                        
                    }else if(retorno.mensaje){
                        $.kui.messages(kGrid.mensaje,kGrid.tbody,retorno.tipoMensaje,retorno.mensaje);
                    }
            
                    if(typeof kGrid.load_complete === 'function'){
                        kGrid.load_complete.call(this,retorno);
                    }
                },
                async: false
            });
        },

        load_entrada: function(item){

            var kGrid = this;
            var nueva_entrada = item===undefined;
            var pk = 'kGrid_' + kGrid.div.id + '_' + 
                (nueva_entrada? ('nuevo_'+kGrid.nuevos) : item[kGrid.id]);
            var guardar = (nueva_entrada && kGrid.permisos[$.kui.i18n.add])?
                kGrid.permisos[$.kui.i18n.add] : kGrid.permisos['guardar'];

            if(nueva_entrada){

                if($('#'+pk).is(':visible')){
                    var newReady = true;

                    $('#'+pk).find('form').each(function(f,form){
                        newReady = newReady && $(form).valid();
                    });

                    if(newReady){
                        kGrid.nuevos++;
                        kGrid.load_entrada(item);
                    }else{
                        $('#'+pk).find('[data-rol="input"]:not([disabled],[readonly])')
                            .first().focus();
                    }

                    return;
                }   

                if(guardar){
                    item = {};
                }else{
                    window.console.error('Para agregar entradas vacías debe configurar el permiso "agregar" o "guardar"');
                    return;
                }
            }

            var row = $('<tr>').attr('id',pk)
                .attr('data-pk',item[kGrid.id]);

            var activo = nueva_entrada? true : false;

            if(!nueva_entrada && typeof kGrid.estado === 'function'){
                activo = kGrid.estado.call(this,item);
            }
            
            if(kGrid.onclick){
                var onclick = typeof kGrid.onclick === 'function'?
                    kGrid.onclick : function(){
                       window.open(kGrid.onclick,'_self');
                    };
                row.addClass('kbtn')
                    .click(function(){
                       onclick.call(this,item);
                    });
            }else if(kGrid.ondblclick){
                if( (typeof kGrid.ondblclick === 'function') || 
                    (activo && typeof kGrid.permisos['editar'] === 'function')){
                    var ondblclick = typeof kGrid.ondblclick === 'function'?
                        kGrid.ondblclick : function(){
                            kGrid.permisos['editar'].call(this,item);
                        };
                    row.dblclick(function(){
                        ondblclick.call(this,item);
                    });
                }
            }

            $.each(kGrid.campos,function(c,campo){
                var cell = $('<td>').attr('data-cell',true)
                    .data('campo',campo)
                    .appendTo(row);
                var data = $.kui.data.format(item,campo.nombre,campo.formato,campo.opciones,true);
                var view = $('<div>').attr('data-view',true)
                    .data('original',data)
                    .appendTo(cell);

                if(campo.tipo==='booleano'){

                    $.kui.form.newElement(false,view,item,campo);

                    cell.find('[data-rol=input]')
                        .prop('disabled',!campo.editonly)
                        .attr('data-pk',item[kGrid.id])
                        .dblclick(function(e){
                            e.stopPropagation();
                        });
                    
                    cell.addClass('text-center');
                    view.removeClass('checkbox');

                }else{
                    view.html(data);
                }
                
            });

            var botones = $('<td>')
                .addClass('kacciones')
                .appendTo(row);                         
                                            
            var dimension = 'fa-lg';

            var crear_boton = function(id,titulo,icono,hover){
                    var boton = $('<a>').attr('id', pk + '_' + id)
                        .addClass('text-muted kaccion')
                        .attr('title',titulo)
                        .attr('href',$.kui.dummyLink)
                        .html('<i class="fa ' + dimension + ' fa-'+icono+'"></i>')
                        .hover( function(){ $(this).removeClass('text-muted').addClass('text-'+hover);}, 
                                function(){ $(this).addClass('text-muted').removeClass('text-'+hover);});
                    return boton;
                };

            var habilitar_edicion = function(){
                    // Deshabilitamos ediciones anteriores
                    //kGrid.load();

                    // Si el formulario no existe, crearlo
                    if(!$('#'+pk).data('formulario')){

                        var item = $(kGrid.div).data('datos')[$('#'+pk).attr('data-pk')];

                        if(!item){
                            item = {};
                        }

                        $('#'+pk).find('[data-cell]').each(function(c,cell) {
                            var campo = $(cell).data('campo');
                            var formItem = $('<form>').attr('data-edit',true)
                                .appendTo(cell)
                                .hide();

                            $.kui.form.newElement(false,formItem,item,campo);

                            if(campo.tipo==='booleano'){
                                formItem.removeClass('checkbox')
                                    .find('[data-rol=input]')
                                    .attr('data-pk',item[kGrid.id])
                                    .dblclick(function(e){
                                        e.stopPropagation();
                                    });
                            }

                            formItem.validate({
                                showErrors: function(errorMap, errorList) {
                                    $.kui.form.validar.error(this, errorMap, errorList);
                                },
                                submitHandler: function(form) {
                                    $.kui.form.validar.fecha(form);
                                    var ready = $('#'+pk).data('ready');
                                    $('#'+pk).data('ready',++ready);
                                    return false;
                                }
                            });
                        });

                        $('#'+pk).data('formulario',true);               
                    }

                    // Preservamos el ancho de la celda
                    $('#'+pk).find('[data-cell]').each(function(c,cell){
                        $(cell).css({
                            width: $(cell).outerWidth(),
                            height: $(cell).outerHeight()
                        });
                    });

                    // Ocultamos la version de solo lectura
                    $('#'+pk).find('[data-view]').hide();

                    // Estilo de edición
                    $('#'+pk).addClass('writing');

                    // Habilitar edición inline
                    $('#'+pk).find('[data-edit]').show();

                    // Cambio de botones        
                    $('#'+ pk + '_editar').hide();
                    if(!nueva_entrada){
                        $('#'+ pk + '_remover').hide();
                        $('#'+ pk + '_deshacer').fadeIn();
                    }
                    $('#'+ pk + '_guardar').fadeIn();

                    // Focus
                    $('#'+pk).find('[data-rol="input"]:not([disabled],[readonly])').first().focus();
                };

            var deshabilitar_edicion = function(){
                // Ocultamos la versión de edición
                $('#'+pk).find('[data-edit]').hide();
                $('#'+pk).removeClass('writing');

                // Mostramos la versión de solo lectura
                $('#'+pk).find('[data-view]').fadeIn();

                // Removemos el estilo adicional
                $('#'+pk).find('[data-cell]').removeAttr('style');

                // Cambio de botones
                $('#'+ pk + '_guardar').hide();
                $('#'+ pk + '_deshacer').hide();
                $('#'+ pk + '_editar').fadeIn();
                $('#'+ pk + '_remover').fadeIn();
            };

            var deshacer_cambios = function(){
                    deshabilitar_edicion();
                    $('#'+pk).find('[data-view]').each(function(x,view){
                        var original = $(view).data('original');
                        var input = $(view).parent().find('[data-rol=input]');
                        if($(input).attr('type')==='checkbox'){
                            $(input).prop('checked',original);
                        }else{
                            $(input).val(original);
                        }
                    });
                };

            if(activo){

                var btn_editar = crear_boton('editar',$.kui.i18n.editMsg,'pencil','primary');

                if( kGrid.permisos['editar'] && !nueva_entrada &&
                    typeof kGrid.permisos['editar'] === 'function'){
                    btn_editar.click(function(e){
                        e.stopPropagation();
                        kGrid.permisos['editar'].call(this,item);
                    });
                }else if(guardar){

                    // Guardar cambios
                    var btn_guardar = crear_boton('guardar',$.kui.i18n.saveMsg,'save','primary');
                    btn_guardar.hide();

                    var guardar_cambios = typeof guardar === 'function'?
                        function(formulario){
                            guardar.call(this,formulario);
                        } : function(formulario){
                            $.ajax({
                                type: 'POST',
                                url: guardar,
                                data: formulario,
                                success: function(/*retorno*/){  
                                    kGrid.load();
                                }
                            });
                        };

                    btn_guardar.click(function(e){
                        e.stopPropagation();
                        $('#'+pk).data('ready',0);
                        var forms = $('#'+pk+' form');
                        forms.each(function(f,form){
                            $(form).submit();
                        });

                        if($('#'+pk).data('ready')===forms.length){

                            deshabilitar_edicion();
                            var dato = {};

                            forms.each(function(f,form){

                                var array = $(form).serializeArray();
                                var valor = '';

                                if(array.length){
                                    // Serialize Array para todos los inputs excepto checkbox
                                    $.each(array, function(_, it) {
                                        valor = dato[it.name] = it.value;
                                    });
                                }else{
                                    valor = $(form).find('[data-rol=input]').val();
                                }

                                $(form).parent().find('[data-view]').each(function(_,view) {
                                    var input = $(view).parent().find('[data-edit] [data-rol=input]');
                                    $(view).empty();

                                    if($(input).is('[type=checkbox]')){
                                        dato[$(input).attr('name')] = $(input).is(':checked');

                                        $(input).clone()
                                            .prop('disabled',true)
                                            .attr('data-pk',$(view).parent().parent().data('pk'))
                                            .appendTo(view);
                                    }else if($(input).is('select')){
                                        $(view).html($(input).find('option[value="'+valor+'"]').text());
                                    }else{
                                        $(view).html(valor);
                                    }
                                });
                            });

                            guardar_cambios(dato);
                        }                     
                    }).appendTo(botones);

                    // Deshacer cambios
                    var btn_deshacer = crear_boton('deshacer','Deshacer cambios','undo','danger');
                    btn_deshacer.hide()
                        .click(function(e){
                            e.stopPropagation();
                            deshacer_cambios();
                        }).appendTo(botones);

                    // Editar (o hacer cambios)
                    btn_editar.click(function(e){
                        e.stopPropagation();
                        habilitar_edicion();
                    });

                    if(!nueva_entrada){
                        btn_editar.appendTo(botones);
                    }
                }

                if(kGrid.permisos['remover'] || nueva_entrada){
                    var btn_remover = crear_boton('remover',$.kui.i18n.removeMsg,'times','danger');

                    if(!nueva_entrada && typeof kGrid.permisos['remover'] === 'function'){
                        btn_remover.click(function(e){
                            e.stopPropagation();
                            kGrid.permisos['remover'].call(this,item);
                        });
                    }else{
                        btn_remover.click(function(e){
                            e.stopPropagation();
                            $('#'+pk).remove();
                        });
                    }

                    btn_remover.appendTo(botones);
                }
                
            } else{                                    
                if(typeof kGrid.permisos['activar'] === 'function'){
                    row.addClass('has-error');
                    var btn_activar = crear_boton('reactivar',$.kui.i18n.activateMsg,'check','success');

                    btn_activar.click(function(e){
                            e.stopPropagation();
                            kGrid.permisos['activar'].call(this,item);
                        }).appendTo(botones);
                }
            }
            
            if(kGrid.botones.length){

                var ubicar_boton;

                if(kGrid.botones.length===1){
                    ubicar_boton = function(btn){
                        $(btn).appendTo(botones);
                    };
                }else{
                    var div_context = $('<div>')
                        .attr('id',$.kui.randomId())
                        .addClass('kui-dropdown')
                        .appendTo('body');

                    var ul_context = $('<ul>')
                        .attr('role','menu')
                        .addClass('dropdown-menu')
                        .appendTo(div_context);

                    var btn = crear_boton($.kui.randomId(),'Acciones','angle-down','primary');
                    
                    btn.attr('data-toggle','dropdown')
                        .attr('aria-haspopup',true)
                        .attr('aria-expanded',false)
                        .appendTo(botones);
                    
                    var div_dropdown = btn.parent()
                        .attr('id',$.kui.randomId())
                        .addClass('dropdown kui-dropdown');

                    var ul = ul_context.clone()
                        .attr('aria-labelledby',btn.attr('id'))
                        .appendTo(div_dropdown);

                    ubicar_boton = function(btn){
                        btn.find('i.fa').addClass('fa-fw')
                            .removeClass('fa-lg');

                        $('<span>').html(' ' + btn.attr('title'))
                            .appendTo(btn);

                        var li = $('<li>').attr('role','presentation')
                                .appendTo(ul);

                        $(btn).appendTo(li);

                        li.clone().appendTo(ul_context);
                    };

                    // Open context menu
                    $(row).attr('data-toggle','context')
                        .attr('data-target','#'+div_context.attr('id'));

                    var onShowDropdown = function(){
                        var current = this.id;
                        $('.kui-dropdown.open').each(function(d,dropdown){
                            if(dropdown.id!==current){
                                $(dropdown).removeClass('open');
                            }
                        });
                        kGrid.table.parent().addClass('kui-grid-dropdown-open');
                    };

                    div_context.on('show.bs.context',onShowDropdown);
                    div_dropdown.on('show.bs.dropdown',onShowDropdown);

                    var onHideDropdown = function(){
                        kGrid.table.parent().removeClass('kui-grid-dropdown-open');
                    };

                    div_context.on('hide.bs.context',onHideDropdown);
                    div_dropdown.on('hide.bs.dropdown',onHideDropdown);
                }

                $.each(kGrid.botones,function(b,boton){
                    if(typeof boton.mostrar !== 'function' || boton.mostrar.call(this,item)){
                        var btn = crear_boton($.kui.randomId(),boton.comentario,boton.icono,'primary');

                        btn.attr('href', (boton.enlace!==undefined)? boton.enlace : $.kui.dummyLink);
                        
                        if(boton.onclick!==undefined){
                            btn.click(function(e){
                                e.stopPropagation();
                                boton.onclick.call(this,item);
                            });
                        }
                        
                        if(boton.atributos!==undefined){
                            $.each(boton.atributos,function(atributo,valor){
                                btn.attr(atributo,valor);
                            });
                        }

                        ubicar_boton(btn);
                    }   
                });
            }

            if(nueva_entrada){
                row.prependTo(kGrid.tbody);
                habilitar_edicion();
                row.find('[data-creable]')
                    .removeAttr('readonly')
                    .removeAttr('disabled');
            }else{
                row.appendTo(kGrid.tbody);
            }

        },
        
        cambiar_seleccion: function(codigo,estado){
            var kGrid = this;
            kGrid.seleccionados[codigo] = estado;
            kGrid.refrescar_seleccionados();
        },

        seleccionar: function(seleccionados){
            var kGrid = this;
            kGrid.seleccionados = {};
            $.each(seleccionados,function(s,seleccionado){
                kGrid.seleccionados[seleccionado] = true;
            });

            $('.' + kGrid.div.id + '_seleccionar_row').each(function(i,item){
                $(item).removeAttr('checked');
                if(kGrid.seleccionados[$(item).data('pk')]){
                    $(item).prop('checked',true);
                }
            });

            kGrid.refrescar_seleccionados();
        },

        refrescar_seleccionados: function(){
            var kGrid = this;
            var seleccionados = [];
            $.each(kGrid.seleccionados,function(codigo,estado){
                if(estado){
                    seleccionados.push(codigo);
                }
            });
            $(kGrid.div).data('seleccionados',seleccionados);

            var seleccionados_pagina_actual = $(kGrid.div)
                .find('.' + kGrid.div.id + '_seleccionar_row:checked').length;

            kGrid.checkall.prop('checked',
                seleccionados_pagina_actual>0 &&
                ($(kGrid.div).find('.' + kGrid.div.id + '_seleccionar_row').length ===
                seleccionados_pagina_actual));
        },

        agregar: function(nuevo){
            var kGrid = this;
            kGrid.load_entrada(nuevo);
        }

    };
    
}(jQuery));
(function ($) {

    // Instances
    $.kui.instances.wizard = {};
    
    // Widget definition.
    $.kui.widgets.wizard = function (data) {
        return $.kui.instances.wizard[this.id] = new KWizard(this,data);
    };
    
    var KWizard = function(div,params){
        
        if( params[$.kui.i18n.steps]===undefined){
            window.console.error(
                'The param ' + 
                '"' + $.kui.i18n.steps + '"' +
                ' is required.'
            );
            return;
        }

        $.extend(this,{
            steps: params[$.kui.i18n.steps],
            indices: params[$.kui.i18n.indices],
            prev: params[$.kui.i18n.prev],
            next: params[$.kui.i18n.next],
            validate: params[$.kui.i18n.validate],
            loadComplete: params[$.kui.i18n.loadComplete]
        });

        this.div = div;
        this.load();
    };
    
    KWizard.prototype = {
    		        
        load : function() {
            
            var kWizard = this;
            var wizard = $(kWizard.div);

            wizard.hide()
                .attr('data-wizard',true)
                .attr('data-step','0');

            if(typeof kWizard.steps === 'string'){
                wizard.find(kWizard.steps).each(function(p,step){
                    $(step).hide()
                        .attr('data-wizard-step',true)
                        .attr('data-step',p+1);
                });
                wizard.find(kWizard.indices).each(function(p,step){
                    $(step).removeClass('active')
                        .attr('data-wizard-index',true)
                        .attr('data-index',p+1);
                });
            }else{
                //TODO Build automatic steps
            }

            kWizard.pager = {};

            if(!kWizard.prev || !kWizard.next){
                kWizard.pager.container = $('<ul>').addClass('pager')
                    .appendTo($('<nav>').appendTo(wizard));
            }

            kWizard.pager.prev = kWizard.prev? 
                $(kWizard.prev) : 
                $('<button>').addClass('btn btn-default')
                    .html($.kui.i18n.prevMsg)
                    .appendTo($('<li>').appendTo(kWizard.pager.container))
                    .after('&nbsp;');

            kWizard.pager.next = kWizard.next? 
                $(kWizard.next) : 
                $('<button>').addClass('btn btn-primary')
                    .html($.kui.i18n.nextMsg)
                    .appendTo($('<li>').appendTo(kWizard.pager.container))
                    .before('&nbsp;');

            kWizard.pager.prev.click(function(){
                var step = parseInt(wizard.attr('data-step'));
                kWizard.showStep(step-1);
            });

            kWizard.pager.next.click(function(){
                var step = parseInt(wizard.attr('data-step'));
                if(kWizard.validate(step)){
                    kWizard.showStep(step+1);
                }
            });
            
            if(typeof kWizard.loadComplete === 'function'){
                kWizard.loadComplete.call(this);
            }

            kWizard.showStep(1);
            wizard.fadeIn();
            
        },

        validate: function(step){

            var kWizard = this;
            var success = true;
            var currentStep = $(kWizard.div).find('[data-wizard-step][data-step="'+step+'"]');

            if(typeof kWizard.validate === 'function'){
                success = kWizard.validate.call(this,currentStep);
            }

            return success;
        },

        showStep: function(step){
            
            var kWizard = this;
            var wizard = $(kWizard.div);
            var currentStep = wizard.find('[data-wizard-step][data-step="'+step+'"]');

            if(!currentStep.length){
                return;
            }

            var prevStep = wizard.find('[data-wizard-step]:visible');
            prevStep.trigger('hide').hide().trigger('hidden');
            wizard.find('[data-wizard-index]').removeClass('active');
            wizard.find('[data-wizard-index][data-index="'+step+'"]')
                .addClass('active');

            wizard.attr('data-step',step);
            kWizard.pager.prev.prop('disabled',step===1);
            kWizard.pager.next.prop('disabled',
                step===wizard.find('[data-wizard-step]').length);


            currentStep.trigger('show')
                .fadeIn('slow',function(){
                    currentStep.trigger('shown');
                });

        }

    };
    
}(jQuery));