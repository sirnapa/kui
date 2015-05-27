/*
 *
 *   +++++++++++++++++++++ Form +++++++++++++++++++++ 
 *
 */

(function ($) {

    $.kui.instances.kform = {};

    // Collection method.
    $.fn.kForm = function (data) {
        return $(this).kui('form',data);
    };

    // Widget definition
    $.kui.widgets['form'] = function (data) {
        return $.kui.instances.kform[this.id] = new KForm(this,data);
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
        this.soloLectura = dato.soloLectura===undefined? false : dato.soloLectura;
        this.data_origen = dato.dataOrigen;
        this.after_submit = dato.afterSubmit;
        
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
            if(kForm.soloLectura){
                kForm.fieldset.attr('disabled',true);
            }
            
            $.each(kForm.campos,function(c,campo){ 
                var formGroup = $('<div>')
                    .addClass('form-group' + (campo.oculto? ' hidden' : ''))
                    .appendTo(kForm.fieldset);

                if(campo.titulo===undefined){
                    campo.titulo = campo.nombre;
                }

                /* 
                 * Lado izquierdo: Label 
                 */
                $('<label>').addClass('klabel col-sm-4 control-label')
                    .html(campo.titulo)
                    .appendTo(formGroup);

                /* 
                 * En el centro: Input 
                 */
                var centro = $('<div>').addClass('col-sm-8')
                    .appendTo(formGroup);

                $.kui.formulario.nuevo_elemento(kForm.soloLectura,centro,item,campo);                         
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

            var afterSubmit = typeof kForm.after_submit === 'function'?
                function(retorno){
                    kForm.after_submit.call(this,retorno);
                }:function(){};

            var on_submit = typeof kForm.submit === 'function'?
                function(){
                    afterSubmit(kForm.submit.call(this,kForm.contenido(),kForm.dato));
                } : function(){

                    $.ajax({
                        type: kForm.ajax_submit,
                        url: kForm.submit,
                        data: kForm.contenido(),
                        success: function(retorno){
                            if(retorno.mensaje){
                                $.kui.messages(kForm.mensaje,kForm.div,retorno.tipoMensaje,retorno.mensaje);
                            }
                            afterSubmit(retorno);
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

            return dato;
        }
        
    };

}(jQuery));