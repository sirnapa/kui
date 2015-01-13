/*
 * kui
 * 
 *
 * Copyright (c) 2015 Nelson Paez
 * Licensed under the MIT license.
 */

(function ($) {

  // Collection method.
  $.fn.kui = function () {
    return this.each(function (i) {
      // Do something to each selected element.
      $(this).html('kui' + i);
    });
  };

  // Static method.
  $.kui = function (options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.kui.options, options);
    // Return the name of your plugin plus a punctuation character.
    return 'kui' + options.punctuation;
  };

  // Static method default options.
  $.kui.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].kui = function (elem) {
    // Does this element contain the name of your plugin?
    return $(elem).text().indexOf('kui') !== -1;
  };

}(jQuery));
