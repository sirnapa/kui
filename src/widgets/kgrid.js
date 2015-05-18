/*
 *
 *   +++++++++++++++++++++ kGrid +++++++++++++++++++++ 
 *
 */

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
    		
        set_data: function(data){
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

            $.kui.formulario.validar.reglas();
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
        
        cargar : function() {
            
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
                        kGrid.totalDatos = retorno.respuesta.totalDatos;
                        kGrid.pagina = retorno.respuesta.pagina;
                        kGrid.totalPaginas = Math.ceil(kGrid.totalDatos/kGrid.data.rows);
                        
                        $.each(lista,function(i,item){
                            datos[item[kGrid.id]] = item;
                            kGrid.cargar_entrada(item);                          
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
                        $.kui.messages(kGrid.mensaje,kGrid.tbody,retorno.tipoMensaje,retorno.mensaje);
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
                    var primer_input = $('#'+pk).find('[data-rol="input"]:not([disabled],[readonly])').first();
                    if(primer_input.length){
                        primer_input.focus();
                    }else{
                        kGrid.nuevos++;
                        kGrid.cargar_entrada(item);
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

                    $.kui.formulario.nuevo_elemento(false,view,item,campo);

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
                        .attr('href',kGrid.enlace_dummy)
                        .html('<i class="fa ' + dimension + ' fa-'+icono+'"></i>')
                        .hover( function(){ $(this).removeClass('text-muted').addClass('text-'+hover);}, 
                                function(){ $(this).addClass('text-muted').removeClass('text-'+hover);});
                    return boton;
                };

            var habilitar_edicion = function(){
                    // Deshabilitamos ediciones anteriores
                    //kGrid.cargar();

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

                            $.kui.formulario.nuevo_elemento(false,formItem,item,campo);

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
                                    $.kui.formulario.validar.error(this, errorMap, errorList);
                                },
                                submitHandler: function(form) {
                                    $.kui.formulario.validar.fecha(form);
                                    var ready = $('#'+pk).data('ready');
                                    $('#'+pk).data('ready',++ready);
                                    return false;
                                }
                            });
                        });

                        $('#'+pk).data('formulario',true);               
                    }

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
                    row.addClass('has-error');
                    var btn_activar = crear_boton('reactivar','Reactivar','check','success');

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
                        .attr('id',$.kui.random_id())
                        .addClass('kui-dropdown')
                        .appendTo('body');

                    var ul_context = $('<ul>')
                        .attr('role','menu')
                        .addClass('dropdown-menu')
                        .appendTo(div_context);

                    var btn = crear_boton($.kui.random_id(),'Acciones','angle-down','primary');
                    
                    btn.attr('data-toggle','dropdown')
                        .attr('aria-haspopup',true)
                        .attr('aria-expanded',false)
                        .appendTo(botones);
                    
                    var div_dropdown = btn.parent()
                        .attr('id',$.kui.random_id())
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

                    var close_other_dropdown = function(){
                        var current = this.id;
                        $('.kui-dropdown.open').each(function(d,dropdown){
                            if(dropdown.id!==current){
                                $(dropdown).removeClass('open');
                            }
                        });
                    };

                    div_context.on('show.bs.context',close_other_dropdown);
                    div_dropdown.on('show.bs.dropdown',close_other_dropdown);
                }

                $.each(kGrid.botones,function(b,boton){
                    if(typeof boton.mostrar !== 'function' || boton.mostrar.call(this,item)){
                        var btn = crear_boton($.kui.random_id(),boton.comentario,boton.icono,'primary');

                        btn.attr('href', (boton.enlace!==undefined)? boton.enlace : kGrid.enlace_dummy);
                        
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
            kGrid.cargar_entrada(nuevo);
        }

    };
    
}(jQuery));