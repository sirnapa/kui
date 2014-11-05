/* 
    KGrid
    Autor: Napa,
    Versión: 2.0
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
                            instancia.setData(aux);
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
                        if(!instancia.jqGrid){
                            instancia.setData({pagina:pagina});
                        }else{
                            instancia.setData({page:pagina});
                        }
                        instancia.cargar();
                        break;
                    case 'buscar':  // Por el momento sólo es valido para jqGrid=true
                        // aux es la clave de búsqueda
                        if(!instancia.jqGrid || aux==undefined){
                            return;
                        }
                        // aux debe tener el siguiente formato
                        // {
                        //     data: 'clave de busqueda global (requerido)',
                        //     reglas: [
                        //              field: 'nombre del campo (requerido)',
                        //              data: 'opcional, por defecto toma el valor de aux.data',
                        //              op: 'opcional, por defecto cn'
                        //          ]
                        //     groupOp: 'opcional, por defecto es AND'
                        // }
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
                        instancia.setData({
                            _search: true,
                            filters: JSON.stringify({
                                "groupOp":groupOp,
                                "rules": reglas
                                })
                        });
                        instancia.cargar();
                        break;
                    case 'info':
                        console.log(instancia);
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
        
        var data_final = {};
        
        if(dato.jqGrid){
            data_final = {
                _search:false,
                filters:null,
                page:1,
                rows:5,
                sidx:dato.id,
                sord:'asc', 
                todos:false
            };
        }else{
            data_final = {
                pagina:1
            }
        }  

        $.each(dato.data,function(key,value){
            data_final[key] = value;
        });

        var permisos_finales = {
            editar:null,
            activar:null,
            remover:null
        };

        $.each(dato.permisos,function(key,value){
            permisos_finales[key] = value;
        });
                
        var retorno_final = {
            lista: 'lista',                    
            pagina: 'pagina',
            totalPaginas: 'totalPaginas',
            totalDatos: 'totalDatos'
        }
        
        $.each(dato.retorno,function(key,value){
            retorno_final[key] = value;
        });        
                
        this.div = div;
        this.url = dato.url;
        this.data = data_final;
        this.id = dato.id;
        this.tarjetas = dato.tarjetas;
        this.campos = dato.campos;
        this.ajax = dato.ajax;
        this.jqGrid = dato.jqGrid;
        this.permisos = permisos_finales;
        this.botones = dato.botones;
        this.estado = dato.estado;
        this.retorno = retorno_final;
        this.loadComplete = dato.loadComplete;
        this.paginador = dato.paginador;
        this.onclick = dato.onclick;
        this.ondblclick = dato.ondblclick;
        this.seleccionable = dato.seleccionable;

        this.cargarPaginador();
        this.titulos();
        this.cargar();
        
        $(div).on('reloadGrid',function(){
            $.kGrids.instances[this.id].cargar();
        });
        
    };
    
    KGrid.prototype = {
    		
        setData: function(data){
            var kGrid = this;
            $.each(data,function(key,value){
                kGrid.data[key] = value;
            });            
        },

        nuevaGrilla : function(){
            var kGrid = this;
            kGrid.grilla = $('<div>').attr('id',kGrid.div.id + '_grilla')
                    .prependTo(kGrid.div);

            if(kGrid.seleccionable){
                $(kGrid.div).data('seleccionados',[]);
            }
        },

        titulos: function(){
            var kGrid = this;

            if(kGrid.tarjetas){
                return;
            }

            var pk = kGrid.div.id + '_titulo';
            var formGroup = $('<div>').attr('id',pk)
                .addClass('form-group');

            kGrid.nuevaGrilla();
                                                                            
            $.each(kGrid.campos,function(c,campo){                       
                var label = $('<h4>').html(
                        $('<i>').addClass('fa fa-fw fa-arrow-down text-muted')
                    );
                if(campo.titulo!=undefined){
                    label.append(campo.titulo);
                }else{
                    label.append(campo.nombre);
                }

                if(!campo.ancho){
                    campo.ancho = parseInt(12/kGrid.campos.length);
                }

                $('<div class="col-md-'+campo.ancho+'">').html(label).appendTo(formGroup);
            });                            
                        
            $('<div>').addClass('row')
                .html(
                    $('<div>').addClass('form-horizontal col-md-11')
                        .html(formGroup)
                )
                .prependTo(kGrid.div);
        },
        
        cargar : function() {
            
            var kGrid = this;
            if(kGrid.grilla){
                kGrid.grilla.empty();
            }else{
                kGrid.nuevaGrilla();
            }
            
            $.ajax({
                type: kGrid.ajax,
                url: kGrid.url,
                data: kGrid.data,
                success: function(retorno){                                     
                    if (!retorno.error) {
                        var grilla = $('<div>').addClass('kGrid form-horizontal');
                        var lista;
                        
                        if(!kGrid.jqGrid){
                            kGrid.pagina = retorno[kGrid.retorno.pagina];
                            kGrid.totalPaginas = retorno[kGrid.retorno.totalPaginas];
                            kGrid.totalDatos = retorno[kGrid.retorno.totalDatos];
                            lista = retorno[kGrid.retorno.lista];
                        }else{
                            kGrid.pagina = retorno.respuesta.pagina;
                            kGrid.totalPaginas = retorno.respuesta.totalPaginas;
                            kGrid.totalDatos = retorno.respuesta.totalDatos;
                            lista = retorno.respuesta.datos;
                        }

                        var setearValor = kGrid.tarjetas? function(columna,valor){
                                columna.html(valor);
                            } : function(columna,valor){
                                columna.val(valor);
                            };
                        
                        $.each(lista,function(i,item){
                            var pk = 'kGrid_' + kGrid.div.id + '_' + item[kGrid.id];
                            
                            var row = $('<div>').attr('id',pk)
                                .attr('data-pk',item[kGrid.id])
                                .addClass('form-group kGrid' 
                                    + (kGrid.tarjetas? ' well' : ''));
                            
                            if(kGrid.onclick){
                                var onclick = typeof kGrid.onclick == 'function'?
                                    kGrid.onclick : function(){
                                       window.open(kGrid.onclick,'_self');
                                    };
                                row.addClass('kbtn')
                                    .css('cursor','pointer')
                                    .click(function(){
                                       onclick.call(this,item);
                                    });
                            }else if(kGrid.ondblclick){
                                var ondblclick = typeof kGrid.ondblclick == 'function'?
                                    kGrid.ondblclick : function(){
                                    	// TODO edicion inline
                                        kGrid.permisos['editar'].call(this,item);
                                    };
                                row.dblclick(function(){
                                	ondblclick.call(this,item);
                                });
                            }

                            var activo = false;
                            if(typeof kGrid.estado == 'function'){
                                activo = kGrid.estado.call(this,item);
                            }
                                                        
                            var izquierda = $('<div>').addClass('col-md-' 
                                + (kGrid.tarjetas? '7' : '11'))
                                .appendTo(row);
                            var derecha = $('<div>').addClass('text-right col-md-'
                                + (kGrid.tarjetas? '5' : '1'))
                                .appendTo(row);
                            var botones = $('<div>').addClass('pull-right')
                                .addClass('acciones')
                                .appendTo(derecha);
                            var scores = $('<div>').addClass('pull-right')
                                .appendTo(derecha);

                            if(kGrid.seleccionable){
                                // Agregar campo de selección al principio;
                                
                            }
                                            
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
                                    columna = $('<p>').css('margin-top','25%')
                                        .appendTo(
                                            $('<div>')
                                                .addClass('text-center pull-left score')
                                                .css('width',0)
                                                .css('height',0)
                                                .appendTo(scores)
                                        );
                                }

                                var input = kGrid.tarjetas? columna : 
                                    $('<input>').addClass('form-control')
                                        .attr('readonly',true)
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
                                    if(!kGrid.tarjetas && campo.atributos['type']=='checkbox'){
                                        if(input.val()=='true') {
                                            input.attr('checked','checked');
                                        }
                                        input.attr('disabled','disabled');
                                        input.removeClass('form-control');
                                        input.parent().addClass('text-center');
                                    }
                                    $.each(campo.atributos,function(atributo,valor){
                                        input.attr(atributo,valor);
                                    });
                                }                              
                            });                            
                                                            
                            var dimension = kGrid.tarjetas? 'fa-3x' : 'fa-lg';

                            if(activo){  
                                if(typeof kGrid.permisos['editar'] == 'function'){
                                    $('<a>').addClass('text-muted')
                                        .css('margin-left','15px')
                                        .attr('title','Editar')
                                        .attr('href','JavaScript:void(0);')
                                        .html('<i class="fa ' + dimension + ' fa-pencil"></i>')
                                        .hover( function(){ $(this).removeClass('text-muted').addClass('text-primary')}, 
                                                function(){ $(this).addClass('text-muted').removeClass('text-primary')})
                                        .click(function(e){
                                            e.stopPropagation();
                                            kGrid.permisos['editar'].call(this,item);
                                        }).appendTo(botones);
                                }
                                if(typeof kGrid.permisos['remover'] == 'function'){
                                    $('<a>').addClass('text-muted')
                                        .css('margin-left','15px')
                                        .attr('title','Remover')
                                        .attr('href','JavaScript:void(0);')
                                        .html('<i class="fa ' + dimension + ' fa-times"></i>')
                                        .hover( function(){ $(this).removeClass('text-muted').addClass('text-danger') }, 
                                                function(){ $(this).addClass('text-muted').removeClass('text-danger')})
                                        .click(function(e){
                                            e.stopPropagation();
                                            kGrid.permisos['remover'].call(this,item);
                                        }).appendTo(botones);
                                }
                                
                            } else{                                    
                                if(typeof kGrid.permisos['activar'] == 'function'){
                                    row.addClass('has-error');
                                    $('<a>').addClass('text-muted')
                                        .css('margin-left','15px')
                                        .attr('title','Reactivar')
                                        .attr('href','JavaScript:void(0);')
                                        .html('<i class="fa ' + dimension + ' fa-check"></i>')
                                        .hover( function(){ $(this).removeClass('text-muted').addClass('text-success') }, 
                                                function(){ $(this).addClass('text-muted').removeClass('text-success')})
                                        .click(function(e){
                                            e.stopPropagation();
                                            kGrid.permisos['activar'].call(this,item);
                                        }).appendTo(botones);
                                }
                            }
                            
                            $.each(kGrid.botones,function(b,boton){
                                if(typeof boton.mostrar != 'function' || boton.mostrar.call(this,item)){
                                    var btn = $('<a>').attr('title',boton.comentario)
                                        .addClass('text-muted')
                                        .css('margin-left','15px')
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
                            
                            row.appendTo(grilla); 
                            
                        });

                        grilla.prependTo(kGrid.grilla);
                        
                        var lado = 0;
                        grilla.find('.score').each(function(s,score){
                            if(s==0){
                                lado = $(score).parent().parent().parent().height();
                            }
                            $(score).css('width',lado);
                            $(score).css('height',lado);
                        });
                        
                        grilla.find('.acciones').each(function(a,accion){
                            var top = ($(accion).parent().parent().height() 
                                - $(accion).height())/2
                            if(top > 0){
                                $(accion).css('padding-top',top);
                            }
                        });
                        
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
            
                    if(typeof kGrid.loadComplete == 'function'){
                        kGrid.loadComplete.call(this,retorno);
                    }
                },
                async: false
            });
        },
        
        cargarPaginador : function(){
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
                
          var centro = $('<div>').addClass('btn btn-default')
                .css('overflow','hidden')
                .css('padding-top','2px')
                .css('height',$('#'+pk+'pagina_anterior').outerHeight())
                .appendTo(contenedor);
                
          $('<label>').html('Página ').appendTo(centro);
          $('<input>').attr('id',pk+'pagina')
            .attr('type','text')
            .addClass('pagina')
            .css('width',$('#'+pk+'pagina_anterior').outerWidth())
            .css('margin','0 5px')
            .css('text-align','center')
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

        seleccionar: function(seleccionados){
            var kGrid = this;
            return $(kGrid.div).data('seleccionados',seleccionados);
        }
    };
})();

