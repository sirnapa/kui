/*
 *
 *   +++++++++++++++++++++ List +++++++++++++++++++++ 
 *
 */

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