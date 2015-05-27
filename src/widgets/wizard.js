/*
 *
 *   +++++++++++++++++++++ Cards +++++++++++++++++++++ 
 *
 */

(function ($) {

    // Instances
    $.kui.instances.wizard = {};
    
    // Widget definition.
    $.kui.widgets.wizard = function (data) {
        return $.kui.instances.wizard[this.id] = new KWizard(this,data);
    };
    
    var KWizard = function(div,params){
    	// Revisión de parámetros
        
        if( params.pasos===undefined){
            window.console.error('Los parámetros "pasos" y "" son obligatorios.');
            return;
        }

        // Merge params into this
        $.extend(this,params);

        this.div = div;
        this.cargar();
    };
    
    KWizard.prototype = {
    		        
        cargar : function() {
            
            var kWizard = this;
            var wizard = $(kWizard.div);

            wizard.hide()
                .attr('data-wizard',true)
                .attr('data-step','0');

            if(typeof kWizard.pasos === 'string'){
                wizard.find(kWizard.pasos).each(function(p,paso){
                    $(paso).hide()
                        .attr('data-wizard-step',true)
                        .attr('data-step',p+1);
                });

                wizard.find(kWizard.indices).each(function(p,paso){
                    $(paso).removeClass('active')
                        .attr('data-wizard-index',true)
                        .attr('data-index',p+1);
                });
            }else{
                //TODO construir pasos
            }

            kWizard.control = {};

            kWizard.control.prev = kWizard.anterior? 
                $(kWizard.anterior) : 
                $('<button>').addClass('btn btn-default')
                    .appendTo(wizard);

            kWizard.control.next = kWizard.siguiente? 
                $(kWizard.siguiente) : 
                $('<button>').addClass('btn btn-primary')
                    .appendTo(wizard);

            kWizard.control.prev.click(function(){
                var step = parseInt(wizard.attr('data-step'));
                kWizard.mostrarPaso(step-1);
            });

            kWizard.control.next.click(function(){
                var step = parseInt(wizard.attr('data-step'));
                if(kWizard.validar(step)){
                    kWizard.mostrarPaso(step+1);
                }
            });
            
            if(typeof kWizard.loadComplete === 'function'){
                kWizard.loadComplete.call(this);
            }

            kWizard.mostrarPaso(1);
            wizard.fadeIn();
            
        },

        validar: function(step){

            var kWizard = this;
            var success = true;
            var currentStep = $(kWizard.div).find('[data-wizard-step][data-step="'+step+'"]');

            if(typeof kWizard.validacion === 'function'){
                success = kWizard.validacion.call(this,currentStep);
            }

            return success;
        },

        mostrarPaso: function(step){
            
            var kWizard = this;
            var wizard = $(kWizard.div);
            var currentStep = wizard.find('[data-wizard-step][data-step="'+step+'"]');

            if(!currentStep.length){
                return;
            }

            var prevStep = wizard.find('[data-wizard-step]:visible');
            prevStep.trigger('hide').hide().trigger('hidden');
            wizard.find('[data-wizard-index]').removeClass('active');
            wizard.find('[data-wizard-index][data-index="'+step+'"]')
                .addClass('active');

            wizard.attr('data-step',step);
            kWizard.control.prev.prop('disabled',step===1);
            kWizard.control.next.prop('disabled',
                step===wizard.find('[data-wizard-step]').length);


            currentStep.trigger('show')
                .fadeIn('slow',function(){
                    currentStep.trigger('shown');
                });

        }

    };
    
}(jQuery));