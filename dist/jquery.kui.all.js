/*! kui - v0.0.4 - 2015-02-03
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

       var valor_input = function(){
          return typeof campo.formato === 'function'? 
              campo.formato.call(this,item[campo.nombre],item)
              :  item[campo.nombre];
       };

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
                  if(valor_input()===opcion[campo.opciones.id]){
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
              return;
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

/*! 
 *
 *   +++++++++++++++++++++ kGrid +++++++++++++++++++++ 
 *
 */

(function ($) {

    $.kGrids = {
        instances : {}
    };
    
    // Collection method.
    $.fn.kGrid = function (dato,aux) {
        return this.each(function () {
            if(typeof dato === 'string'){
                var instancia = $.kGrids.instances[this.id];
                if( instancia === undefined || instancia === null){
                    return;
                }
                switch(dato) {
                    case 'recargar':
                        // aux sirve para sobre-escribir el data
                        if(aux!==undefined){
                            instancia.set_data(aux);
                        }
                        instancia.cargar();
                        break;
                    case 'pagina':
                        // aux recibe la pagina de destino, tambien puede recibir
                        // estas opciones: primera, anterior, siguiente, ultima
                        if(aux===undefined){
                            return;
                        }
                        var pagina = parseInt(aux);
                        if(isNaN(pagina)){
                            pagina = 0;
                            switch(aux) {
                                case 'primera':
                                    pagina = 1;
                                    break;
                                case 'anterior':
                                    pagina = parseInt(instancia.pagina) - 1;
                                    break;
                                case 'siguiente':
                                    pagina = parseInt(instancia.pagina) + 1;
                                    break;
                                case 'ultima':
                                    pagina = instancia.totalPaginas;
                                    break;
                                default:
                                    return;
                            }
                        }
                        if(pagina<1 || pagina>parseInt(instancia.totalPaginas)){
                            return;
                        }
                        instancia.set_data({page:pagina});
                        instancia.cargar();
                        break;
                    case 'buscar':
                        // aux es la clave de búsqueda
                        if(aux===undefined){
                            return;
                        }
                        
                        var groupOp = 'AND';
                        if(aux.groupOp!==undefined){
                            groupOp=aux.groupOp;
                        }
                        var reglas = [];
                        $.each(aux.reglas,function(c,campo){
                            reglas.push({
                                'field': campo.field,
                                'data': (campo.data!==undefined)? campo.data : aux.data,
                                'op': (campo.op!==undefined)? campo.op : 'cn'
                            });
                        });  
                        instancia.set_data({
                            _search: true,
                            filters: JSON.stringify({
                                "groupOp":groupOp,
                                "rules": reglas
                                })
                        });
                        instancia.set_data({page:1});
                        instancia.cargar();
                        break;
                    case 'seleccionar':
                        instancia.seleccionar(aux);
                        break;
                    case 'agregar':
                        instancia.agregar(aux);
                        break;
                    default:
                        return;
                }	
            }else{
                var newKGrid = new KGrid(this,dato);
                $.kGrids.instances[this.id] = newKGrid;
            }
        });
    
    };
    
    var KGrid = function(div,dato){
    	
        /* 
    	 * Si no se provee algun campo obligatorio, 
    	 * no se puede continuar.
    	*/

        if( dato.url===undefined || dato.id===undefined || dato.campos===undefined){
            window.console.error('Los campos id, url y campos son obligatorios.');
            return;
        }
        
        /*
         * Se procesan los campos opcionales
         */
        
        if(dato.ajax===undefined){
            dato.ajax = 'GET';
        }

        if(dato.data===undefined){
            dato.data = {};
        }

        if(dato.titulos===undefined){
            dato.titulos = true;
        }
        
        if(dato.permisos===undefined){
            dato.permisos = {};
        }
        
        if(dato.retorno===undefined){
            dato.retorno = {};
        }
        
        if(dato.botones===undefined){
            dato.botones = [];
        }
        
        if(dato.paginador===undefined){
            dato.paginador = $('<div>').addClass('text-center')
                .appendTo(div);
        }
        
        var data_final = {
            _search:false,
            filters:null,
            page:1,
            rows:10,
            sidx:dato.id,
            sord:'asc', 
            todos:false
        };

        if(dato.tarjetas){
            data_final.rows = 5;
        }

        $.each(dato.data,function(key,value){
            data_final[key] = value;
        });

        var permisos_finales = {
            agregar:null,
            editar:null,
            guardar: null,
            activar:null,
            remover:null
        };

        $.each(dato.permisos,function(key,value){
            permisos_finales[key] = value;
        });
                
        /*var retorno_final = {
            lista: 'lista',                    
            pagina: 'pagina',
            totalDatos: 'totalDatos'
        }
        
        $.each(dato.retorno,function(key,value){
            retorno_final[key] = value;
        });*/

        if(dato.seleccionable){
            // Agregar campo de selección al principio;
            var campo_seleccion = {
                nombre: 'kGrid_seleccionado',
                titulo: '',
                tipo: 'booleano',
                ancho: 1,
                atributos: {
                    'readonly': 'false',
                    'disabled': 'false',
                    'class': div.id + '_seleccionar_row'
                }
            };
            dato.campos.unshift(campo_seleccion);

            if(!dato.seleccionados){
                dato.seleccionados = [];
            }
        }   
                
        this.div = div;
        this.url = dato.url;
        this.data = data_final;
        this.id = dato.id;
        this.tarjetas = dato.tarjetas;
        this.mostrar_titulos = dato.titulos;
        this.etiquetas = [];
        this.campos = dato.campos;
        this.ajax = dato.ajax;
        this.permisos = permisos_finales;
        this.botones = dato.botones;
        this.estado = dato.estado;
        //this.retorno = retorno_final;
        this.load_complete = dato.loadComplete;
        this.paginador = dato.paginador;
        this.onclick = dato.onclick;
        this.ondblclick = dato.ondblclick;
        this.seleccionable = dato.seleccionable;
        this.seleccionados = {};
        this.preseleccionados = dato.seleccionados;
        this.nuevos = 0;
        this.enlace_dummy = 'javascript'+':'.toLowerCase()+'void(0)';

        this.cargar_estilos();
        this.cargar_paginador();
        this.titulos();
        this.cargar();
        
        $(div).on('reloadGrid',function(){
            $.kGrids.instances[this.id].cargar();
        });
        
    };
    
    KGrid.prototype = {
    		
        set_data: function(data){
            var kGrid = this;
            $.each(data,function(key,value){
                kGrid.data[key] = value;
            });            
        },

        nueva_grilla : function(){
            var kGrid = this;
            $(kGrid.div).addClass('kgrid form-horizontal');
            kGrid.contenido = $('<div>').attr('id',kGrid.div.id + '_grilla')
                    .prependTo(kGrid.div);

            if(kGrid.seleccionable){
                kGrid.seleccionar(kGrid.preseleccionados);
            }
        },

        nuevo_mensaje: function(tipo,mensaje){
            var kGrid = this;

            if(kGrid.mensaje){
                kGrid.mensaje.remove();
            }

            kGrid.mensaje = $('<div>')
                .attr('role','alert')
                .addClass('alert')
                .addClass(tipo? tipo : 'alert-info')
                .html(mensaje)
                .prependTo(kGrid.contenido);

            $('<button>').attr('data-dismiss','alert')
                .addClass('close')
                .attr('type','button')
                .html('<i class="fa fa-times"></i>')
                .appendTo(kGrid.mensaje);
            
        },

        titulos: function(){
            var kGrid = this;

            if(kGrid.tarjetas){
                return;
            }

            var formGroup = $('<div>').addClass('form-group hidden-xs hidden-sm');
            var columnas = $('<div>').addClass('col-md-11').appendTo(formGroup);

            kGrid.nueva_grilla();
                                                                            
            $.each(kGrid.campos,function(c,campo){                       
                var label = $('<h4>');
                if(campo.titulo!==undefined){
                    label.append(campo.titulo);
                }else{
                    label.append(campo.nombre);
                }

                kGrid.etiquetas.push(label.html());
                $('<i>').addClass('fa fa-fw fa-arrow-down text-muted')
                    .prependTo(label);

                if(!campo.ancho){
                    campo.ancho = parseInt(12/kGrid.campos.length);
                }

                var titulo = $('<div>').html(label)
                    .addClass('col-md-'+campo.ancho)
                    .appendTo(columnas);

                if(kGrid.seleccionable && c===0){
                    titulo.addClass('text-center');
                    var checkall = $('<input>').attr('id',kGrid.div.id+'_seleccionar_todo')
                        .attr('type','checkbox')
                        .change(function(){
                            var todos = $(this).is(':checked');
                            $('.' + kGrid.div.id + '_seleccionar_row').each(function(i,item){
                                $(item).prop('checked',todos);
                                $(item).trigger('change');
                            });
                        });
                    label.html(checkall);
                }
            });                            
            
            formGroup.prependTo(kGrid.div);

            if(!kGrid.mostrar_titulos){
                formGroup.hide();
            }
        },
        
        cargar : function() {
            
            var kGrid = this;
            if(kGrid.contenido){
                kGrid.contenido.empty();
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
                        kGrid.totalDatos = retorno.respuesta.totalDatos;
                        kGrid.pagina = retorno.respuesta.pagina;
                        kGrid.totalPaginas = Math.ceil(kGrid.totalDatos/kGrid.data.rows);

                        kGrid.grilla = $('<div>').addClass('kGrid').prependTo(kGrid.contenido);                       
                        
                        $.each(lista,function(i,item){
                            datos[item[kGrid.id]] = item;
                            kGrid.cargar_entrada(item);                          
                        });

                        $(kGrid.grilla).find('.' + kGrid.div.id + '_seleccionar_row')
                            .each(function(i,item){
                                if(kGrid.seleccionados[$(item).data('pk')]){
                                    $(item).attr('checked','checked');
                                }
                                $(item).change(function(){
                                    kGrid.cambiar_seleccion($(item).data('pk'),$(item).is(':checked'));
                                });
                            });

                        if(kGrid.tarjetas){
                            kGrid.grilla.find('.kscore').each(function(s,score){
                                var lado = parseInt($(score).parent().parent().parent().height()) * 0.8;
                                $(score).css('width',lado);
                                $(score).css('height',lado);
                            });
                            
                            kGrid.grilla.find('.kacciones,.kscores').each(function(e,elemento){
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
                        }

                        $(kGrid.div).data('datos',datos);
                        $(kGrid.div).data('totalDatos',kGrid.totalDatos);
                        $(kGrid.div).data('pagina',kGrid.pagina);
                        $(kGrid.div).data('totalPaginas',kGrid.totalPaginas);
                                                
                        $('#kGrid_' + kGrid.div.id + '_pagina')
                            .val(kGrid.pagina)
                            .data('pagina',kGrid.pagina);
                        $('#kGrid_' + kGrid.div.id + '_totalPaginas')
                            .html(kGrid.totalPaginas);
                        $('#kGrid_' + kGrid.div.id + '_primera_pagina')
                            .attr('disabled',kGrid.pagina===1);
                        $('#kGrid_' + kGrid.div.id + '_pagina_anterior')
                            .attr('disabled',kGrid.pagina===1);
                        $('#kGrid_' + kGrid.div.id + '_ultima_pagina')
                            .attr('disabled',kGrid.pagina===kGrid.totalPaginas);
                        $('#kGrid_' + kGrid.div.id + '_siguiente_pagina')
                            .attr('disabled',kGrid.pagina===kGrid.totalPaginas);
                        
                    }else if(retorno.mensaje){
                        kGrid.nuevo_mensaje(retorno.tipoMensaje,retorno.mensaje);
                    }
            
                    if(typeof kGrid.load_complete === 'function'){
                        kGrid.load_complete.call(this,retorno);
                    }
                },
                async: false
            });
        },

        cargar_entrada: function(item){

            var kGrid = this;
            var nueva_entrada = item===undefined;
            var pk = 'kGrid_' + kGrid.div.id + '_' + 
                (nueva_entrada? ('nuevo_'+kGrid.nuevos) : item[kGrid.id]);
            var guardar = (nueva_entrada && kGrid.permisos['agregar'])?
                kGrid.permisos['agregar'] : kGrid.permisos['guardar'];

            if(nueva_entrada){
                if($('#'+pk).is(':visible')){
                    var primer_input = $('#'+pk).find('input[data-editando]').first();
                    if(primer_input.length){
                        primer_input.focus();
                    }else{
                        kGrid.nuevos++;
                        kGrid.cargar_entrada(item);

                    }
                    return;
                }

                if(!kGrid.tarjetas && guardar){
                    item = {};
                }else{
                    window.console.error('Para agregar entradas vacías la grilla no debe ser tipo tarjeta y debe configurar el permiso "agregar" o "guardar"');
                    return;
                }
            }

            var formGroup = $('<div>').attr('id',pk)
                .attr('data-pk',item[kGrid.id])
                .addClass('form-group' + (kGrid.tarjetas? ' well' : ''));

            var activo = nueva_entrada? true : false;
            if(!nueva_entrada && typeof kGrid.estado === 'function'){
                activo = kGrid.estado.call(this,item);
            }
            
            if(kGrid.onclick){
                var onclick = typeof kGrid.onclick === 'function'?
                    kGrid.onclick : function(){
                       window.open(kGrid.onclick,'_self');
                    };
                formGroup.addClass('kbtn')
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
                    formGroup.dblclick(function(){
                        ondblclick.call(this,item);
                    });
                }
            }
                                        
            var izquierda = $(guardar? '<form>' : '<div>')
                .addClass('col-md-' + (kGrid.tarjetas? '7' : '11'))
                .appendTo(formGroup);
            var derecha = $('<div>').addClass('text-right col-md-' + (kGrid.tarjetas? '5' : '1'))
                .appendTo(formGroup);
            var botones = $('<div>').addClass('pull-right')
                .addClass('kacciones')
                .appendTo(derecha);
            var scores = $('<div>').addClass('kscores pull-right')
                .appendTo(derecha);
                            
            $.each(kGrid.campos,function(c,campo){ 
                var columna;

                if(campo.tipo!=='score'){
                    var ancho_columna = campo.ancho;
                    var contenedor = '<div>';

                    if(kGrid.tarjetas){
                        ancho_columna = 6;
                        contenedor = '<p>';
                        if(campo.tipo==='destacado' || campo.tipo==='encabezado'){
                            ancho_columna = 12;
                        }
                        if(campo.tipo==='encabezado'){
                            contenedor = '<h2>';
                        }
                    }
                    
                    columna = $(contenedor)
                        .addClass('col-md-'+ancho_columna)
                        .appendTo(izquierda);
                }else{
                    columna = $('<p>').appendTo(
                            $('<div>')
                                .addClass('text-center pull-left kscore')
                                .appendTo(scores)
                        );
                }

                if(!kGrid.tarjetas){
                    $('<label>').addClass('klabel')
                        .addClass('visible-xs visible-sm')
                        .html(kGrid.etiquetas[c])
                        .appendTo(columna);
                }

                if(kGrid.tarjetas){
                    columna.html(typeof campo.formato === 'function'?
                        campo.formato.call(this,item[campo.nombre],item) : item[campo.nombre]);

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
                }else{

                    if(campo.simple===undefined){
                        campo.simple = true;
                    }

                    $.kui.formulario.nuevo_elemento(!nueva_entrada,columna,item,campo);

                    var input = columna.find('[data-rol=input]');
                    
                    if(!input.hasClass(kGrid.div.id + '_seleccionar_row')){
                        input.attr('readonly',true);
                    }

                    if(input.attr('type')==='checkbox'){
                        
                        input.attr('data-pk',item[kGrid.id])
                            .dblclick(function(e){
                                e.stopPropagation();
                            });

                        if(input.attr('readonly')){
                            input.attr('disabled','disabled');
                        }
                        
                        input.parent().addClass('text-center');
                    }
                }

                if(typeof campo.formato === 'function'){
                    item[campo.nombre] = campo.formato.call(this,item[campo.nombre],item);
                }                         
            });                            
                                            
            var dimension = kGrid.tarjetas? 'fa-3x' : 'fa-lg';

            var crear_boton = function(id,titulo,icono,hover){
                    var boton = $('<a>').attr('id', pk + '_' + id)
                        .addClass('text-muted kaccion')
                        .attr('title',titulo)
                        .attr('href',kGrid.enlace_dummy)
                        .html('<i class="fa ' + dimension + ' fa-'+icono+'"></i>')
                        .hover( function(){ $(this).removeClass('text-muted').addClass('text-'+hover);}, 
                                function(){ $(this).addClass('text-muted').removeClass('text-'+hover);});
                    return boton;
                };

            var habilitar_edicion = function(){
                    // Deshabilitamos ediciones anteriores
                    //kGrid.cargar();

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
                    var original = $(kGrid.div).data('datos')[$('#'+pk).attr('data-pk')];
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

                if(kGrid.permisos['editar']){
                    var btn_editar = crear_boton('editar','Editar','pencil','primary');

                    if(typeof kGrid.permisos['editar'] === 'function'){
                        btn_editar.click(function(e){
                            e.stopPropagation();
                            kGrid.permisos['editar'].call(this,item);
                        });
                    }else if(guardar){

                        // Guardar cambios
                        var btn_guardar = crear_boton('guardar','Guardar','save','primary');
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
                                        kGrid.cargar();
                                    }
                                });
                            };

                        $.kui.formulario.validar.reglas();

                        $(izquierda).validate({
                            showErrors: function(errorMap, errorList) {
                                $.kui.formulario.validar.error(this, errorMap, errorList);
                            },
                            submitHandler: function(form) {
                                $.kui.formulario.validar.fecha(form);
                                
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
                if(kGrid.permisos['remover']){
                    var btn_remover = crear_boton('remover','Remover','times','danger');

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
                    formGroup.addClass('has-error');
                    var btn_activar = crear_boton('reactivar','Reactivar','check','success');

                    btn_activar.click(function(e){
                            e.stopPropagation();
                            kGrid.permisos['activar'].call(this,item);
                        }).appendTo(botones);
                }
            }
            
            $.each(kGrid.botones,function(b,boton){
                if(typeof boton.mostrar !== 'function' || boton.mostrar.call(this,item)){
                    var btn = $('<a>').attr('title',boton.comentario)
                        .addClass('text-muted kaccion')
                        .attr('href', (boton.enlace!==undefined)? boton.enlace : kGrid.enlace_dummy)
                        .html('<i class="fa ' + dimension + ' fa-' + boton.icono+'"></i>')
                        .hover( function(){ $(this).removeClass('text-muted'); }, 
                            function(){ $(this).addClass('text-muted'); });
                    
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
                    btn.appendTo(botones);
                }   
            });

            if(nueva_entrada){
                formGroup.prependTo(kGrid.grilla);
                habilitar_edicion();
            }else{
                formGroup.appendTo(kGrid.grilla);
            }

            if(!kGrid.tarjetas){
                formGroup.after($('<hr>').addClass('visible-xs visible-sm'));
            }
        },
        
        cargar_paginador : function(){
            var kGrid = this;    
            if(!$(kGrid.paginador).length){
                return;
            }
            var pk = 'kGrid_' + kGrid.div.id + '_';
            var contenedor = $('<div>').attr('id',pk+'paginador')
                .addClass('kGrid-paginador btn-group')
                .appendTo(kGrid.paginador);
            
            $('<button>').attr('id',pk+'primera_pagina')
                .attr('type','button')
                .addClass('btn btn-default')
                .html($('<i>').addClass('fa fa-step-backward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+kGrid.div.id).kGrid('pagina','primera');
                });
                
           $('<button>').attr('id',pk+'pagina_anterior')
                .attr('type','button')
                .addClass('btn btn-default')
                .html($('<i>').addClass('fa fa-backward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+kGrid.div.id).kGrid('pagina','anterior');
                });
                
          var centro = $('<div>').addClass('btn btn-default kpagina')
                .css('height',$('#'+pk+'pagina_anterior').outerHeight())
                .appendTo(contenedor);
                
          $('<label>').html('Página ').appendTo(centro);
          $('<input>').attr('id',pk+'pagina')
            .attr('type','text')
            .addClass('pagina')
            .css('width',$('#'+pk+'pagina_anterior').outerWidth())
            .appendTo(centro)
            .keyup(function(e){
                if(e.keyCode === 13){
                    e.preventDefault();
                    var pagina = parseInt($('#'+pk+'pagina').val());
                    if(isNaN(pagina) || pagina<0 || pagina > kGrid.totalPaginas){
                        $('#'+pk+'pagina').val($('#'+pk+'pagina').data('pagina'));
                        return;
                    }
                    if(pagina!==$('#'+pk+'pagina').data('pagina')){
                        $('#'+kGrid.div.id).kGrid('pagina',pagina);
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
                    $('#'+kGrid.div.id).kGrid('pagina','siguiente');
                });
                
           $('<button>').attr('id',pk+'ultima_pagina')
                .attr('type','button')
                .addClass('btn btn-default')
                .html($('<i>').addClass('fa fa-step-forward'))
                .appendTo(contenedor)
                .click(function(){
                    $('#'+kGrid.div.id).kGrid('pagina','ultima');
                });
        },

        cargar_estilos: function(){
            if($('#kgrid_estilos').length){
                return;
            }
            var reglas = {
                '.kgrid .kbtn': 
                        [
                            'cursor: pointer'
                        ],
                '.kgrid .kbtn:hover':
                        [
                            'background: #ECECF0',
                            'border: 1px solid #cacaca'
                        ],
                '.kgrid h2':
                        [
                            'padding-bottom: 10px'
                        ],
                '.kgrid .kscore':
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
                '.kgrid .kscore p':
                        [
                            'margin-top: 25%'
                        ],
                '.kgrid .kscore small':
                        [
                            'font-size: 0.5em'
                        ],
                '.kgrid .klabel':
                        [
                            'margin-top: 20px'
                        ],
                '.kgrid .kaccion':
                        [
                            'margin-left: 15px'
                        ],
                '.kgrid .kpagina':
                        [
                            'overflow: hidden',
                            'padding-top: 2px'
                        ],
                '.kgrid .kpagina input':
                        [
                            'margin: 0 5px',
                            'text-align: center'
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
            var estilos_k = $('<style>').attr('id','kgrid_estilos')
                .html(estilo);

            if(primer_estilo.length){
                primer_estilo.before(estilos_k);
            }else{
                estilos_k.prependTo('head');
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
        },

        agregar: function(nuevo){
            var kGrid = this;
            kGrid.cargar_entrada(nuevo);
        }

    };
    
}(jQuery));
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

       var valor_input = function(){
          return typeof campo.formato === 'function'? 
              campo.formato.call(this,item[campo.nombre],item)
              :  item[campo.nombre];
       };

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
                  if(valor_input()===opcion[campo.opciones.id]){
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
              return;
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

/*! 
 *
 *   +++++++++++++++++++++ kForm +++++++++++++++++++++ 
 *
 */

(function ($) {

    $.kForms = {
        instances : {}
    };
    
    // Collection method.
    $.fn.kForm = function (dato) {
        return this.each(function () {
            $.kForms.instances[this.id] = new KForm(this,dato);
        });
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
        this.solo_lectura = dato.soloLectura===undefined? false : dato.soloLectura;
        this.data_origen = dato.dataOrigen;
        this.after_save = dato.afterSave;
        
        this.cargar();
        
    };
    
    KForm.prototype = {

        nuevo_form : function(){
            var kForm = this;
            kForm.form = $('<form>').attr('id',kForm.div.id + '_form')
                    .addClass('kform form-horizontal')
                    .attr('action','#')
                    .prependTo(kForm.div);

            if(kForm.seleccionable){
                kForm.seleccionar(kForm.preseleccionados);
            }
        },

        nuevo_mensaje: function(tipo,mensaje){
            var kForm = this;

            if(kForm.mensaje){
                kForm.mensaje.remove();
            }

            kForm.mensaje = $('<div>')
                .attr('role','alert')
                .addClass('alert')
                .addClass(tipo? tipo : 'alert-info')
                .html(mensaje)
                .prependTo(kForm.div);

            $('<button>').attr('data-dismiss','alert')
                .addClass('close')
                .attr('type','button')
                .html('<i class="fa fa-times"></i>')
                .appendTo(kForm.mensaje);
            
        },
        
        cargar : function() {
            
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

            kForm.cargar_campos();
        },

        cargar_campos : function(){
            
            var kForm = this;
            var item = kForm.dato;

            kForm.fieldset = $('<fieldset>').appendTo(kForm.form);
            if(kForm.solo_lectura){
                kForm.fieldset.attr('disabled',true);
            }
            
            $.each(kForm.campos,function(c,campo){ 
                var formGroup = $('<div>').addClass('form-group')
                    .appendTo(kForm.fieldset);

                if(campo.titulo===undefined){
                    campo.titulo = campo.nombre;
                }

                /* 
                 * Lado izquierdo: Label 
                 */
                $('<label>').addClass('klabel col-md-3 control-label')
                    .html(campo.titulo)
                    .appendTo(formGroup);

                /* 
                 * En el centro: Input 
                 */
                var centro = $('<div>').addClass('col-md-6')
                    .appendTo(formGroup);

                /* 
                 * Lado derecho: Vacío de momento 
                 */
                $('<div>').addClass('col-md-3')
                    .appendTo(formGroup);

                $.kui.formulario.nuevo_elemento(kForm.solo_lectura,centro,item,campo);                         
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
                    .html('Guardar')
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

            $.kui.formulario.validar.reglas();

            var on_submit = typeof kForm.submit === 'function'?
                function(){
                    kForm.submit.call(this,kForm.contenido(),kForm.dato);
                } : function(){

                    var afterSave = typeof kForm.after_save === 'function'?
                        function(retorno){
                            kForm.after_save.call(this,retorno);
                        }:function(){};

                    $.ajax({
                        type: kForm.ajax_submit,
                        url: kForm.submit,
                        data: kForm.contenido(),
                        success: function(retorno){
                            if(retorno.mensaje){
                                kForm.nuevo_mensaje(retorno.tipoMensaje,retorno.mensaje);
                            }
                            afterSave(retorno);
                        },
                        async: false
                    });

                };

            $(kForm.form).validate({
                showErrors: function(errorMap, errorList) {
                    $.kui.formulario.validar.error(this, errorMap, errorList);
                },
                submitHandler: function(form) {
                    $.kui.formulario.validar.fecha(form);
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

            dato = $.extend({}, kForm.dato, dato);

            return dato;
        }
        
    };

}(jQuery));