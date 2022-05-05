const Equipos = require('../models/equipo.model');
const Usuarios = require('../models/usuario.model');
const Ligas = require('../models/liga.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* AGREGAR EQUIPO (ADMINISTRADORES Y USUARIOS)*/
function agregarEquipo(req, res){
    var parametros = req.body;
    var equipoModel = new Equipos();

    if(parametros.nombreEquipo && parametros.nombreLiga){

        Equipos.find({idCreadorEquipo: req.user.sub}, (err, cantidadEquiposEncontrada)=>{
            if (cantidadEquiposEncontrada.length > 9)
            return res.status(500).send({mensaje:'No puede agregar mas de 10 equipos por liga'})

            Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
                if (ligaEncontrada.length == 0)
                return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de sus ligas'})

                Ligas.findOne({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
                    if (ligaEncontrada.length != 0){

                        equipoModel.nombreEquipo = parametros.nombreEquipo;
                        equipoModel.puntos = 0;
                        equipoModel.golesFavor = 0;
                        equipoModel.golesContra = 0;
                        equipoModel.diferenciaGoles = 0;
                        equipoModel.partidosJugados = 0;
                        equipoModel.idLiga = ligaEncontrada._id;
                        equipoModel.idCreadorEquipo = req.user.sub;

                        Equipos.find({nombreEquipo: parametros.nombreEquipo, idCreadorEquipo: req.user.sub}, (err, equipoEncontrado)=>{
                        if (equipoEncontrado.length == 0){

                            equipoModel.save((err, equipoGuardado) =>{
                                if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                if(!equipoGuardado) return res.status(500).send({mensaje: "Error al guardar el equipo"});

                                return res.status(200).send({equipo: equipoGuardado});
                            });
                        }else{
                            return res.status(500).send({mensaje:'Este nombre de equipo ya se encuentra registrado entre sus ligas'})
                        }
                        })

                    }else{
                        return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de sus ligas'})
                    }
                })

            })
            
        })
    }else{
        return res.status(500).send({mensaje:'Debe llenar todos los campos necesarios'})
    }
}


/* AGREGARLE UN EQUIPO A UN USUARIO (Como Administrador supervisando en general) */
function agregarEquipoComoAdmin (req, res){
    var parametros = req.body;
    var equipoModel = new Equipos();
    var idUsu = req.params.idUsuario;

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});

    Usuarios.find({_id: idUsu, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
        if(usuarioEncontrado.length != 0){

            if(parametros.nombreEquipo && parametros.nombreLiga){

                Equipos.find({idCreadorEquipo: idUsu}, (err, cantidadEquiposEncontrada)=>{
                    if (cantidadEquiposEncontrada.length > 9)
                    return res.status(500).send({mensaje:'No puede agregarle mas de 10 equipos por liga a este usuario'})
        
                    Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: idUsu}, (err, ligaEncontrada)=>{
                        if (ligaEncontrada.length == 0)
                        return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de las ligas del usuario que eligio'})
        
                        Ligas.findOne({nombreLiga: parametros.nombreLiga, idCreadorLiga: idUsu}, (err, ligaEncontrada)=>{
                            if (ligaEncontrada.length != 0){
        
                                equipoModel.nombreEquipo = parametros.nombreEquipo;
                                equipoModel.puntos = 0;
                                equipoModel.golesFavor = 0;
                                equipoModel.golesContra = 0;
                                equipoModel.diferenciaGoles = 0;
                                equipoModel.partidosJugados = 0;
                                equipoModel.idLiga = ligaEncontrada._id;
                                equipoModel.idCreadorEquipo = idUsu;
        
                                Equipos.find({nombreEquipo: parametros.nombreEquipo, idCreadorEquipo: idUsu}, (err, equipoEncontrado)=>{
                                    if (equipoEncontrado.length == 0){
        
                                        equipoModel.save((err, equipoGuardado) =>{
                                            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                            if(!equipoGuardado) return res.status(500).send({mensaje: "Error al guardar el equipo"});
        
                                            return res.status(200).send({equipo: equipoGuardado});
                                        });
                                    }else{
                                        return res.status(500).send({mensaje:'Este nombre de equipo ya se encuentra registrado entre las ligas del usuario elegido'})
                                    }
                                })
        
                            }else{
                                return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de las ligas del usuario elegido'})
                            }
                        })
        
                    })
                    
                })
            }else{
                return res.status(500).send({mensaje:'Debe llenar todos los campos necesarios'})
            }

        }else{
            return res.status(404).send({mensaje: "No puede agregarle un equipo a un administrador, solo a los usuarios"});
        }
        
    })
    
}


/* EDITAR EQUIPO (ADMINISTRADORES Y USUARIOS) */
function editarEquipo(req, res){
    var idEqui = req.params.idEquipo;
    var parametros = req.body;

    Equipos.find({nombreEquipo: parametros.nombreEquipo, idCreadorEquipo: req.user.sub}, (err, equipoEncontrado)=>{
        if (equipoEncontrado.length == 0){

            Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
                if (ligaEncontrada.length == 0)
                return res.status(500).send({mensaje:'El nuevo nombre de la liga ingresado no fue encontrado dentro de sus ligas'})

                Ligas.findOne({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
                    if (ligaEncontrada.length != 0){

                        Equipos.findOneAndUpdate({_id:idEqui, idCreadorEquipo: req.user.sub}, parametros, {new: true} ,(err, equipoActualizado) => {
                            if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                            if(!equipoActualizado) return res.status(404).send({mensaje: "Error al editar el equipo, o intento modificar el equipo de otro usuario"});

                            return res.status(200).send({equipo: equipoActualizado});
                        })
                    }else{
                        return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de sus ligas'})
                    }
                })
                
            })
        }else{
            return res.status(500).send({mensaje:'Este nombre de equipo ya se encuentra registrado dentro de sus ligas'})
        }
    })

}


