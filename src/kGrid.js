/* 
    KGrid
    Autor: Nelson Páez,
    Mail: nelpa90@gmail.com,
    Web: www.konecta.com.py
    Versión: 2.1.7
*/
(function () {
    $.kGrids = {
        instances : {}
    };
    
    $.fn.kGrid = function (dato,aux) {
        return this.each(function () {
            if(typeof dato == 'string'){
                var instancia = $.kGrids.instances[this.id];
                if( instancia ==undefined || instancia == null){
                    return;
                }
                switch(dato) {
                    case 'recargar':
                        // aux sirve para sobre-escribir el data
                        if(aux!=undefined){
                            instancia.set_data(aux);
                        }
                        instancia.cargar();
                        break;
                    case 'pagina':
                        // aux recibe la pagina de destino, tambien puede recibir
                        // estas opciones: primera, anterior, siguiente, ultima
                        if(aux==undefined){
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
                        if(aux==undefined){
                            return;
                        }
                        
                        var groupOp = 'AND'
                        if(aux.groupOp!=undefined){
                            groupOp=aux.groupOp;
                        }
                        var reglas = [];
                        $.each(aux.reglas,function(c,campo){
                            reglas.push({
                                'field': campo.field,
                                'data': (campo.data!=undefined)? campo.data : aux.data,
                                'op': (campo.op!=undefined)? campo.op : 'cn'
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

        if( dato.url==undefined
            || dato.id==undefined
            || dato.campos==undefined){
            console.error('Los campos id, url y campos son obligatorios.');
            return;
        }
        
        /*
         * Se procesan los campos opcionales
         */
        
        if(dato.ajax==undefined){
            dato.ajax = 'GET';
        }

        if(dato.data==undefined){
            dato.data = {};
        }

        if(dato.titulos==undefined){
            dato.titulos = true;
        }
        
        if(dato.permisos==undefined){
            dato.permisos = {};
        }
        
        if(dato.retorno==undefined){
            dato.retorno = {};
        }
        
        if(dato.botones==undefined){
            dato.botones = [];
        }
        
        if(dato.paginador==undefined){
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
                ancho: 1,
                atributos: {
                    'type':'checkbox',
                    'readonly': 'false',
                    'disabled': 'false',
                    'class': div.id + '_seleccionar_row'
                }
            }
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
            kGrid.grilla = $('<div>').attr('id',kGrid.div.id + '_grilla')
                    .prependTo(kGrid.div);

            if(kGrid.seleccionable){
                kGrid.seleccionar(kGrid.preseleccionados);
            }
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
                if(campo.titulo!=undefined){
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

                if(kGrid.seleccionable && c==0){
                    titulo.addClass('text-center');
                    var checkall = $('<input>').attr('id',kGrid.div.id+'_seleccionar_todo')
                        .attr('type','checkbox')
                        .change(function(){
                            var todos = $(this).is(':checked');
                            $('.' + kGrid.div.id + '_seleccionar_row').each(function(i,item){
                                $(item).removeAttr('checked');
                                if(todos){
                                    $(item).click();
                                }
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
            if(kGrid.grilla){
                kGrid.grilla.empty();
            }else{
                kGrid.nueva_grilla();
            }
            
            $.ajax({
                type: kGrid.ajax,
                url: kGrid.url,
                data: kGrid.data,
                success: function(retorno){                                    
                    if (!retorno.error) {
                        var grilla = $('<div>').addClass('kGrid');
                        var lista = retorno.respuesta.datos;
                        var datos = {};

                        kGrid.totalDatos = retorno.respuesta.totalDatos;
                        kGrid.pagina = retorno.respuesta.pagina;
                        kGrid.totalPaginas = Math.ceil(kGrid.totalDatos/kGrid.data.rows);

                        var setearValor = kGrid.tarjetas? function(columna,valor){
                                columna.html(valor);
                            } : function(columna,valor){
                                columna.val(valor);
                            };
                        
                        $.each(lista,function(i,item){
                            var pk = 'kGrid_' + kGrid.div.id + '_' + item[kGrid.id];
                            datos[item[kGrid.id]] = item;
                            
                            var formGroup = $('<div>').attr('id',pk)
                                .attr('data-pk',item[kGrid.id])
                                .addClass('form-group' 
                                    + (kGrid.tarjetas? ' well' : ''));

                            var activo = false;
                            if(typeof kGrid.estado == 'function'){
                                activo = kGrid.estado.call(this,item);
                            }
                            
                            if(kGrid.onclick){
                                var onclick = typeof kGrid.onclick == 'function'?
                                    kGrid.onclick : function(){
                                       window.open(kGrid.onclick,'_self');
                                    };
                                formGroup.addClass('kbtn')
                                    .click(function(){
                                       onclick.call(this,item);
                                    });
                            }else if(kGrid.ondblclick){
                                if( (typeof kGrid.ondblclick == 'function') || 
                                    (activo && typeof kGrid.permisos['editar'] == 'function')){
                                    var ondblclick = typeof kGrid.ondblclick == 'function'?
                                        kGrid.ondblclick : function(){
                                            kGrid.permisos['editar'].call(this,item);
                                        };
                                    formGroup.dblclick(function(){
                                        ondblclick.call(this,item);
                                    });
                                }
                            }
                                                        
                            var izquierda = $('<div>').addClass('col-md-' 
                                + (kGrid.tarjetas? '7' : '11'))
                                .appendTo(formGroup);
                            var derecha = $('<div>').addClass('text-right col-md-'
                                + (kGrid.tarjetas? '5' : '1'))
                                .appendTo(formGroup);
                            var botones = $('<div>').addClass('pull-right')
                                .addClass('kacciones')
                                .appendTo(derecha);
                            var scores = $('<div>').addClass('kscores pull-right')
                                .appendTo(derecha);
                                            
                            $.each(kGrid.campos,function(c,campo){ 
                                var columna;

                                if(campo.tipo!='score'){
                                    var ancho_columna = campo.ancho;
                                    var contenedor = '<div>';

                                    if(kGrid.tarjetas){
                                        ancho_columna = 6;
                                        contenedor = '<p>';
                                        if(campo.tipo=='destacado' 
                                            || campo.tipo=='encabezado'){
                                            ancho_columna = 12;
                                        }
                                        if(campo.tipo=='encabezado'){
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
                                    var label = $('<label>').addClass('klabel')
                                        .addClass('visible-xs visible-sm')
                                        .html(kGrid.etiquetas[c])
                                        .appendTo(columna);
                                }

                                var input = kGrid.tarjetas? columna : 
                                    $('<input>').addClass('form-control')
                                        .attr('readonly',true)
                                        .attr('name',campo.nombre)
                                        .appendTo(columna);

                                setearValor(input,
                                    typeof campo.formato == 'function'? 
                                        campo.formato.call(this,item[campo.nombre],item)
                                    :  item[campo.nombre]);
                                    
                                if(kGrid.tarjetas && campo.titulo && campo.titulo!=''){
                                    if(campo.tipo!='score'){
                                        $('<label>').addClass('text-muted')
                                            .html(campo.titulo + '&nbsp; &nbsp;')
                                            .prependTo(columna);
                                    }else{
                                        $('<br>').appendTo(columna);
                                        $('<small>').html(campo.titulo)
                                            .appendTo(columna);
                                    }
                                }                       
	                            
                                if(campo.atributos!=undefined){
                                    $.each(campo.atributos,function(atributo,valor){
                                        input.attr(atributo,valor);
                                    });

                                    input.attr('data-disabled',$(input).is(':disabled'));
                                    
                                    var campos_especiales = ['disabled','readonly'];
                                    $.each(campos_especiales,function(e,especial){
                                        if(campo.atributos[especial]=='false'){
                                            input.removeAttr(especial);
                                        }
                                    });

                                    if(!kGrid.tarjetas && campo.atributos['type']=='checkbox'){
                                        if(input.val()=='true') {
                                            input.attr('checked','checked');
                                        }

                                        input.removeClass('form-control')
                                            .attr('data-pk',item[kGrid.id])
                                            .dblclick(function(e){
                                                e.stopPropagation();
                                            });

                                        if(input.attr('readonly')){
                                            input.attr('disabled','disabled');
                                        }
                                        
                                        input.parent().addClass('text-center');
                                    }
                                }                              
                            });                            
                                                            
                            var dimension = kGrid.tarjetas? 'fa-3x' : 'fa-lg';

                            var crear_boton = function(titulo,icono,hover){
                                    var boton = $('<a>').addClass('text-muted kaccion')
                                        .attr('title',titulo)
                                        .attr('href','JavaScript:void(0);')
                                        .html('<i class="fa ' + dimension + ' fa-'+icono+'"></i>')
                                        .hover( function(){ $(this).removeClass('text-muted').addClass('text-'+hover)}, 
                                                function(){ $(this).addClass('text-muted').removeClass('text-'+hover)});
                                    return boton;
                                }

                            if(activo){  
                                if(kGrid.permisos['editar']){
                                    var btn_editar = crear_boton('Editar','pencil','primary');

                                    if(typeof kGrid.permisos['editar'] == 'function'){
                                        btn_editar.click(function(e){
                                            e.stopPropagation();
                                            kGrid.permisos['editar'].call(this,item);
                                        });
                                    }else if(kGrid.permisos['guardar']){

                                        var btn_guardar = crear_boton('Guardar','save','primary');
                                        btn_guardar.hide();

                                        var on_guardar = typeof kGrid.permisos['guardar'] == 'function'?
                                            function(formulario){
                                                kGrid.permisos['guardar'].call(this,formulario);
                                            } : function(formulario){
                                                $.ajax({
                                                    type: 'POST',
                                                    url: kGrid.permisos['guardar'],
                                                    data: formulario,
                                                    success: function(retorno){  
                                                        kGrid.cargar();
                                                    }
                                                });
                                            }

                                        btn_guardar.click(function(e){
                                            e.stopPropagation();
                                            var cambios = {};

                                            // Deshabilitar edición
                                            $('#'+pk).find('input[data-editando]').each(function(x,input){
                                                $(input).attr('readonly',true).removeAttr('data-editando');
                                                if($(input).attr('type')=='checkbox'){
                                                    $(input).attr('disabled',true);
                                                    cambios[$(input).attr('name')] = $(input).is(':checked');
                                                }else{
                                                    cambios[$(input).attr('name')] = $(input).val();
                                                }
                                            });

                                            // Cambio de botones
                                            btn_guardar.hide();
                                            btn_editar.fadeIn();
                                            on_guardar($.extend(item,cambios));
                                        }).appendTo(botones);

                                        btn_editar.click(function(e){
                                            e.stopPropagation();
                                            
                                            // Habilitar edición inline
                                             $('#'+pk).find('input[readonly]').each(function(x,input){
                                                if($(input).attr('data-disabled')!='true'){
                                                    $(input).removeAttr('readonly')
                                                        .removeAttr('disabled')
                                                        .attr('data-editando',true);
                                                }
                                            });

                                            // Cambio de botones        
                                            btn_editar.hide();
                                            btn_guardar.fadeIn();
                                        });
                                    }

                                    btn_editar.appendTo(botones);
                                }
                                if(kGrid.permisos['remover']){
                                    var btn_remover = crear_boton('Remover','times','danger');

                                    if(typeof kGrid.permisos['remover'] == 'function'){
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
                                if(typeof kGrid.permisos['activar'] == 'function'){
                                    formGroup.addClass('has-error');
                                    var btn_activar = crear_boton('Reactivar','check','success');

                                    btn_activar.click(function(e){
                                            e.stopPropagation();
                                            kGrid.permisos['activar'].call(this,item);
                                        }).appendTo(botones);
                                }
                            }
                            
                            $.each(kGrid.botones,function(b,boton){
                                if(typeof boton.mostrar != 'function' || boton.mostrar.call(this,item)){
                                    var btn = $('<a>').attr('title',boton.comentario)
                                        .addClass('text-muted kaccion')
                                        .attr('href', (boton.enlace!=undefined)? boton.enlace : 'Javascript:void(0);')
                                        .html('<i class="fa ' + dimension + ' ' + boton.icono+'"></i>')
                                        .hover( function(){ $(this).removeClass('text-muted') }, 
                                            function(){ $(this).addClass('text-muted')});
                                    
                                    if(boton.onclick!=undefined){
                                        btn.click(function(e){
                                            e.stopPropagation();
                                            boton.onclick.call(this,item);
                                        });
                                    }
                                    
                                    if(boton.atributos!=undefined){
                                        $.each(boton.atributos,function(atributo,valor){
                                            btn.attr(atributo,valor);
                                        });
                                    }    	                            
                                    btn.appendTo(botones);
                                }	
                            });

                            formGroup.appendTo(grilla);

                            if(!kGrid.tarjetas){
                                formGroup.after($('<hr>').addClass('visible-xs visible-sm'));
                            }                            
                        });

                        grilla.prependTo(kGrid.grilla);

                        $(grilla).find('.' + kGrid.div.id + '_seleccionar_row')
                            .each(function(i,item){
                                if(kGrid.seleccionados[$(item).data('pk')]){
                                    $(item).attr('checked','checked');
                                }
                                $(item).change(function(){
                                    kGrid.cambiar_seleccion($(item).data('pk'),$(item).is(':checked'));
                                });
                            });

                        if(kGrid.tarjetas){
                            grilla.find('.kscore').each(function(s,score){
                                var lado = parseInt($(score).parent().parent().parent().height()) * 0.8;
                                $(score).css('width',lado);
                                $(score).css('height',lado);
                            });
                            
                            grilla.find('.kacciones,.kscores').each(function(e,elemento){
                                var top = $(elemento).parent().parent().height() 
                                    - $(elemento).height();
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
                            .attr('disabled',kGrid.pagina==1);
                        $('#kGrid_' + kGrid.div.id + '_pagina_anterior')
                            .attr('disabled',kGrid.pagina==1);
                        $('#kGrid_' + kGrid.div.id + '_ultima_pagina')
                            .attr('disabled',kGrid.pagina==kGrid.totalPaginas);
                        $('#kGrid_' + kGrid.div.id + '_siguiente_pagina')
                            .attr('disabled',kGrid.pagina==kGrid.totalPaginas);
                        
                    }
            
                    if(typeof kGrid.load_complete == 'function'){
                        kGrid.load_complete.call(this,retorno);
                    }
                },
                async: false
            });
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
                if(e.keyCode == 13){
                    e.preventDefault();
                    var pagina = parseInt($('#'+pk+'pagina').val());
                    if(isNaN(pagina) || pagina<0 
                        || pagina > kGrid.totalPaginas){
                        $('#'+pk+'pagina').val($('#'+pk+'pagina').data('pagina'));
                        return;
                    }
                    if(pagina!=$('#'+pk+'pagina').data('pagina')){
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
                }

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
                    $(item).click();
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
        }
    };
})();

