const Equipos = require('../models/equipo.model');
const Ligas = require('../models/liga.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* AGREGAR EQUIPO (PENDIENTE)*/
function agregarEquipo(req, res){
    var parametros = req.body;
    var equipoModel = new Equipos();

    // IF PARA QUE LOS ADMINS NO TENGAN RESTRICCIONES O BIEN QUE NO TENGAN ACCESO

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
                            return res.status(500).send({mensaje:'Este nombre de equipo ya se encuentra registrado'})
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


/* EDITAR EQUIPO (PENDIENTE) */
function editarEquipo(req, res){
    var idEqui = req.params.idEquipo;
    var parametros = req.body;

    // IF PARA QUE LOS ADMINS NO TENGAN RESTRICCIONES O BIEN QUE NO TENGAN ACCESO

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
            return res.status(500).send({mensaje:'Este nombre de equipo ya se encuentra registrado'})
        }
    })
}


/* ELIMINAR EQUIPO (PENDIENTE) */
function eliminarEquipo(req, res){
    var idEqui = req.params.idEquipo;

    // IF PARA QUE LOS ADMINS NO TENGAN RESTRICCIONES O BIEN QUE NO TENGAN ACCESO

    Equipos.findOneAndDelete({_id:idEqui, idCreadorEquipo: req.user.sub},(err, equipoEliminado) => {
        if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
        if (!equipoEliminado) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar un equipo que no le pertenece'});

        return res.status(200).send({liga: equipoEliminado});
    })
}

/* VER EQUIPOS POR LIGAS (PENDIENTE)*/
function verEquiposLiga(req,res){
    var idLig = req.params.idLiga;

    // IF PARA QUE LOS ADMINS NO TENGAN RESTRICCIONES O BIEN QUE NO TENGAN ACCESO

    Equipos.find({idCreadorEquipo: req.user.sub, idLiga: idLig}, (err, equiposEncontrados)=>{
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!equiposEncontrados) return res.status(404).send({mensaje: "Ocurrio un error"});
        if(equiposEncontrados.length == 0) return res.status(500).send({mensaje: 'Aun no tiene equipos en la liga o intento ver los equipos de una liga que no le pertenece'})

        return res.status(200).send({equipos: equiposEncontrados});
    })
}

module.exports = {
    agregarEquipo,
    editarEquipo,
    eliminarEquipo,
    verEquiposLiga
}
