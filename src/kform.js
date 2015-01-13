/*
 * kForm
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

            }

            kForm.cargar_campos();
        },

        cargar_campos : function(){
            
            var kForm = this;
            var item = kForm.dato;

            var fieldset = $('<fieldset>').appendTo(kForm.form);
            if(kForm.solo_lectura){
                fieldset.attr('disabled',true);
            }
            
            $.each(kForm.campos,function(c,campo){ 
                var formGroup = $('<div>').addClass('form-group')
                    .appendTo(fieldset);

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
                            .appendTo(kForm.form)
                    );
            }else{
                kForm.boton_submit = $(kForm.boton_submit);
            }

            kForm.boton_submit.click(function(){
                kForm.form.submit();
            });

            $.kui.formulario.validar.reglas();

            var on_submit = typeof kForm.submit === 'function'?
                function(){
                    kForm.submit.call(this,kForm.contenido(),kForm.dato);
                } : function(){

                    $.ajax({
                        type: kForm.ajax_submit,
                        url: kForm.submit,
                        data: kForm.contenido(),
                        success: function(retorno){ 
                            if(retorno.mensaje){
                                kForm.nuevo_mensaje(retorno.tipoMensaje,retorno.mensaje);
                            }
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
            return kForm.form.serialize();
        }
        
    };

}(jQuery));