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

            var source = $.kui.data.source({
              source: kCard.source,
              sourceAjax: kCard.ajax,
              sourceData: kCard.data,
              key: 'respuesta',
              message: kCard.mensaje,
              target: kCard.contenido
            });

            if (source) {
                var lista = source.datos;
                var datos = {};

                kCard.totalDatos = parseInt(source.totalDatos);
                kCard.pagina = parseInt(source.pagina);
                kCard.totalPaginas = Math.ceil(kCard.totalDatos/kCard.data.rows);

                kCard.grilla = $('<div>').addClass('kCard').prependTo(kCard.contenido);

                $.each(lista,function(i,item){
                    datos[item[kCard.id]] = item;
                    kCard.load_entrada(item);
                });

                kCard.grilla.find('.kscore').each(function(s,score){
                    var lado = 124;
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

            }

            if(typeof kCard.loadComplete === 'function'){
                kCard.loadComplete.call(this,source);
            }
        },

        load_entrada: function(item){

            var kCard = this;
            var nueva_entrada = item===undefined;
            var pk = 'kCard_' + kCard.div.id + '_' +
                (nueva_entrada? ('nuevo_'+kCard.nuevos) : item[kCard.id]);

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

            var izquierda = $('<div>')
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

            if(activo){

                if(kCard.permisos['editar']){
                    var btn_editar = crear_boton('editar',$.kui.i18n.editMsg,'pencil','primary');

                    if(typeof kCard.permisos['editar'] === 'function'){
                        btn_editar.click(function(e){
                            e.stopPropagation();
                            kCard.permisos['editar'].call(this,item);
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
