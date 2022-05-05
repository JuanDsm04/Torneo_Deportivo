const Jornadas = require('../models/jornada.model');
const Usuarios = require('../models/usuario.model');
const Ligas = require('../models/liga.model');
const Equipos = require('../models/equipo.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');

/* AGREGAR UNA JORNADA (PARA ADMINISTRADORES Y USUARIOS)*/
function agregarJornada(req, res){
    var parametros = req.body;
    var jornadaModel = new Jornadas();

    if(parametros.numeroJornada, parametros.nombreLiga){

        //Buscar entre las ligas del usuario que el nombre ingresado exista
        Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
            if (ligaEncontrada.length == 0)
            return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de sus ligas'})


            // Buscar y tomar el id del nombre de la liga que ingreso
            Ligas.findOne({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
                if (ligaEncontrada.length != 0){

                    Equipos.find({idCreadorEquipo: req.user.sub, idLiga: ligaEncontrada._id}, (err, cantidadEquiposEncontrados)=>{
                        if (cantidadEquiposEncontrados.length % 2 == 0){ //si es par

                            Jornadas.find({numeroJornada: parametros.numeroJornada, idCreadorJornada: req.user.sub}, (err, jornadaEncontrada)=>{
                                if (jornadaEncontrada.length == 0){

                                    Jornadas.find({idCreadorJornada: req.user.sub, idLiga: ligaEncontrada._id}, (err, cantidadJornadasEncontradas)=>{
                                        if (cantidadJornadasEncontradas.length > (cantidadEquiposEncontrados.length - 2))
                                        return res.status(500).send({mensaje:'No puede agregar mas jornadas en esta liga debido a que la cantidad de equipos es de: '+cantidadEquiposEncontrados.length}) 
                                        
                                        jornadaModel.numeroJornada = parametros.numeroJornada;
                                        jornadaModel.idLiga = ligaEncontrada._id;
                                        jornadaModel.idCreadorJornada = req.user.sub;
                                    
                                        jornadaModel.save((err, jornadaGuardada) =>{
                                            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                            if(!jornadaGuardada) return res.status(500).send({mensaje: "Error al guardar la jornada"});
            
                                            return res.status(200).send({jornada: jornadaGuardada});
                                        });
                                    })
                                }else{
                                    return res.status(500).send({mensaje: 'El numero ingresado con el que identificara a su jornada ya se encuentra registrado dentro de su liga intente con el siguiente'})
                                }
                            })

                        }else{ //si es impar

                            Jornadas.find({numeroJornada: parametros.numeroJornada, idCreadorJornada: req.user.sub}, (err, jornadaEncontrada)=>{
                                if (jornadaEncontrada.length == 0){

                                    Jornadas.find({idCreadorJornada: req.user.sub, idLiga: ligaEncontrada._id}, (err, cantidadJornadasEncontradas)=>{
                                        if (cantidadJornadasEncontradas.length > (cantidadEquiposEncontrados.length - 1))
                                        return res.status(500).send({mensaje:'No puede agregar mas jornadas en esta liga debido a que la cantidad de equipos es de: '+cantidadJornadasEncontradas.length}) 
                                    

                                        jornadaModel.numeroJornada = parametros.numeroJornada;
                                        jornadaModel.idLiga = ligaEncontrada._id;
                                        jornadaModel.idCreadorJornada = req.user.sub;


                                        jornadaModel.save((err, jornadaGuardada) =>{
                                            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                            if(!jornadaGuardada) return res.status(500).send({mensaje: "Error al guardar la jornada"});
            
                                            return res.status(200).send({jornada: jornadaGuardada});
                                        });
                                    })
                                }else{
                                    return res.status(500).send({mensaje: 'El numero ingresado con el que identificara a su jornada ya se encuentra registrado dentro de su liga intente con el siguiente'})
                                }
                            })

                        }
                    })
                }
            })

        })
    }else{
        return res.status(500).send({mensaje:'Debe llenar todos los campos necesarios'})
    }
}


