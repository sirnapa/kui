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

    source : function(source,sourceAjax,sourceData){

      var data = {};

      if(source===undefined){
          data = {};
      }else if(typeof source === 'string'){

          $.ajax({
              type: sourceAjax,
              url: source,
              data: sourceData,
              success: function(remoteData){
                  if (!remoteData.error) {
                      data = remoteData;
                  }
              },
              async: false
          });

      }else{
          data = source;
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
    }

  };

}(jQuery));
