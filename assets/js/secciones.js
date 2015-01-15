$('.seccion').each(function(s,seccion){
	var li = $('<li>').appendTo('#menu-secciones');
	var a = $('<a>').attr('href',$(seccion).data('enlace')? $(seccion).data('enlace') : ('#'+$(seccion).attr('id')))
		.html($(seccion).find('h2,h3,h4').first().html())
		.appendTo(li);
	var subsecciones = $(seccion).find('.subseccion');
	if(subsecciones.length){
		li.addClass('dropdown');
		a.addClass('dropdown-toggle')
			.attr('href','#')
			.attr('data-toggle','dropdown')
			.attr('role','button')
			.attr('aria-expanded','true');
		$('<span>').addClass('caret')
			.appendTo(a);
		var ul = $('<ul>').addClass('dropdown-menu')
			.attr('role','menu')
			.appendTo(li);
		$.each(subsecciones,function(ss,subseccion){
			$('<a>').attr('href',$(subseccion).data('enlace')? $(subseccion).data('enlace') : ('#'+$(subseccion).attr('id')))
        		.html($(subseccion).find('h2,h3,h4').first().html())
        		.appendTo($('<li>').appendTo(ul));
		})
	}
});