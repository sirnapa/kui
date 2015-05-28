/*
 *
 *   +++++++++++++++++++++ Cards +++++++++++++++++++++ 
 *
 */

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
    		
        set_data: function(data){
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

            if(kCard.seleccionable){
                kCard.seleccionar(kCard.preseleccionados);
            }
        },

        titulos: function(){
        	return;
        },
        
        cargar : function() {
            
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
                            kCard.cargar_entrada(item);                          
                        });

                        $(kCard.grilla).find('.' + kCard.div.id + '_seleccionar_row')
                            .each(function(i,item){
                                if(kCard.seleccionados[$(item).data('pk')]){
                                    $(item).attr('checked','checked');
                                }
                                $(item).change(function(){
                                    kCard.cambiar_seleccion($(item).data('pk'),$(item).is(':checked'));
                                });
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

                        $(kCard.div).data('datos',datos);
                        $(kCard.div).data('totalDatos',kCard.totalDatos);
                        $(kCard.div).data('pagina',kCard.pagina);
                        $(kCard.div).data('totalPaginas',kCard.totalPaginas);
                                                
                        $.kui.list.refrescar_paginador(kCard);
                        
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

        cargar_entrada: function(item){

            var kCard = this;
            var nueva_entrada = item===undefined;
            var pk = 'kCard_' + kCard.div.id + '_' + 
                (nueva_entrada? ('nuevo_'+kCard.nuevos) : item[kCard.id]);
            var guardar = (nueva_entrada && kCard.permisos[$.kui.i18n.inputs.add])?
                kCard.permisos[$.kui.i18n.inputs.add] : kCard.permisos['guardar'];

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
                    //kCard.cargar();

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
                    var original = $(kCard.div).data('datos')[$('#'+pk).attr('data-pk')];
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
                    var btn_editar = crear_boton('editar','Editar','pencil','primary');

                    if(typeof kCard.permisos['editar'] === 'function'){
                        btn_editar.click(function(e){
                            e.stopPropagation();
                            kCard.permisos['editar'].call(this,item);
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
                                        kCard.cargar();
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
                    var btn_remover = crear_boton('remover','Remover','times','danger');

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
                    var btn_activar = crear_boton('reactivar','Reactivar','check','success');

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
        
        cambiar_seleccion: function(codigo,estado){
            var kCard = this;
            kCard.seleccionados[codigo] = estado;
            kCard.refrescar_seleccionados();
        },

        seleccionar: function(seleccionados){
            var kCard = this;
            kCard.seleccionados = {};
            $.each(seleccionados,function(s,seleccionado){
                kCard.seleccionados[seleccionado] = true;
            });

            $('.' + kCard.div.id + '_seleccionar_row').each(function(i,item){
                $(item).removeAttr('checked');
                if(kCard.seleccionados[$(item).data('pk')]){
                    $(item).prop('checked',true);
                }
            });

            kCard.refrescar_seleccionados();
        },

        refrescar_seleccionados: function(){
            var kCard = this;
            var seleccionados = [];
            $.each(kCard.seleccionados,function(codigo,estado){
                if(estado){
                    seleccionados.push(codigo);
                }
            });
            $(kCard.div).data('seleccionados',seleccionados);

            var seleccionados_pagina_actual = $(kCard.div)
                .find('.' + kCard.div.id + '_seleccionar_row:checked').length;

            kCard.checkall.prop('checked',
                seleccionados_pagina_actual>0 &&
                ($(kCard.div).find('.' + kCard.div.id + '_seleccionar_row').length ===
                seleccionados_pagina_actual));
        },

        agregar: function(nuevo){
            var kCard = this;
            kCard.cargar_entrada(nuevo);
        }

    };
    
}(jQuery));