function validacion(paso){
	return true;
}

function loadComplete(){
	$('#map').css('height',
		$(window).height() - 
		$('#ejemplo-custom-html').position().top);

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
}