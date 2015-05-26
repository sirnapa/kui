/*! kui - v0.1.3 - 2015-05-26
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

  $.kui.formulario = {

    nuevo_elemento: function(soloLectura,elemento,item,campo){

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
       soloLectura = soloLectura || campo.soloLectura;
       var valorInput  = $.kui.data.format(
        item,campo.nombre,campo.formato,campo.opciones,soloLectura
       );

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
              .val(valorInput)
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
          var nuevo_input = crear_input_select(soloLectura?
              'input' : 'select');
          nuevo_input.attr('name',campo.nombre+'.'+campo.opciones.id);
          nuevo_input.appendTo(elemento);

          if(!soloLectura){
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
                  
                  if(valorInput.toString()===opcion[campo.opciones.id].toString()){
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
                  icono: 'calendar-o',
                  formato: 'dd/MM/yyyy hh:mm:ss'
              }
       };

       var crear_combo_fecha_hora = function(tipo){
          // Los datetimepicker siempre deberán tener íconos
          campo.simple = false;

          var nuevo_input = crear_input(conf_fecha_hora[tipo].icono);
          var inputGroup = nuevo_input.parent();
          inputGroup.addClass('date');

          nuevo_input.attr('data-format',conf_fecha_hora[tipo].formato)
              .attr('type','text')
              .prependTo(inputGroup);

          if(tipo!=='hora'){
              nuevo_input.attr('data-rule-date',true);
          }

          if(!soloLectura){
              inputGroup.find('.input-group-addon').addClass('add-on')
                .find('i').attr({
                  'data-time-icon': 'fa fa-clock-o',
                  'data-date-icon': 'fa fa-calendar'
                });

              var constructor = {language: "es",autoclose: true};
              $.extend(constructor,conf_fecha_hora[tipo].constructor);
              inputGroup.datetimepicker(constructor);

              var widgets = $('.bootstrap-datetimepicker-widget.dropdown-menu');

              widgets.find('ul').addClass('list-unstyled');
              widgets.find('.icon-chevron-up').addClass('fa fa-chevron-up');
              widgets.find('.icon-chevron-down').addClass('fa fa-chevron-down');
              widgets.find('th.prev').html($('<i>').addClass('fa fa-chevron-left').css('font-size','0.5em'));
              widgets.find('th.next').html($('<i>').addClass('fa fa-chevron-right').css('font-size','0.5em'));
          }

          return nuevo_input;
       };

       switch(campo.tipo) {

          case 'booleano':
              input = crear_input_select('input');
              input.appendTo(elemento);
              input.prop('type','checkbox');
              input.prop('checked',valorInput);
              input.removeClass('form-control');
              elemento.addClass('checkbox');
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

(function ($) {

	$.kui.list = {

    	actions: function(o){

    		/*
    		 *	Actions params:
    		 *	- element
    		 *	- constructor
    		 *	- instances
    		 *	- data
    		 *	- aux
    		 *
    		 */

    		if(typeof o.data === 'string'){
                var instance = o.instances[o.element.id];

                if( instance === undefined || instance === null){
                    return;
                }

                switch(o.data) {
                    case 'recargar':
                        // o.aux sirve para sobre-escribir el data
                        if(o.aux!==undefined){
                            instance.set_data(o.aux);
                        }
                        instance.cargar();
                        break;
                    case 'pagina':
                        // o.aux recibe la pagina de destino, tambien puede recibir
                        // estas opciones: primera, anterior, siguiente, ultima
                        if(o.aux===undefined){
                            return;
                        }
                        var pagina = parseInt(o.aux);
                        if(isNaN(pagina)){
                            pagina = 0;
                            switch(o.aux) {
                                case 'primera':
                                    pagina = 1;
                                    break;
                                case 'anterior':
                                    pagina = parseInt(instance.pagina) - 1;
                                    break;
                                case 'siguiente':
                                    pagina = parseInt(instance.pagina) + 1;
                                    break;
                                case 'ultima':
                                    pagina = instance.totalPaginas;
                                    break;
                                default:
                                    return;
                            }
                        }
                        if(pagina<1 || pagina>parseInt(instance.totalPaginas)){
                            return;
                        }
                        instance.set_data({page:pagina});
                        instance.cargar();
                        break;
                    case 'buscar':
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
                        instance.set_data({
                            _search: true,
                            filters: JSON.stringify({
                                "groupOp":groupOp,
                                "rules": reglas
                                })
                        });
                        instance.set_data({page:1});
                        instance.cargar();
                        break;
                    case 'seleccionar':
                        instance.seleccionar(o.aux);
                        break;
                    case 'agregar':
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

        params: function(o){

            /*
             *  Params params:
             *  - list
             *  - div
             *  - params
             *  - rows
             *
             */
        
            /* 
             * Si no se provee algun campo obligatorio, 
             * no se puede continuar.
            */

            if( o.params.url===undefined || o.params.id===undefined || o.params.campos===undefined){
                window.console.error('Los campos id, url y campos son obligatorios.');
                return;
            }
            
            /*
             * Se procesan los campos opcionales
             */
            
            if(o.params.ajax===undefined){
                o.params.ajax = 'GET';
            }

            if(o.params.data===undefined){
                o.params.data = {};
            }

            if(o.params.titulos===undefined){
                o.params.titulos = true;
            }
            
            if(o.params.permisos===undefined){
                o.params.permisos = {};
            }
            
            if(o.params.retorno===undefined){
                o.params.retorno = {};
            }
            
            if(o.params.botones===undefined){
                o.params.botones = [];
            }
            
            if(o.params.paginador===undefined){
                o.params.paginador = $('<div>').addClass('text-center')
                    .appendTo(o.div);
            }
            
            var data_final = {
                _search:false,
                filters:null,
                page:1,
                rows:o.rows,
                sidx:o.params.id,
                sord:'asc', 
                todos:false
            };

            $.each(o.params.data,function(key,value){
                data_final[key] = value;
            });

            var permisos_finales = {
                agregar:null,
                editar:null,
                guardar: null,
                activar:null,
                remover:null
            };

            $.each(o.params.permisos,function(key,value){
                permisos_finales[key] = value;
            });
                    
            /*var retorno_final = {
                lista: 'lista',                    
                pagina: 'pagina',
                totalDatos: 'totalDatos'
            }
            
            $.each(o.params.retorno,function(key,value){
                retorno_final[key] = value;
            });*/

            if(o.params.seleccionable){
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
                o.params.campos.unshift(campo_seleccion);

                if(!o.params.seleccionados){
                    o.params.seleccionados = [];
                }

                o.list.checkall = $('<input>');
            } 
                    
            o.list.div = o.div;
            o.list.url = o.params.url;
            o.list.data = data_final;
            o.list.id = o.params.id;
            o.list.mostrar_titulos = o.params.titulos;
            o.list.etiquetas = [];
            o.list.campos = o.params.campos;
            o.list.ajax = o.params.ajax;
            o.list.permisos = permisos_finales;
            o.list.botones = o.params.botones;
            o.list.estado = o.params.estado;
            //o.list.retorno = retorno_final;
            o.list.load_complete = o.params.loadComplete;
            o.list.paginador = o.params.paginador;
            o.list.onclick = o.params.onclick;
            o.list.ondblclick = o.params.ondblclick;
            o.list.seleccionable = o.params.seleccionable;
            o.list.seleccionados = {};
            o.list.preseleccionados = o.params.seleccionados;
            o.list.nuevos = 0;
            o.list.enlace_dummy = 'javascript'+':'.toLowerCase()+'void(0)';

            $.kui.list.cargar_estilos();
            $.kui.list.cargar_paginador(o.list);
            o.list.titulos();
            o.list.cargar();
            
            $(o.div).on('reloadGrid',function(){
                $.kui.instances.kgrid[o.list.id].cargar();
            });
            
        },

        cargar_paginador : function(list){
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
                    $('#'+list.div.id).kui(list.name,'pagina','primera');
                });
                
           $('<button>').attr('id',pk+'pagina_anterior')
                .attr('type','button')
                .addClass('btn btn-default')
                .html($('<i>').addClass('fa fa-backward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+list.div.id).kui(list.name,'pagina','anterior');
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
                    $('#'+list.div.id).kui(list.name,'pagina','siguiente');
                });
                
           $('<button>').attr('id',pk+'ultima_pagina')
                .attr('type','button')
                .addClass('btn btn-default')
                .html($('<i>').addClass('fa fa-step-forward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+list.div.id).kui(list.name,'pagina','ultima');
                });
        },

        refrescar_paginador: function(list){
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

        cargar_estilos: function(){
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
  $.kui.random_id = function() {
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g,
      function(c) {
        var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
  };

  // Data & Format
  $.kui.data = {

  	format: function(item,nombre,formato,combo,soloLectura){

  		if(combo){
          var subvalor = function(dato,nivel_1,nivel_2){
            return dato[nivel_1]? dato[nivel_1][nivel_2] : 
                   (dato[nivel_1+'.'+nivel_2]? 
                    dato[nivel_1+'.'+nivel_2] : '');
          };

          if(soloLectura){
            return typeof combo.formato==='function'? 
                combo.formato.call(this,
                  item[nombre]?
                  item[nombre] : 
                  item[nombre+'.'+combo.id]) :
                subvalor(item,nombre,combo.formato);
          }else{
          	return subvalor(item,nombre,combo.id);
          }
    	}

        return typeof formato === 'function'?
            formato.call(this,item[nombre],item) : item[nombre];
    }

  };

}(jQuery));