/* EDITARLE UN EQUIPO A UN USUARIO (Como Administrador supervisando en general) */
function editarEquipoComoAdmin (req, res){
    var idEqui = req.params.idEquipo;
    var parametros = req.body;

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});

    if(parametros.idUsuario){
        Usuarios.find({_id: parametros.idUsuario, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){
    
                Equipos.find({nombreEquipo: parametros.nombreEquipo, idCreadorEquipo: parametros.idUsuario}, (err, equipoEncontrado)=>{
                    if (equipoEncontrado.length == 0){
            
                        Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: parametros.idUsuario}, (err, ligaEncontrada)=>{
                            if (ligaEncontrada.length == 0)
                            return res.status(500).send({mensaje:'El nuevo nombre de la liga ingresado no fue encontrado dentro de las ligas del usuario elegido'})
            
                            Ligas.findOne({nombreLiga: parametros.nombreLiga, idCreadorLiga: parametros.idUsuario}, (err, ligaEncontrada)=>{
                                if (ligaEncontrada.length != 0){
            
                                    Equipos.findOneAndUpdate({_id:idEqui, idCreadorEquipo: parametros.idUsuario}, parametros, {new: true} ,(err, equipoActualizado) => {
                                        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                        if(!equipoActualizado) return res.status(404).send({mensaje: "Error al editar el equipo, o intento modificar el equipo de otro usuario diferente al elegido"});
            
                                        return res.status(200).send({equipo: equipoActualizado});
                                    })
                                }else{
                                    return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de las ligas del usuario elegido'})
                                }
                            })
                            
                        })
                    }else{
                        return res.status(500).send({mensaje:'Este nombre de equipo ya se encuentra registrado dentro de las ligas del usuario elegido'})
                    }
                })
    
            }else{
                return res.status(404).send({mensaje: "No puede editarle un equipo a un administrador, solo a los usuarios"});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'Debe ingresar el id del usuario al que le pertenece el equipo a editar'});
    }
    
}


/* ELIMINAR EQUIPO (ADMINISTRADORES Y USUARIOS) */
function eliminarEquipo(req, res){
    var idEqui = req.params.idEquipo;

    Equipos.findOneAndDelete({_id:idEqui, idCreadorEquipo: req.user.sub},(err, equipoEliminado) => {
        if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
        if (!equipoEliminado) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar un equipo que no le pertenece'});

        return res.status(200).send({liga: equipoEliminado});
    })
    
}


/* ELIMINARLE UN EQUIPO A UN USUARIO (Como Administrador supervisando en general) */
function eliminarEquipoComoAdmin(req, res){

    var idEqui = req.params.idEquipo;
    var parametros = req.body;


    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});


    if(parametros.idUsuario){
        Usuarios.find({_id: parametros.idUsuario, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){
    
                Equipos.findOneAndDelete({_id:idEqui, idCreadorEquipo: parametros.idUsuario},(err, equipoEliminado) => {
                    if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
                    if (!equipoEliminado) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar un equipo que no le pertenece al usuario elegido'});
            
                    return res.status(200).send({liga: equipoEliminado});
                })
    
            }else{
                return res.status(404).send({mensaje: "No puede eliminarle un equipo a un administrador, solo a los usuarios"});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'Debe ingresar el id del usuario al que le pertenece el equipo a eliminar'});
    }

}


/* VER EQUIPOS POR LIGAS (ADMINISTRADORES Y USUARIOS)*/
function verEquiposLiga(req,res){
    var idLig = req.params.idLiga;

    Equipos.find({idCreadorEquipo: req.user.sub, idLiga: idLig}, (err, equiposEncontrados)=>{
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!equiposEncontrados) return res.status(404).send({mensaje: "Ocurrio un error"});
        if(equiposEncontrados.length == 0) return res.status(500).send({mensaje: 'Aun no tiene equipos en la liga o intento ver los equipos de una liga que no le pertenece'})

        return res.status(200).send({equipos: equiposEncontrados});
    })
 
}


/* VER EL EQUIPO DE UN USUARIO (Como Admininistrador supervisando en general) */
function verEquiposLigaComoAdmin(req, res){
    var idLig = req.params.idLiga;
    var parametros = req.body;

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});

    if(parametros.idUsuario){

        Usuarios.find({_id: parametros.idUsuario, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){

                Equipos.find({idCreadorEquipo: parametros.idUsuario, idLiga: idLig}, (err, equiposEncontrados)=>{
                    if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!equiposEncontrados) return res.status(404).send({mensaje: "Ocurrio un error"});
                    if(equiposEncontrados.length == 0) return res.status(500).send({mensaje: 'Aun no tiene equipos en la liga o intento ver los equipos de una liga que no le pertenece al usuario elegido'})
            
                    return res.status(200).send({equipos: equiposEncontrados});
                })

            }else{
                return res.status(404).send({mensaje: "No puede ver los equipos de una liga de un administrador, solo las de los usuarios"});
            }
        })
    }else{
        return res.status(500).send({mensaje: 'Debe ingresar el id del usuario al que le pertenece la liga a ver'});
    }
}


module.exports = {
    agregarEquipo,
    editarEquipo,
    eliminarEquipo,
    verEquiposLiga,


    agregarEquipoComoAdmin,
    editarEquipoComoAdmin,
    eliminarEquipoComoAdmin,
    verEquiposLigaComoAdmin
}
