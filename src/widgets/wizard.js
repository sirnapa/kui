/*
 *
 *   +++++++++++++++++++++ Wizard +++++++++++++++++++++
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

        if( params[$.kui.i18n.steps]===undefined){
            window.console.error(
                'The param ' +
                '"' + $.kui.i18n.steps + '"' +
                ' is required.'
            );
            return;
        }

        $.extend(this,{
            steps: params[$.kui.i18n.steps],
            indices: params[$.kui.i18n.indices],
            prev: params[$.kui.i18n.prev],
            next: params[$.kui.i18n.next],
            validate: params[$.kui.i18n.validate],
            loadComplete: params[$.kui.i18n.loadComplete]
        });

        this.div = div;
        this.load();
    };

    KWizard.prototype = {

        load : function() {

            var kWizard = this;
            var wizard = $(kWizard.div);

            wizard.hide()
                .attr('data-wizard',true)
                .attr('data-step','0');

            if(typeof kWizard.steps === 'string'){
                wizard.find(kWizard.steps).each(function(p,step){
                    $(step).hide()
                        .attr('data-wizard-step',true)
                        .attr('data-step',p+1);
                });
                wizard.find(kWizard.indices).each(function(p,step){
                    $(step).removeClass('active')
                        .attr('data-wizard-index',true)
                        .attr('data-index',p+1);
                });
            }else{
                //TODO Build automatic steps
            }

            kWizard.pager = {};

            if(!kWizard.prev || !kWizard.next){
                kWizard.pager.container = $('<ul>').addClass('pager')
                    .appendTo($('<nav>').appendTo(wizard));
            }

            kWizard.pager.prev = kWizard.prev?
                $(kWizard.prev) :
                $('<button>').addClass('btn btn-default')
                    .html($.kui.i18n.prevMsg)
                    .appendTo($('<li>').appendTo(kWizard.pager.container))
                    .after('&nbsp;');

            kWizard.pager.next = kWizard.next?
                $(kWizard.next) :
                $('<button>').addClass('btn btn-primary')
                    .html($.kui.i18n.nextMsg)
                    .appendTo($('<li>').appendTo(kWizard.pager.container))
                    .before('&nbsp;');

            kWizard.pager.prev.click(function(){
                var step = parseInt(wizard.attr('data-step'));
                kWizard.showStep(step-1);
            });

            kWizard.pager.next.click(function(){
                var step = parseInt(wizard.attr('data-step'));
                if(kWizard.stepValid(step)){
                    kWizard.showStep(step+1);
                }
            });

            if(typeof kWizard.loadComplete === 'function'){
                kWizard.loadComplete.call(this);
            }

            kWizard.showStep(1);
            wizard.fadeIn();

        },

        stepValid: function(step){

            var kWizard = this;
            var success = true;
            var currentStep = $(kWizard.div).find('[data-wizard-step][data-step="'+step+'"]');

            if(typeof kWizard.validate === 'function'){
                success = kWizard.validate.call(this,currentStep);
            }

            return success;
        },

        showStep: function(step){

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
            kWizard.pager.prev.prop('disabled',step===1);
            kWizard.pager.next.prop('disabled',
                step===wizard.find('[data-wizard-step]').length);


            currentStep.trigger('show')
                .fadeIn('slow',function(){
                    currentStep.trigger('shown');
                });

        }

    };

}(jQuery));
