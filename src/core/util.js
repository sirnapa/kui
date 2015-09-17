/*
 *
 *   +++++++++++++++++++++ Util +++++++++++++++++++++
 *
 */

(function ($) {

  // Generate random ID
  $.kui.randomId = function() {
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g,
      function(c) {
        var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
  };

  // Dummy link
  $.kui.dummyLink = 'javascript'+':'.toLowerCase()+'void(0)';

  // Data & Format
  $.kui.data = {

    /*
     * @param o = {
     *      {Object} source
     *      {String} sourceAjax
     *      {Object} sourceData
     *      {Function} sourceParse
     *      {String} key,
     *      {Object} message,
     *      {Object} targetS,
     * }
     */

    source : function(o){

      var data = {};

      if(o.source===undefined){
          data = {};
      }else if(typeof o.source === 'string'){

          $.kui.ajax({
              target: o.target,
              type: o.sourceAjax,
              url: o.source,
              data: o.sourceData,
              success: function(remoteData){
                  if(typeof o.sourceParse === 'function'){
                    data = o.sourceParse.call(this,remoteData);
                  }else if(remoteData.error && remoteData.mensaje){
                      $.kui.messages(o.message,o.target,remoteData.tipoMensaje,remoteData.mensaje);
                  }else{
                    data = remoteData[o.key];
                  }
              },
              async: false
          }).error(function(o){
            window.console.log('error....',o);
          });

      }else{
          data = o.source;
      }

      return data;
    },

  	format: function(item,name,format,combobox,readOnly){

  		if(combobox && combobox.id && combobox.formato){
          if(readOnly){
            return typeof combobox.formato==='function'?
                combobox.formato.call(this,
                  item[name]?
                  item[name] :
                  item[name+'.'+combobox.id]) :
                $.kui.data.valueFromJson(item,name,combobox.formato);
          }else{
          	return $.kui.data.valueFromJson(item,name,combobox.id);
          }
    	}

      return typeof format === 'function'?
        format.call(this,item[name],item) : item[name];
    },

    valueFromJson: function(data,level1,level2){
      return data[level1]? data[level1][level2] :
             (data[level1+'.'+level2]?
              data[level1+'.'+level2] : '');
    },

    dateToIso: function(value){
      var date;
      var format = {
        dd: 0,
        MM: 1,
        yyyy: 2
      };

      if (value.indexOf('/') > 0){
          date = value.split('/');
      } else {
          date = value.split('-');
          format.yyyy = 0;
          format.dd = 2;
      }
      return (date.length===3)?
        (date[format.yyyy] +'-' + date[format.MM] + '-' + date[format.dd])
        : '';
    }

  };

  // Ajax
  $.kui.ajax = function(o) {
    $.kui.loading.show(o);
    var ajaxRequest = $.ajax(o);
    $.kui.loading.hide(o);
    return ajaxRequest;
  };

  // Loading
  $.kui.loading = {
    init: function(o) {
      var target = $(o.target);
      var id = $.kui.randomId();
      var div = $('<div>').attr('id',id)
        .addClass('text-center text-muted')
        .css('margin-botton',10)
        .hide();
      $('<i>').addClass('fa fa-5x fa-circle-o-notch fa-spin')
        .appendTo(div);
      target.before(div);
      target.attr('data-loading',id);
    },
    show: function(o) {
      var target = o.target? $(o.target) : $('body');
      if(!target.data('loading')){
        o.target = target;
        $.kui.loading.init(o);
      }

      target.hide();
      $('#'+target.data('loading')).fadeIn('slow');
    },
    hide: function(o){
      var target = $(o.target);
      var loading = $('#'+target.data('loading'));
      loading.fadeOut('slow',function(){
        target.fadeIn('fast');
      });
    }
  };


}(jQuery));
