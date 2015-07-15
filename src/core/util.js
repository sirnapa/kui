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
     *      {Object} messageContainer,
     * }
     */

    source : function(o){

      window.console.log('Params',o.source,o.sourceAjax,o.sourceData);

      var data = {};

      if(o.source===undefined){
          data = {};
      }else if(typeof o.source === 'string'){

          $.ajax({
              type: o.sourceAjax,
              url: o.source,
              data: o.sourceData,
              success: function(remoteData){
                  if(typeof o.sourceParse === 'function'){
                    data = o.sourceParse.call(this,remoteData);
                  }else if(remoteData.error && remoteData.mensaje){
                      $.kui.messages(o.message,o.messageContainer,remoteData.tipoMensaje,remoteData.mensaje);
                  }else{
                    data = remoteData[o.key];
                  }
              },
              async: false
          });

      }else{
          data = o.source;
      }

      window.console.log('Data >>> ',data);

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
    var div = o.div? $(o.div) : $('body');
    $('<div>').appendTo(div);
    window.alert('Ajax start');
    var ajaxRequest = $.ajax(o);
    window.alert('Ajax stop');
    return ajaxRequest;
  };

}(jQuery));
