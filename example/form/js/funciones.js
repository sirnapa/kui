function submitFunction(datos,original){
	console.log('* Original',original);
	console.log('* Con cambios',datos);
	alert('Guardar');
}

function afterSubmitFunction(){
	console.log('Este evento se dispara después de guardar.');
}