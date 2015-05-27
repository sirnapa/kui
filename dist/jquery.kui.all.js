/*! kui - v0.0.7 - 2015-05-26
* https://github.com/konecta/kui
* Copyright (c) 2015 Nelson Paez; Licensed MIT */
(function ($) {

  // Collection method.
  $.fn.kui = function (widget,data,aux) {
    return this.each(function () {
        $(this).attr('data-kui',true);

        if(widget){
          $(this).attr('data-widget',widget);
          $.kui.widgets[widget].call(this,data,aux);
        }
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

  // Widgets
  $.kui.widgets = {};

  // Widgets instances
  $.kui.instances = {};

}(jQuery));
