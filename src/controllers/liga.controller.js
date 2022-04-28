const Ligas = require('../models/liga.model');

const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* AGREGAR LIGA (PENDIENTE) */
function agregarLiga(req, res){
    var parametros = req.body;
    var ligaModel = new Ligas();

    // IF PARA QUE SOLO LOS USUARIOS PUEDAN CREAR LIGAS (PENDIENTE AUN)

    if(parametros.nombreLiga){
        ligaModel.nombreLiga = parametros.nombreLiga;
        ligaModel.idCreadorLiga = req.user.sub;

        Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
            if (ligaEncontrada.length == 0){

                ligaModel.save((err, ligaGuardada) =>{
                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                    if(!ligaGuardada) return res.status(500).send({mensaje: "Error al guardar la liga"});

                    return res.status(200).send({liga: ligaGuardada});
                });
            }else{
                return res.status(500).send({mensaje:'Este nombre de liga ya se encuentra registrado'})
            }
        })
    }else{
        return res.status(500).send({mensaje:'Debe llenar todos los campos necesarios'})
    }

}


/* EDITAR LIGA (PENDIENTE)*/
function editarLiga(req, res){
    var idLig = req.params.idLiga;
    var parametros = req.body;

    // IF PARA QUE SOLO LOS USUARIOS PUEDAN EDITAR LIGAS (PENDIENTE AUN)
    /*if ( 'USUARIO' !== req.user.rol ) return res.status(500)
    .send({ mensaje: 'Solos los usuarios pueden editar las ligas'});*/

    // POSIBLEMENTE UN IF ELSE POR SI ES ADMIN Y NO NECESITA VERIFICAR SI LE PERTENECE O NO


    Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
        if (ligaEncontrada.length == 0){

            Ligas.findOneAndUpdate({_id:idLig, idCreadorLiga: req.user.sub}, parametros, {new: true} ,(err, ligaActualizada) => {
                if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!ligaActualizada) return res.status(404).send({mensaje: "Error al editar la liga, o intento modificar la liga de otro usuario"});

                return res.status(200).send({liga: ligaActualizada});
            })
        }else{
            return res.status(500).send({mensaje:'Este nombre de liga ya se encuentra registrado'})
        }
    })

}


/* ELIMINAR LIGA (PENDIENTE)*/
function eliminarLiga(req, res){

    var idLig = req.params.idLiga;

    // IF PARA QUE SOLO LOS USUARIOS PUEDAN ELIMINAR LIGAS (PENDIENTE AUN)
    /*if ( 'USUARIO' !== req.user.rol ) return res.status(500)
    .send({ mensaje: 'Solos los usuarios pueden eliminar las ligas'});*/

    Ligas.findOneAndDelete({_id:idLig, idCreadorLiga: req.user.sub},(err, ligaEliminada) => {
        if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
        if (!ligaEliminada) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar una liga que no le pertenece'});

        return res.status(200).send({liga: ligaEliminada});
    })

}


/* VER LIGA (PENDIENTE)*/
function verLiga(req, res){
    var idLig = req.params.idLiga;

    // IF PARA QUE SOLO LOS USUARIOS PUEDAN VER LIGAS (PENDIENTE AUN)
    /*if ( 'USUARIO' !== req.user.rol ) return res.status(500)
    .send({ mensaje: 'Solos los usuarios pueden ver las ligas'});*/

    Ligas.findOne({_id:idLig, idCreadorLiga: req.user.sub}, (err, ligaEncontrada) => {
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!ligaEncontrada) return res.status(404).send({mensaje: "Ocurrio un error o intento ver una liga que no le pertenece"});

        return res.status(200).send({liga: ligaEncontrada});
    })
}


module.exports = {
    agregarLiga,
    editarLiga,
    eliminarLiga,
    verLiga
}


/* PENDIENTE = EN GENERAL AGREGARLE UN IF ELSE EN DONDE EL ADMINISTRADOR NO TENGA RESTRICCIONES Y PUEDA MODIFICAR LA LIGAS DE TODOS */