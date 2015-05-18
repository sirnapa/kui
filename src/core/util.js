/*
 *
 *   +++++++++++++++++++++ Util +++++++++++++++++++++ 
 *
 */

(function ($) {

  // Generate random ID
  $.kui.random_id = function() {
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g,
      function(c) {
        var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
  };

  // Data & Format
  $.kui.data = {

  	format: function(item,nombre,formato,combo,solo_lectura){

  		if(combo){
          var subvalor = function(dato,nivel_1,nivel_2){
            return dato[nivel_1]? dato[nivel_1][nivel_2] : 
                   (dato[nivel_1+'.'+nivel_2]? 
                    dato[nivel_1+'.'+nivel_2] : '');
          };

          if(solo_lectura){
            return typeof combo.formato==='function'? 
                combo.formato.call(this,
                  item[nombre]?
                  item[nombre] : 
                  item[nombre+'.'+combo.id]) :
                subvalor(item,nombre,combo.formato);
          }else{
          	return subvalor(item,nombre,combo.id);
          }
    	}

        return typeof formato === 'function'?
            formato.call(this,item[nombre],item) : item[nombre];
    }

  };

}(jQuery));