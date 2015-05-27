$('#custom-html').kui('wizard',{
    pasos: '.paso',
    indices: '.indice',
    siguiente: '.siguiente',
    anterior: '.anterior',
    validacion: validacion,
    loadComplete: loadComplete
});

$('#paso2').on('show',function(){
  console.log('Justo antes de mostrar el paso 2');
  
  $('#map').remove();

  $('<div>').attr('id','map')
  	.css('height',
		$(window).height() - 
		$('#ejemplo-custom-html').position().top
	)
  	.appendTo('#paso2');    
});

$('#paso2').on('shown',function(){
  console.log('Inmediatamente después de mostrar el paso 2');

  var ubicacion = eval($('#exampleInputCiudad1').val());

	var map = L.map('map', {
	    center: ubicacion,
	    zoom: 13
	});


	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
	  maxZoom: 18,
	  id: 'examples.map-i875mjb7'
	}).addTo(map);

	window.customMarker = L.marker(ubicacion).addTo(map);
});

$('.paso').on('hide',function(){
  console.log('Justo antes de ocultar el paso ' + $(this).data('step'));
});

$('.paso').on('hidden',function(){
  console.log('Inmediatamente después de ocultar el paso ' + $(this).data('step'));
});