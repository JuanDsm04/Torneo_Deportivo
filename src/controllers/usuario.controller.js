const Usuarios = require('../models/usuario.model');

const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');

/* ADMINISTRADOR DEFAULT */
function administradorDefault(){
    Usuarios.find({usuario:'ADMIN'}, (err, administradorEncontrado)=>{
        if(administradorEncontrado == 0){
            bcrypt.hash('deportes123', null, null, (err, passwordEncriptada)=>{
                Usuarios.create({
                    nombre: null,
                    usuario: 'ADMIN',
                    rol: 'ADMINISTRADOR',
                    password: passwordEncriptada
                })
            });
        }
    });
}



module.exports = {
    administradorDefault
}