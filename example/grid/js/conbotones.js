$('#conbotones').kui('grid',{
    origen : 'js/datos.json',
    id : 'pkEncuesta',
    campos : [{
            nombre : 'nombre',
            titulo: 'Nombre',
            ancho: 4,
            atributos: {
                'readonly':true
                }
    },{
            nombre : 'fechaAlta',
            titulo: 'Creado',
            tipo: 'fecha'
    },{
            nombre : 'fechaModif',
            titulo: 'Modificado',
            tipo: 'fecha'
    },{
            nombre : 'anonimo',
            titulo: 'NN',
            ancho: 1,
            tipo: 'booleano',
            formato: function(campo,row){
                    return campo=='S';
            }
    }],
    estado : function(item) {
            if (item['activo'] == 'S') {
                    return true;
            }
            return false;
    },
    permisos: {
        remover: true,
        activar: activar,
        editar: true,
        guardar: guardar
    },
    botones: [
            {
                comentario: 'Botón 1',
                icono: 'group',
                onclick: function(item){
                    alert('Acabas de hacer click en el botón 1');
                }
            },{
                comentario: 'Botón 2',
                icono: 'mobile',
                onclick: function(item){
                    alert('Acabas de hacer click en el botón 2');
                }
            },{
                comentario: 'Botón 3',
                icono: 'gear',
                onclick: function(item){
                    alert('Acabas de hacer click en el botón 3');
                }
            },{
                comentario: 'Botón 4',
                icono: 'lock',
                onclick: function(item){
                    alert('Acabas de hacer click en el botón 4');
                }
            }
        ]
});