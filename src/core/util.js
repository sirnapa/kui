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

}(jQuery));