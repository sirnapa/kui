/*
 *
 *   +++++++++++++++++++++ List +++++++++++++++++++++
 *
 */

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
            finalParams[$.kui.i18n.data] = {
							_search:false,
							filters:null,
							page:1,
							rows:o.rows,
							sidx:o.params.id,
							sord:'asc',
							todos:false
						};

            var finalPass = {};
            finalPass[$.kui.i18n.add] = null;
            finalPass[$.kui.i18n.edit] = null;
            finalPass[$.kui.i18n.save] =  null;
            finalPass[$.kui.i18n.activate] = null;
            finalPass[$.kui.i18n.remove] = null;
            finalParams[$.kui.i18n.pass] = finalPass;

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

            $.extend(true,finalParams,o.params);

            $.extend(o.list,{
                div : o.div,
                source : finalParams[$.kui.i18n.source],
                data : finalParams[$.kui.i18n.data],
                id : finalParams[$.kui.i18n.id],
                showTitles : finalParams[$.kui.i18n.titles],
                campos : finalParams[$.kui.i18n.fields],
                ajax : finalParams[$.kui.i18n.ajax],
                permisos : finalParams[$.kui.i18n.pass],
                botones : finalParams[$.kui.i18n.buttons],
                estado : finalParams[$.kui.i18n.state],
                //retorno : finalParams[$.kui.i18n.sourceFormat],
                loadComplete : finalParams[$.kui.i18n.loadComplete],
                pager : finalParams[$.kui.i18n.pager],
                onclick : finalParams[$.kui.i18n.onclick],
                ondblclick : finalParams[$.kui.i18n.ondblclick],
                seleccionable : finalParams[$.kui.i18n.selectable],
                seleccionados : {},
                preseleccionados : finalParams[$.kui.i18n.selected],
                nuevos : 0
            });

            $.kui.list.load_estilos();
            $.kui.list.loadPager(o.list);
            o.list.titulos();
            o.list.load();

            $(o.div).on('reloadGrid',function(){
                $.kui.instances.kgrid[o.list.id].load();
            });

        },

        loadPager : function(list){
            if(!$(list.pager).length){
                return;
            }
            var pk = 'kui_' + list.div.id + '_';
            var contenedor = $('<div>').attr('id',pk+$.kui.i18n.pager)
                .addClass('kui-pager btn-group')
                .appendTo(list.pager);

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
