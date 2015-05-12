$('#custom-html').kui('wizard',{
    pasos: '.paso',
    indices: '.indice',
    siguiente: '.siguiente',
    anterior: '.anterior',
    validacion: validacion,
    loadComplete: loadComplete
});