/* AGREGARLE UNA JORNADA A UN USUARIO (COMO ADMINISTRADOR Y SUPERVISANDO A LOS DEMAS USUARIOS) */
function agregarJornadaComoAdmin(req, res){
    var idUsu = req.params.idUsuario;
    var parametros = req.body;
    var jornadaModel = new Jornadas();

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});

    if(parametros.numeroJornada, parametros.nombreLiga){

        Usuarios.find({_id: idUsu, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){


                //Buscar entre las ligas del usuario que el nombre ingresado exista
                Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: idUsu}, (err, ligaEncontrada)=>{
                    if (ligaEncontrada.length == 0)
                    return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de las ligas del usuario elegido'})


                    // Buscar y tomar el id del nombre de la liga que ingreso
                    Ligas.findOne({nombreLiga: parametros.nombreLiga, idCreadorLiga: idUsu}, (err, ligaEncontrada)=>{
                        if (ligaEncontrada.length != 0){

                            Equipos.find({idCreadorEquipo: idUsu, idLiga: ligaEncontrada._id}, (err, cantidadEquiposEncontrados)=>{
                                if (cantidadEquiposEncontrados.length % 2 == 0){ //si es par

                                    Jornadas.find({numeroJornada: parametros.numeroJornada, idCreadorJornada: idUsu}, (err, jornadaEncontrada)=>{
                                        if (jornadaEncontrada.length == 0){

                                            Jornadas.find({idCreadorJornada: idUsu, idLiga: ligaEncontrada._id}, (err, cantidadJornadasEncontradas)=>{
                                                if (cantidadJornadasEncontradas.length > (cantidadEquiposEncontrados.length - 2))
                                                return res.status(500).send({mensaje:'No puede agregar mas jornadas en esta liga debido a que la cantidad de equipos del usuario es de: '+cantidadEquiposEncontrados.length}) 
                                                
                                                jornadaModel.numeroJornada = parametros.numeroJornada;
                                                jornadaModel.idLiga = ligaEncontrada._id;
                                                jornadaModel.idCreadorJornada = idUsu;
                                            
                                                jornadaModel.save((err, jornadaGuardada) =>{
                                                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                    if(!jornadaGuardada) return res.status(500).send({mensaje: "Error al guardar la jornada"});
                    
                                                    return res.status(200).send({jornada: jornadaGuardada});
                                                });
                                            })
                                        }else{
                                            return res.status(500).send({mensaje: 'El numero ingresado con el que identificara a su jornada ya se encuentra registrado dentro de la liga de este usuario, intente con el siguiente'})
                                        }
                                    })

                                }else{ //si es impar

                                    Jornadas.find({numeroJornada: parametros.numeroJornada, idCreadorJornada: idUsu}, (err, jornadaEncontrada)=>{
                                        if (jornadaEncontrada.length == 0){

                                            Jornadas.find({idCreadorJornada: idUsu, idLiga: ligaEncontrada._id}, (err, cantidadJornadasEncontradas)=>{
                                                if (cantidadJornadasEncontradas.length > (cantidadEquiposEncontrados.length - 1))
                                                return res.status(500).send({mensaje:'No puede agregar mas jornadas en esta liga debido a que la cantidad de equipos del usuario en esta liga es de: '+cantidadJornadasEncontradas.length}) 
                                            

                                                jornadaModel.numeroJornada = parametros.numeroJornada;
                                                jornadaModel.idLiga = ligaEncontrada._id;
                                                jornadaModel.idCreadorJornada = idUsu;


                                                jornadaModel.save((err, jornadaGuardada) =>{
                                                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                    if(!jornadaGuardada) return res.status(500).send({mensaje: "Error al guardar la jornada"});
                    
                                                    return res.status(200).send({jornada: jornadaGuardada});
                                                });
                                            })
                                        }else{
                                            return res.status(500).send({mensaje: 'El numero ingresado con el que identificara la jornada de este usuario ya se encuentra registrado dentro de la liga, intente con el siguiente'})
                                        }
                                    })

                                }
                            })
                        }
                    })

                })


            }else{
                return res.status(404).send({mensaje: "No puede agregarle una jornada a un administrador, solo a los usuarios"});
            }
        })
        
    }else{
        return res.status(500).send({mensaje:'Debe llenar todos los campos necesarios'})
    }
}



module.exports = {
    agregarJornada,
    agregarJornadaComoAdmin
}