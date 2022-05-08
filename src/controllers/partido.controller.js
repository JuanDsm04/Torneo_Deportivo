const Partidos = require('../models/partido.model');
const Jornadas = require('../models/jornada.model');
const Usuarios = require('../models/usuario.model');
const Ligas = require('../models/liga.model');
const Equipos = require('../models/equipo.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');

function agregarPartido(req, res){
    var parametros = req.body;
    var partidoModel = new Partidos();


    // Buscar entre las ligas del usuario que el nombre ingresado exista
    Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
        if (ligaEncontrada.length == 0)
        return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de sus ligas'})
        

        // Buscar y tomar el id del nombre de la liga que ingreso
        Ligas.findOne({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
            if (ligaEncontrada.length != 0){


                //Buscar entre las jornadas del usuario que el id ingresado exista
                Jornadas.find({idCreadorJornada: req.user.sub, _id: parametros.idJornada}, (err, jornadaEncontrada)=>{
                    if(jornadaEncontrada.length == 0 )
                    return res.status(500).send({mensaje: 'El id de la jornada ingresado no fue encontrado dentro de sus jornadas'})

                    
                    // Buscar y tomar entre las jornadas el id que ingreso para ver si existe
                    Jornadas.findOne({idCreadorJornada: req.user.sub, _id: parametros.idJornada}, (err, jornadaEncontrada)=>{
                        if(jornadaEncontrada.length == 0 )
                        return res.status(500).send({mensaje: 'El id de la jornada ingresado no fue encontrado dentro de sus jornadas'})


                        // Buscar y encontrar la cantidad de equipos para definir si es par o impar
                        Equipos.find({idCreadorEquipo: req.user.sub, idLiga: ligaEncontrada._id}, (err, cantidadEquiposEncontrados)=>{
                            if (cantidadEquiposEncontrados.length % 2 == 0){ //si es par


                                //Buscar que los nombres del equipo 1 y 2 le pertenezcan
                                Equipos.find({nombreEquipo: parametros.equipo1, idCreadorEquipo: req.user.sub}, (err, equipoPertenecienteEncontrado)=>{
                                    if (equipoPertenecienteEncontrado.length == 0)
                                    return res.status(500).send({mensaje:'El nombre del equipo 1 ingresado no fue encontrado en sus registros o talvez no le pertenece'})
                        

                                    Equipos.find({nombreEquipo: parametros.equipo2, idCreadorEquipo: req.user.sub}, (err, equipoPertenecienteEncontrado)=>{
                                        if (equipoPertenecienteEncontrado.length == 0)
                                        return res.status(500).send({mensaje:'El nombre del equipo 2 ingresado no fue encontrado en sus registros o talvez no le pertenece'})
                                    
                                    
                                        // Evitar que ingrese el mismo equipo dentro del partido (que no se enfrente a el mismo)
                                        if(parametros.equipo1 == parametros.equipo2)
                                        return res.status(500).send({mensaje: 'El equipo 1 y 2 no deben ser el mismo para poder jugar el partido'})
                                    

                                        //AQUI EMPIEZA LO NUEVO
                                        //Buscar que los equipos no se hayan enfrentado entre ellos entre las distintas jornadas (1 vs 2)
                                        Partidos.find({equipo1: parametros.equipo1, equipo2: parametros.equipo2, idCreadorPartido: req.user.sub}, (err, equipoEnPartidoEncontrado)=>{
                                            if (equipoEnPartidoEncontrado != 0)
                                            return res.status(500).send({mensaje: 'Estos equipos ya se enfrentaron en esta o en una jornada pasada'})


                                            //Buscar que los equipos no se hayan enfrentado entre ellos entre las distintas jornadas (1 y 2)
                                            Partidos.find({equipo1: parametros.equipo2, equipo2: parametros.equipo1, idCreadorPartido: req.user.sub}, (err, equipoEnPartidoEncontrado)=>{
                                                if (equipoEnPartidoEncontrado != 0)
                                                return res.status(500).send({mensaje: 'Estos equipos ya se enfrentaron en esta o en una jornada pasada'})
    
    

                                                // Buscar que el equipo 1 no haya jugado ya en la jornada (Solo puede jugar una vez)
                                                Partidos.find({equipo1: parametros.equipo1, idCreadorPartido: req.user.sub, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                    if (equipoEnPartidoEncontrado != 0)
                                                    return res.status(500).send({mensaje: 'El equipo 1 ya tiene un partido en esta jornada'})


                                                    Partidos.find({equipo2: parametros.equipo1, idCreadorPartido: req.user.sub, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                        if (equipoEnPartidoEncontrado != 0)
                                                        return res.status(500).send({mensaje: 'El equipo 1 ya tiene un partido en esta jornada'})
                                                        

                                                        //Buscar que el equipo 2 no haya jugado ya en la jornada (Solo puede jugar una vez)
                                                        Partidos.find({equipo2: parametros.equipo2, idCreadorPartido: req.user.sub, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                            if (equipoEnPartidoEncontrado != 0)
                                                            return res.status(500).send({mensaje: 'El equipo 2 ya tiene un partido en esta jornada'})

                                                            Partidos.find({equipo1: parametros.equipo2, idCreadorPartido: req.user.sub, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                if (equipoEnPartidoEncontrado != 0)
                                                                return res.status(500).send({mensaje: 'El equipo 2 ya tiene un partido en esta jornada'})

                                                                
                                                                // Buscar y encontrar la cantidad de partidos actuales en la jornada
                                                                Partidos.find({idCreadorPartido: req.user.sub, idLiga: ligaEncontrada._id, idJornada: jornadaEncontrada._id}, (err, cantidadPartidosEncontrados)=>{
                                                                    if (cantidadPartidosEncontrados.length > ((cantidadEquiposEncontrados.length - 2)/2))
                                                                    return res.status(500).send({mensaje:'No puede agregar mas partidos en esta jornada, ya que los partidos actuales son: '+cantidadPartidosEncontrados.length}) 


                                                                    // Llenar los datos para el nuevo partido
                                                                    partidoModel.equipo1 = parametros.equipo1;
                                                                    partidoModel.equipo2 = parametros.equipo2;
                                                                    partidoModel.golesEquipo1 = parametros.golesEquipo1;
                                                                    partidoModel.golesEquipo2 = parametros.golesEquipo2;
                                                                    partidoModel.idJornada = parametros.idJornada;
                                                                    partidoModel.idLiga = ligaEncontrada._id;
                                                                    partidoModel.idCreadorPartido = req.user.sub;


                                                                    //Guardar el nuevo partido
                                                                    partidoModel.save((err, partidoGuardado) =>{
                                                                        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                        if(!partidoGuardado) return res.status(500).send({mensaje: "Error al guardar el partido"});

                                                                        return res.status(200).send({partido: partidoGuardado});
                                                                    });



                                                                    //Buscar para actualizar datos del equipo 1
                                                                    Equipos.findOne({nombreEquipo: parametros.equipo1}, (err, equipoEncontrado)=>{
                                                                        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                        if(!equipoEncontrado) return res.status(500).send({mensaje: "Error al encontrar el equipo"});

                                                                        // Actualizar los goles a favor y en contra del equipo 1
                                                                        Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                            {  $inc : {
                                                                                partidosJugados: 1,
                                                                                golesFavor: parametros.golesEquipo1,
                                                                                golesContra: parametros.golesEquipo2,
                                                                                diferenciaGoles: parametros.golesEquipo1 - parametros.golesEquipo2
                                                                            }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                    if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                })


                                                                        // Actualizar los puntos del equipo 1
                                                                        if(parametros.golesEquipo1 > parametros.golesEquipo2){
                                                                            Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                {  $inc : {
                                                                                    puntos: 3,
                                                                                }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                        if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                    })
                                                                        }else{
                                                                            if(parametros.golesEquipo1 == parametros.golesEquipo2){
                                                                                Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                    {  $inc : {
                                                                                        puntos: 1,
                                                                                    }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                            if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                        })
                                                                            }
                                                                        }
                                                                

                                                                    })
                                                                    
                                                                    
                                                                    //Buscar para actualizar datos del equipo 2
                                                                    Equipos.findOne({nombreEquipo: parametros.equipo2}, (err, equipoEncontrado)=>{
                                                                        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                        if(!equipoEncontrado) return res.status(500).send({mensaje: "Error al encontrar el equipo"});
                                                                    

                                                                        // Actualizar los goles a favor y encontra del equipo 2
                                                                        Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                            {  $inc : {
                                                                                partidosJugados: 1,
                                                                                golesFavor: parametros.golesEquipo2, 
                                                                                golesContra: parametros.golesEquipo1,
                                                                                diferenciaGoles: parametros.golesEquipo2 - parametros.golesEquipo1
                                                                            }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                    if(err) return res.status(500).send({mensaje: 'Erro en la peticion'});
                                                                                    if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                })

                                                                        // Actualizar los puntos del equipo 2
                                                                        if(parametros.golesEquipo2 > parametros.golesEquipo1){
                                                                            Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                {  $inc : {
                                                                                    puntos: 3,
                                                                                }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                        if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                    })
                                                                        }else{
                                                                            if(parametros.golesEquipo2 == parametros.golesEquipo1){
                                                                                Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                    {  $inc : {
                                                                                        puntos: 1,
                                                                                    }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                            if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                        })
                                                                            }
                                                                        }
                                                                    })
                                                                    
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                                
                                            })

                                        })


                                        
                                    })
                                })


                            
                            }else{ //si es impar

                                //Buscar que los nombres del equipo 1 y 2 le pertenezcan
                                Equipos.find({nombreEquipo: parametros.equipo1, idCreadorEquipo: req.user.sub}, (err, equipoPertenecienteEncontrado)=>{
                                    if (equipoPertenecienteEncontrado.length == 0)
                                    return res.status(500).send({mensaje:'El nombre del equipo 1 ingresado no fue encontrado en sus registros o talvez no le pertenece'})
                        

                                    Equipos.find({nombreEquipo: parametros.equipo2, idCreadorEquipo: req.user.sub}, (err, equipoPertenecienteEncontrado)=>{
                                        if (equipoPertenecienteEncontrado.length == 0)
                                        return res.status(500).send({mensaje:'El nombre del equipo 2 ingresado no fue encontrado en sus registros o talvez no le pertenece'})
                                    
                                    
                                        // Evitar que ingrese el mismo equipo dentro del partido (que no se enfrente a el mismo)
                                        if(parametros.equipo1 == parametros.equipo2)
                                        return res.status(500).send({mensaje: 'El equipo 1 y 2 no deben ser el mismo para poder jugar el partido'})
                                    

                                        //AQUI EMPIEZA LO NUEVO
                                        //Buscar que los equipos no se hayan enfrentado entre ellos entre las distintas jornadas (1 vs 2)
                                        Partidos.find({equipo1: parametros.equipo1, equipo2: parametros.equipo2, idCreadorPartido: req.user.sub}, (err, equipoEnPartidoEncontrado)=>{
                                            if (equipoEnPartidoEncontrado != 0)
                                            return res.status(500).send({mensaje: 'Estos equipos ya se enfrentaron en esta o en una jornada pasada'})


                                            //Buscar que los equipos no se hayan enfrentado entre ellos entre las distintas jornadas (1 y 2)
                                            Partidos.find({equipo1: parametros.equipo2, equipo2: parametros.equipo1, idCreadorPartido: req.user.sub}, (err, equipoEnPartidoEncontrado)=>{
                                                if (equipoEnPartidoEncontrado != 0)
                                                return res.status(500).send({mensaje: 'Estos equipos ya se enfrentaron en esta o en una jornada pasada'})
    
    

                                                // Buscar que el equipo 1 no haya jugado ya en la jornada (Solo puede jugar una vez)
                                                Partidos.find({equipo1: parametros.equipo1, idCreadorPartido: req.user.sub, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                    if (equipoEnPartidoEncontrado != 0)
                                                    return res.status(500).send({mensaje: 'El equipo 1 ya tiene un partido en esta jornada'})


                                                    Partidos.find({equipo2: parametros.equipo1, idCreadorPartido: req.user.sub, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                        if (equipoEnPartidoEncontrado != 0)
                                                        return res.status(500).send({mensaje: 'El equipo 1 ya tiene un partido en esta jornada'})
                                                        

                                                        //Buscar que el equipo 2 no haya jugado ya en la jornada (Solo puede jugar una vez)
                                                        Partidos.find({equipo2: parametros.equipo2, idCreadorPartido: req.user.sub, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                            if (equipoEnPartidoEncontrado != 0)
                                                            return res.status(500).send({mensaje: 'El equipo 2 ya tiene un partido en esta jornada'})

                                                            Partidos.find({equipo1: parametros.equipo2, idCreadorPartido: req.user.sub, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                if (equipoEnPartidoEncontrado != 0)
                                                                return res.status(500).send({mensaje: 'El equipo 2 ya tiene un partido en esta jornada'})

                                                                
                                                                // Buscar y encontrar la cantidad de partidos actuales en la jornada
                                                                Partidos.find({idCreadorPartido: req.user.sub, idLiga: ligaEncontrada._id, idJornada: jornadaEncontrada._id}, (err, cantidadPartidosEncontrados)=>{
                                                                    if (cantidadPartidosEncontrados.length > ((cantidadEquiposEncontrados.length - 2)/2))
                                                                    return res.status(500).send({mensaje:'No puede agregar mas partidos en esta jornada, ya que los partidos actuales son: '+cantidadPartidosEncontrados.length}) 


                                                                    // Llenar los datos para el nuevo partido
                                                                    partidoModel.equipo1 = parametros.equipo1;
                                                                    partidoModel.equipo2 = parametros.equipo2;
                                                                    partidoModel.golesEquipo1 = parametros.golesEquipo1;
                                                                    partidoModel.golesEquipo2 = parametros.golesEquipo2;
                                                                    partidoModel.idJornada = parametros.idJornada;
                                                                    partidoModel.idLiga = ligaEncontrada._id;
                                                                    partidoModel.idCreadorPartido = req.user.sub;


                                                                    //Guardar el nuevo partido
                                                                    partidoModel.save((err, partidoGuardado) =>{
                                                                        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                        if(!partidoGuardado) return res.status(500).send({mensaje: "Error al guardar el partido"});

                                                                        return res.status(200).send({partido: partidoGuardado});
                                                                    });



                                                                    //Buscar para actualizar datos del equipo 1
                                                                    Equipos.findOne({nombreEquipo: parametros.equipo1}, (err, equipoEncontrado)=>{
                                                                        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                        if(!equipoEncontrado) return res.status(500).send({mensaje: "Error al encontrar el equipo"});

                                                                        // Actualizar los goles a favor y en contra del equipo 1
                                                                        Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                            {  $inc : {
                                                                                partidosJugados: 1,
                                                                                golesFavor: parametros.golesEquipo1,
                                                                                golesContra: parametros.golesEquipo2,
                                                                                diferenciaGoles: parametros.golesEquipo1 - parametros.golesEquipo2
                                                                            }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                    if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                })


                                                                        // Actualizar los puntos del equipo 1
                                                                        if(parametros.golesEquipo1 > parametros.golesEquipo2){
                                                                            Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                {  $inc : {
                                                                                    puntos: 3,
                                                                                }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                        if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                    })
                                                                        }else{
                                                                            if(parametros.golesEquipo1 == parametros.golesEquipo2){
                                                                                Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                    {  $inc : {
                                                                                        puntos: 1,
                                                                                    }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                            if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                        })
                                                                            }
                                                                        }
                                                                

                                                                    })
                                                                    
                                                                    
                                                                    //Buscar para actualizar datos del equipo 2
                                                                    Equipos.findOne({nombreEquipo: parametros.equipo2}, (err, equipoEncontrado)=>{
                                                                        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                        if(!equipoEncontrado) return res.status(500).send({mensaje: "Error al encontrar el equipo"});
                                                                    

                                                                        // Actualizar los goles a favor y encontra del equipo 2
                                                                        Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                            {  $inc : {
                                                                                partidosJugados: 1,
                                                                                golesFavor: parametros.golesEquipo2, 
                                                                                golesContra: parametros.golesEquipo1,
                                                                                diferenciaGoles: parametros.golesEquipo2 - parametros.golesEquipo1
                                                                            }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                    if(err) return res.status(500).send({mensaje: 'Erro en la peticion'});
                                                                                    if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                })

                                                                        // Actualizar los puntos del equipo 2
                                                                        if(parametros.golesEquipo2 > parametros.golesEquipo1){
                                                                            Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                {  $inc : {
                                                                                    puntos: 3,
                                                                                }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                        if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                    })
                                                                        }else{
                                                                            if(parametros.golesEquipo2 == parametros.golesEquipo1){
                                                                                Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                    {  $inc : {
                                                                                        puntos: 1,
                                                                                    }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                            if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                        })
                                                                            }
                                                                        }
                                                                    })
                                                                    
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                                
                                            })

                                        })


                                        
                                    })
                                })

                            }
                        })


                    })
                })

                
            }
        })

    })
}


function agregarPartidoComoAdmin(req, res){
    var idUsu = req.params.idUsuario;
    var parametros = req.body;
    var partidoModel = new Partidos();

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});

    Usuarios.find({_id: idUsu, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
        if(usuarioEncontrado.length != 0){

            if(parametros.equipo1 && parametros.equipo2 && parametros.golesEquipo1 && parametros.golesEquipo2 && parametros.idJornada && parametros.nombreLiga){


                //COMIENZA

                // Buscar entre las ligas del usuario que el nombre ingresado exista
                Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: idUsu}, (err, ligaEncontrada)=>{
                    if (ligaEncontrada.length == 0)
                    return res.status(500).send({mensaje:'El nombre de la liga ingresado no fue encontrado dentro de sus ligas'})
                    

                    // Buscar y tomar el id del nombre de la liga que ingreso
                    Ligas.findOne({nombreLiga: parametros.nombreLiga, idCreadorLiga: idUsu}, (err, ligaEncontrada)=>{
                        if (ligaEncontrada.length != 0){


                            //Buscar entre las jornadas del usuario que el id ingresado exista
                            Jornadas.find({idCreadorJornada: idUsu, _id: parametros.idJornada}, (err, jornadaEncontrada)=>{
                                if(jornadaEncontrada.length == 0 )
                                return res.status(500).send({mensaje: 'El id de la jornada ingresado no fue encontrado dentro de sus jornadas'})

                                
                                // Buscar y tomar entre las jornadas el id que ingreso para ver si existe
                                Jornadas.findOne({idCreadorJornada: idUsu, _id: parametros.idJornada}, (err, jornadaEncontrada)=>{
                                    if(jornadaEncontrada.length == 0 )
                                    return res.status(500).send({mensaje: 'El id de la jornada ingresado no fue encontrado dentro de sus jornadas'})


                                    // Buscar y encontrar la cantidad de equipos para definir si es par o impar
                                    Equipos.find({idCreadorEquipo: idUsu, idLiga: ligaEncontrada._id}, (err, cantidadEquiposEncontrados)=>{
                                        if (cantidadEquiposEncontrados.length % 2 == 0){ //si es par


                                            //Buscar que los nombres del equipo 1 y 2 le pertenezcan
                                            Equipos.find({nombreEquipo: parametros.equipo1, idCreadorEquipo: idUsu}, (err, equipoPertenecienteEncontrado)=>{
                                                if (equipoPertenecienteEncontrado.length == 0)
                                                return res.status(500).send({mensaje:'El nombre del equipo 1 ingresado no fue encontrado en sus registros o talvez no le pertenece'})
                                    

                                                Equipos.find({nombreEquipo: parametros.equipo2, idCreadorEquipo: idUsu}, (err, equipoPertenecienteEncontrado)=>{
                                                    if (equipoPertenecienteEncontrado.length == 0)
                                                    return res.status(500).send({mensaje:'El nombre del equipo 2 ingresado no fue encontrado en sus registros o talvez no le pertenece'})
                                                
                                                
                                                    // Evitar que ingrese el mismo equipo dentro del partido (que no se enfrente a el mismo)
                                                    if(parametros.equipo1 == parametros.equipo2)
                                                    return res.status(500).send({mensaje: 'El equipo 1 y 2 no deben ser el mismo para poder jugar el partido'})
                                                

                                                    //AQUI EMPIEZA LO NUEVO
                                                    //Buscar que los equipos no se hayan enfrentado entre ellos entre las distintas jornadas (1 vs 2)
                                                    Partidos.find({equipo1: parametros.equipo1, equipo2: parametros.equipo2, idCreadorPartido: idUsu}, (err, equipoEnPartidoEncontrado)=>{
                                                        if (equipoEnPartidoEncontrado != 0)
                                                        return res.status(500).send({mensaje: 'Estos equipos ya se enfrentaron en esta o en una jornada pasada'})


                                                        //Buscar que los equipos no se hayan enfrentado entre ellos entre las distintas jornadas (1 y 2)
                                                        Partidos.find({equipo1: parametros.equipo2, equipo2: parametros.equipo1, idCreadorPartido: idUsu}, (err, equipoEnPartidoEncontrado)=>{
                                                            if (equipoEnPartidoEncontrado != 0)
                                                            return res.status(500).send({mensaje: 'Estos equipos ya se enfrentaron en esta o en una jornada pasada'})
                
                

                                                            // Buscar que el equipo 1 no haya jugado ya en la jornada (Solo puede jugar una vez)
                                                            Partidos.find({equipo1: parametros.equipo1, idCreadorPartido: idUsu, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                if (equipoEnPartidoEncontrado != 0)
                                                                return res.status(500).send({mensaje: 'El equipo 1 ya tiene un partido en esta jornada'})


                                                                Partidos.find({equipo2: parametros.equipo1, idCreadorPartido: idUsu, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                    if (equipoEnPartidoEncontrado != 0)
                                                                    return res.status(500).send({mensaje: 'El equipo 1 ya tiene un partido en esta jornada'})
                                                                    

                                                                    //Buscar que el equipo 2 no haya jugado ya en la jornada (Solo puede jugar una vez)
                                                                    Partidos.find({equipo2: parametros.equipo2, idCreadorPartido: idUsu, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                        if (equipoEnPartidoEncontrado != 0)
                                                                        return res.status(500).send({mensaje: 'El equipo 2 ya tiene un partido en esta jornada'})

                                                                        Partidos.find({equipo1: parametros.equipo2, idCreadorPartido: idUsu, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                            if (equipoEnPartidoEncontrado != 0)
                                                                            return res.status(500).send({mensaje: 'El equipo 2 ya tiene un partido en esta jornada'})

                                                                            
                                                                            // Buscar y encontrar la cantidad de partidos actuales en la jornada
                                                                            Partidos.find({idCreadorPartido: idUsu, idLiga: ligaEncontrada._id, idJornada: jornadaEncontrada._id}, (err, cantidadPartidosEncontrados)=>{
                                                                                if (cantidadPartidosEncontrados.length > ((cantidadEquiposEncontrados.length - 2)/2))
                                                                                return res.status(500).send({mensaje:'No puede agregar mas partidos en esta jornada, ya que los partidos actuales son: '+cantidadPartidosEncontrados.length}) 


                                                                                // Llenar los datos para el nuevo partido
                                                                                partidoModel.equipo1 = parametros.equipo1;
                                                                                partidoModel.equipo2 = parametros.equipo2;
                                                                                partidoModel.golesEquipo1 = parametros.golesEquipo1;
                                                                                partidoModel.golesEquipo2 = parametros.golesEquipo2;
                                                                                partidoModel.idJornada = parametros.idJornada;
                                                                                partidoModel.idLiga = ligaEncontrada._id;
                                                                                partidoModel.idCreadorPartido = idUsu;


                                                                                //Guardar el nuevo partido
                                                                                partidoModel.save((err, partidoGuardado) =>{
                                                                                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                                    if(!partidoGuardado) return res.status(500).send({mensaje: "Error al guardar el partido"});

                                                                                    return res.status(200).send({partido: partidoGuardado});
                                                                                });



                                                                                //Buscar para actualizar datos del equipo 1
                                                                                Equipos.findOne({nombreEquipo: parametros.equipo1}, (err, equipoEncontrado)=>{
                                                                                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                                    if(!equipoEncontrado) return res.status(500).send({mensaje: "Error al encontrar el equipo"});

                                                                                    // Actualizar los goles a favor y en contra del equipo 1
                                                                                    Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                        {  $inc : {
                                                                                            partidosJugados: 1,
                                                                                            golesFavor: parametros.golesEquipo1,
                                                                                            golesContra: parametros.golesEquipo2,
                                                                                            diferenciaGoles: parametros.golesEquipo1 - parametros.golesEquipo2
                                                                                        }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                            })


                                                                                    // Actualizar los puntos del equipo 1
                                                                                    if(parametros.golesEquipo1 > parametros.golesEquipo2){
                                                                                        Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                            {  $inc : {
                                                                                                puntos: 3,
                                                                                            }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                    if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                                })
                                                                                    }else{
                                                                                        if(parametros.golesEquipo1 == parametros.golesEquipo2){
                                                                                            Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                                {  $inc : {
                                                                                                    puntos: 1,
                                                                                                }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                        if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                                    })
                                                                                        }
                                                                                    }
                                                                            

                                                                                })
                                                                                
                                                                                
                                                                                //Buscar para actualizar datos del equipo 2
                                                                                Equipos.findOne({nombreEquipo: parametros.equipo2}, (err, equipoEncontrado)=>{
                                                                                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                                    if(!equipoEncontrado) return res.status(500).send({mensaje: "Error al encontrar el equipo"});
                                                                                

                                                                                    // Actualizar los goles a favor y encontra del equipo 2
                                                                                    Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                        {  $inc : {
                                                                                            partidosJugados: 1,
                                                                                            golesFavor: parametros.golesEquipo2, 
                                                                                            golesContra: parametros.golesEquipo1,
                                                                                            diferenciaGoles: parametros.golesEquipo2 - parametros.golesEquipo1
                                                                                        }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                                if(err) return res.status(500).send({mensaje: 'Erro en la peticion'});
                                                                                                if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                            })

                                                                                    // Actualizar los puntos del equipo 2
                                                                                    if(parametros.golesEquipo2 > parametros.golesEquipo1){
                                                                                        Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                            {  $inc : {
                                                                                                puntos: 3,
                                                                                            }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                    if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                                })
                                                                                    }else{
                                                                                        if(parametros.golesEquipo2 == parametros.golesEquipo1){
                                                                                            Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                                {  $inc : {
                                                                                                    puntos: 1,
                                                                                                }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                        if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                                    })
                                                                                        }
                                                                                    }
                                                                                })
                                                                                
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                            
                                                        })

                                                    })


                                                    
                                                })
                                            })


                                        
                                        }else{ //si es impar

                                            //Buscar que los nombres del equipo 1 y 2 le pertenezcan
                                            Equipos.find({nombreEquipo: parametros.equipo1, idCreadorEquipo: idUsu}, (err, equipoPertenecienteEncontrado)=>{
                                                if (equipoPertenecienteEncontrado.length == 0)
                                                return res.status(500).send({mensaje:'El nombre del equipo 1 ingresado no fue encontrado en sus registros o talvez no le pertenece'})
                                    

                                                Equipos.find({nombreEquipo: parametros.equipo2, idCreadorEquipo: idUsu}, (err, equipoPertenecienteEncontrado)=>{
                                                    if (equipoPertenecienteEncontrado.length == 0)
                                                    return res.status(500).send({mensaje:'El nombre del equipo 2 ingresado no fue encontrado en sus registros o talvez no le pertenece'})
                                                
                                                
                                                    // Evitar que ingrese el mismo equipo dentro del partido (que no se enfrente a el mismo)
                                                    if(parametros.equipo1 == parametros.equipo2)
                                                    return res.status(500).send({mensaje: 'El equipo 1 y 2 no deben ser el mismo para poder jugar el partido'})
                                                

                                                    //AQUI EMPIEZA LO NUEVO
                                                    //Buscar que los equipos no se hayan enfrentado entre ellos entre las distintas jornadas (1 vs 2)
                                                    Partidos.find({equipo1: parametros.equipo1, equipo2: parametros.equipo2, idCreadorPartido: idUsu}, (err, equipoEnPartidoEncontrado)=>{
                                                        if (equipoEnPartidoEncontrado != 0)
                                                        return res.status(500).send({mensaje: 'Estos equipos ya se enfrentaron en esta o en una jornada pasada'})


                                                        //Buscar que los equipos no se hayan enfrentado entre ellos entre las distintas jornadas (1 y 2)
                                                        Partidos.find({equipo1: parametros.equipo2, equipo2: parametros.equipo1, idCreadorPartido: idUsu}, (err, equipoEnPartidoEncontrado)=>{
                                                            if (equipoEnPartidoEncontrado != 0)
                                                            return res.status(500).send({mensaje: 'Estos equipos ya se enfrentaron en esta o en una jornada pasada'})
                
                

                                                            // Buscar que el equipo 1 no haya jugado ya en la jornada (Solo puede jugar una vez)
                                                            Partidos.find({equipo1: parametros.equipo1, idCreadorPartido: idUsu, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                if (equipoEnPartidoEncontrado != 0)
                                                                return res.status(500).send({mensaje: 'El equipo 1 ya tiene un partido en esta jornada'})


                                                                Partidos.find({equipo2: parametros.equipo1, idCreadorPartido: idUsu, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                    if (equipoEnPartidoEncontrado != 0)
                                                                    return res.status(500).send({mensaje: 'El equipo 1 ya tiene un partido en esta jornada'})
                                                                    

                                                                    //Buscar que el equipo 2 no haya jugado ya en la jornada (Solo puede jugar una vez)
                                                                    Partidos.find({equipo2: parametros.equipo2, idCreadorPartido: idUsu, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                        if (equipoEnPartidoEncontrado != 0)
                                                                        return res.status(500).send({mensaje: 'El equipo 2 ya tiene un partido en esta jornada'})

                                                                        Partidos.find({equipo1: parametros.equipo2, idCreadorPartido: idUsu, idJornada: parametros.idJornada}, (err, equipoEnPartidoEncontrado)=>{
                                                                            if (equipoEnPartidoEncontrado != 0)
                                                                            return res.status(500).send({mensaje: 'El equipo 2 ya tiene un partido en esta jornada'})

                                                                            
                                                                            // Buscar y encontrar la cantidad de partidos actuales en la jornada
                                                                            Partidos.find({idCreadorPartido: idUsu, idLiga: ligaEncontrada._id, idJornada: jornadaEncontrada._id}, (err, cantidadPartidosEncontrados)=>{
                                                                                if (cantidadPartidosEncontrados.length > ((cantidadEquiposEncontrados.length - 2)/2))
                                                                                return res.status(500).send({mensaje:'No puede agregar mas partidos en esta jornada, ya que los partidos actuales son: '+cantidadPartidosEncontrados.length}) 


                                                                                // Llenar los datos para el nuevo partido
                                                                                partidoModel.equipo1 = parametros.equipo1;
                                                                                partidoModel.equipo2 = parametros.equipo2;
                                                                                partidoModel.golesEquipo1 = parametros.golesEquipo1;
                                                                                partidoModel.golesEquipo2 = parametros.golesEquipo2;
                                                                                partidoModel.idJornada = parametros.idJornada;
                                                                                partidoModel.idLiga = ligaEncontrada._id;
                                                                                partidoModel.idCreadorPartido = idUsu;


                                                                                //Guardar el nuevo partido
                                                                                partidoModel.save((err, partidoGuardado) =>{
                                                                                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                                    if(!partidoGuardado) return res.status(500).send({mensaje: "Error al guardar el partido"});

                                                                                    return res.status(200).send({partido: partidoGuardado});
                                                                                });



                                                                                //Buscar para actualizar datos del equipo 1
                                                                                Equipos.findOne({nombreEquipo: parametros.equipo1}, (err, equipoEncontrado)=>{
                                                                                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                                    if(!equipoEncontrado) return res.status(500).send({mensaje: "Error al encontrar el equipo"});

                                                                                    // Actualizar los goles a favor y en contra del equipo 1
                                                                                    Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                        {  $inc : {
                                                                                            partidosJugados: equipoEncontrado.partidosJugados *1,
                                                                                            golesFavor: parametros.golesEquipo1,
                                                                                            golesContra: parametros.golesEquipo2,
                                                                                            diferenciaGoles: parametros.golesEquipo1 - parametros.golesEquipo2
                                                                                        }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                            })


                                                                                    // Actualizar los puntos del equipo 1
                                                                                    if(parametros.golesEquipo1 > parametros.golesEquipo2){
                                                                                        Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                            {  $inc : {
                                                                                                puntos: equipoEncontrado.puntos *3,
                                                                                            }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                    if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                                })
                                                                                    }else{
                                                                                        if(parametros.golesEquipo1 == parametros.golesEquipo2){
                                                                                            Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo1},
                                                                                                {  $inc : {
                                                                                                    puntos: equipoEncontrado.puntos *1,
                                                                                                }}, {new: true}, (err, equipo1Modificado)=>{
                                                                                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                        if(!equipo1Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 1'});
                                                                                                    })
                                                                                        }
                                                                                    }
                                                                            

                                                                                })
                                                                                
                                                                                
                                                                                //Buscar para actualizar datos del equipo 2
                                                                                Equipos.findOne({nombreEquipo: parametros.equipo2}, (err, equipoEncontrado)=>{
                                                                                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                                                                                    if(!equipoEncontrado) return res.status(500).send({mensaje: "Error al encontrar el equipo"});
                                                                                

                                                                                    // Actualizar los goles a favor y encontra del equipo 2
                                                                                    Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                        {  $inc : {
                                                                                            partidosJugados: equipoEncontrado.partidosJugados *1,
                                                                                            golesFavor: parametros.golesEquipo2, 
                                                                                            golesContra: parametros.golesEquipo1,
                                                                                            diferenciaGoles: parametros.golesEquipo2 - parametros.golesEquipo1
                                                                                        }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                                if(err) return res.status(500).send({mensaje: 'Erro en la peticion'});
                                                                                                if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                            })

                                                                                    // Actualizar los puntos del equipo 2
                                                                                    if(parametros.golesEquipo2 > parametros.golesEquipo1){
                                                                                        Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                            {  $inc : {
                                                                                                puntos: equipoEncontrado.puntos *3,
                                                                                            }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                    if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                                })
                                                                                    }else{
                                                                                        if(parametros.golesEquipo2 == parametros.golesEquipo1){
                                                                                            Equipos.findOneAndUpdate({nombreEquipo: parametros.equipo2},
                                                                                                {  $inc : {
                                                                                                    puntos: equipoEncontrado.puntos *1,
                                                                                                }}, {new: true}, (err, equipo2Modificado)=>{
                                                                                                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                                                                                                        if(!equipo2Modificado) return res.status(404).send({mensaje: 'No se pudo modificar el equipo 2'});
                                                                                                    })
                                                                                        }
                                                                                    }
                                                                                })
                                                                                
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                            
                                                        })

                                                    })


                                                    
                                                })
                                            })

                                        }
                                    })


                                })
                            })

                            
                        }
                    })

                })

                //TERMINA


            }else{
                return res.status(404).send({mensaje: "Debe llenar todos los campos necesarios para poder agregar un nuevo partido y los respectivos resultados"});
            }

        }else{
            return res.status(404).send({mensaje: "No puede agregarle un partido a un Administrador, solo a los usuarios"});
        }
    })
}


module.exports = {
    agregarPartido,
    agregarPartidoComoAdmin
}