/*! kui - v0.0.1 - 2015-01-16
* https://github.com/konecta/kui
* Copyright (c) 2015 Nelson Paez; Licensed MIT */
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

                if(!kGrid.tarjetas && kGrid.permisos['guardar']){
                    item = {};
                }else{
                    window.console.error('Para agregar entradas vacías la grilla no debe ser tipo tarjeta y debe configurar el permiso "guardar"');
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
                                        
            var izquierda = $(kGrid.permisos['guardar']? '<form>' : '<div>')
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
                    }else if(kGrid.permisos['guardar']){

                        // Guardar cambios
                        var btn_guardar = crear_boton('guardar','Guardar','save','primary');
                        btn_guardar.hide();

                        var guardar_cambios = typeof kGrid.permisos['guardar'] === 'function'?
                            function(formulario){
                                kGrid.permisos['guardar'].call(this,formulario);
                            } : function(formulario){
                                $.ajax({
                                    type: 'POST',
                                    url: kGrid.permisos['guardar'],
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
                                $.each($('#'+pk+' form').serializeArray(), function(_, it) {
                                    item[it.name] = it.value;
                                });
                                guardar_cambios(item);

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
                        .html('<i class="fa ' + dimension + ' ' + boton.icono+'"></i>')
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