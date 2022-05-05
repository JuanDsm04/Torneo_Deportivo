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


/* LOGIN (PARA ADMINISTRADORES Y USUARIOS)*/
function Login(req, res){
    var parametros = req.body;
    Usuarios.findOne({usuario: parametros.usuario}, (err, usuarioEncontrado) => {
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(usuarioEncontrado){

            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword) => {
                    if (verificacionPassword){
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                            .send({token: jwt.crearToken(usuarioEncontrado)});
                        } else{
                            usuarioEncontrado.password = undefined;
                            return res.status(200)
                            .send({usuario: usuarioEncontrado});
                        }
                        
                    }else{
                        return res.status(500)
                        .send({mensaje: 'Las contrasenas no coincide'});
                    }
                })

        }else{
            return res.status(500).send({mensaje: 'Error el usuario no se encuentra registrado'});
        }
    })
}


/* REGISTRARSE COMO UN NUEVO USUARIO (PARA USUARIOS)*/
function registrarUsuario (req, res){
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede elegir el id'});

    if (parametros.rol != null)
    return res.status(500).send({ mensaje: 'No puede elegir el rol, se otorgara automaticamente'});

    if(parametros.nombre && parametros.usuario && parametros.password){
        usuarioModel.nombre = parametros.nombre;
        usuarioModel.usuario = parametros.usuario;
        usuarioModel.rol = 'USUARIO';
        usuarioModel.password = parametros.password;
        
        Usuarios.find({usuario: parametros.usuario}, (err, usuarioEncontrado)=>{
            if (usuarioEncontrado.length == 0){
                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada)=>{
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err, usuarioGuardado)=>{
                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!usuarioGuardado) return res.status(500).send({mensaje: 'Error al agregar el usuario'});
    
                        return res.status(200).send({usuario: usuarioGuardado});
                    });
                })
            }else{
                return res.status(500).send({mensaje:'Este usuario ya existe'});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'Debe rellenar los campos necesarios'});
    }

}


/* REGISTRAR UN NUEVO USUARIO ADMINISTRADOR (PARA ADMINISTRADORES)*/
function registrarUsuarioAdministrador (req, res){
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if(req.user.rol != 'ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo los administradores pueden agregar a  un nuevo administrador'});

    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede elegir el id'});

    if (parametros.rol != null)
    return res.status(500).send({ mensaje: 'No puede elegir el rol, se otorgara automaticamente como Administrador'});

    if(parametros.nombre && parametros.usuario && parametros.password){
        usuarioModel.nombre = parametros.nombre;
        usuarioModel.usuario = parametros.usuario;
        usuarioModel.rol = 'ADMINISTRADOR';
        usuarioModel.password = parametros.password;
        
        Usuarios.find({usuario: parametros.usuario}, (err, usuarioEncontrado)=>{
            if (usuarioEncontrado.length == 0){
                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada)=>{
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err, usuarioGuardado)=>{
                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!usuarioGuardado) return res.status(500).send({mensaje: 'Error al agregar el usuario'});
    
                        return res.status(200).send({usuario: usuarioGuardado});
                    });
                })
            }else{
                return res.status(500).send({mensaje:'Este usuario ya existe'});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'Debe rellenar los campos necesarios'});
    }

}


/* EDITAR USUARIO O PERFIL (PARA ADMINISTRADORES Y USUARIOS) */
function editarUsuario (req, res){
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

    if (parametros._id != null)
    return res.status(500).send({ mensaje: 'No se puede editar el id'});

    if (parametros.password != null)
    return res.status(500).send({ mensaje: 'No tiene autorizado el editar la password'});

    if (parametros.rol != null)
    return res.status(500).send({ mensaje: 'No se puede editar el rol'});

    if( req.user.rol == 'ADMINISTRADOR' ){

        Usuarios.find({usuario: parametros.usuario}, (err, usuarioEncontrado)=>{
            if (usuarioEncontrado.length == 0){
                Usuarios.findOneAndUpdate({rol:'USUARIO', _id: idUsu}, parametros, {new: true} ,(err, usuarioActualizado) => {
                    if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!usuarioActualizado) return res.status(404).send({mensaje: "Ocurrio un error o intento editar a un administrador"});
            
                    return res.status(200).send({usuario: usuarioActualizado});
                })
            }else{
                return res.status(500).send({mensaje:'Este usuario ya existe'});
            }
        })

    }else{
        if ( idUsu !== req.user.sub ) 
        return res.status(500).send({ mensaje: 'Usted es un usuario y por lo tanto solo puede editar su perfil'});

        Usuarios.find({usuario: parametros.usuario}, (err, usuarioEncontrado)=>{
            if (usuarioEncontrado.length == 0){
                Usuarios.findOneAndUpdate({rol:'USUARIO', _id: idUsu}, parametros, {new: true} ,(err, usuarioActualizado) => {
                    if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!usuarioActualizado) return res.status(404).send({mensaje: "Ocurrio un error o intento editar a un administrador"});
            
                    return res.status(200).send({usuario: usuarioActualizado});
                })
            }else{
                return res.status(500).send({mensaje:'Este usuario ya existe'});
            }
        })
    }
}


/* ELIMINAR USUARIO (PARA ADMINISTRADORES) */
function eliminarUsuario (req, res){
    var idUsu = req.params.idUsuario;

    if(req.user.rol != 'ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo los administradores pueden eliminar a los usuarios'});

    Usuarios.findOneAndDelete({rol:'USUARIO', _id: idUsu},(err, eliminarUsuario) => {
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!eliminarUsuario) return res.status(404).send({mensaje: "Ocurrio un error o intento eliminar a un Administrador"});

        return res.status(200).send({usuario: eliminarUsuario});
    })

}


/* VISUALIZAR USUARIO (PARA ADMINISTRADORES) */
function verUsuario(req, res){
    var idUsu = req.params.idUsuario;

    if(req.user.rol != 'ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'Solo los administradores pueden ver a los usuarios'});

    Usuarios.findOne({rol:'USUARIO', _id:idUsu}, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!usuarioEncontrado) return res.status(404).send({mensaje: "Ocurrio un error o intento ver a un administrador"});

        return res.status(200).send({usuario: usuarioEncontrado});
    })
}

module.exports = {
    administradorDefault,
    Login,
    registrarUsuario,
    registrarUsuarioAdministrador,
    editarUsuario,
    eliminarUsuario,
    verUsuario
}