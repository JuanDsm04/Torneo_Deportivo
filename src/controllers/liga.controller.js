const Ligas = require('../models/liga.model');
const Usuarios = require('../models/usuario.model');
const Equipos = require('../models/equipo.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* AGREGAR LIGA (PARA ADMINISTRADORES Y USUARIOS) */
function agregarLiga(req, res){
    var parametros = req.body;
    var ligaModel = new Ligas();

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
                return res.status(500).send({mensaje:'Este nombre de liga ya se encuentra utilizado dentro de sus ligas'})
            }
        })
    }else{
        return res.status(500).send({mensaje:'Debe llenar todos los campos necesarios'})
    }

}


/* AGREGARLE UNA LIGA A UN USUARIO (Siendo Administrador y supervisando) */
function agregarLigaComoAdmin(req, res){
    var parametros = req.body;
    var ligaModel = new Ligas();
    var idUsu = req.params.idUsuario;


    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});


    if(parametros.nombreLiga){
        ligaModel.nombreLiga = parametros.nombreLiga;
        ligaModel.idCreadorLiga = idUsu;

        Usuarios.find({_id: idUsu, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){
                
                Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: idUsu}, (err, ligaEncontrada)=>{
                    if (ligaEncontrada.length == 0){
        
                        ligaModel.save((err, ligaGuardada) =>{
                            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                            if(!ligaGuardada) return res.status(500).send({mensaje: "Error al guardar la liga"});
        
                            return res.status(200).send({liga: ligaGuardada});
                        });
                    }else{
                        return res.status(500).send({mensaje:'Este nombre de liga ya se encuentra utilizado dentro del usuario en el que lo quiere agregar'})
                    }
                })

            }else{
                return res.status(404).send({mensaje: "No puede agregarle una liga a un administrador, solo a los usuarios"});
            }
            
        })

    }else{
        return res.status(500).send({mensaje:'Debe llenar todos los campos necesarios'})
    }

}


/* EDITAR LIGA (PARA ADMINISTRADORES Y USUARIOS)*/
function editarLiga(req, res){
    var idLig = req.params.idLiga;
    var parametros = req.body;

    Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
        if (ligaEncontrada.length == 0){

            Ligas.findOneAndUpdate({_id:idLig, idCreadorLiga: req.user.sub}, parametros, {new: true} ,(err, ligaActualizada) => {
                if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!ligaActualizada) return res.status(404).send({mensaje: "Error al editar la liga, o intento modificar la liga de otro usuario"});

                return res.status(200).send({liga: ligaActualizada});
            })
        }else{
            return res.status(500).send({mensaje:'Este nombre de liga ya se encuentra registrado dentro de sus ligas'})
        }
    })

}


/* EDITARLE UNA LIGA A UN USUARIO (Siendo Administrador y supervisando)  */
function editarLigaComoAdmin(req, res){
    var idLig = req.params.idLiga;
    var parametros = req.body;

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});


    Usuarios.find({_id: parametros.idUsuario, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
        if(usuarioEncontrado.length != 0){

            if(parametros.idUsuario){

                Ligas.find({nombreLiga: parametros.nombreLiga, idCreadorLiga: parametros.idUsuario}, (err, ligaEncontrada)=>{
                    if (ligaEncontrada.length == 0){

                        Ligas.findOneAndUpdate({_id:idLig, idCreadorLiga: parametros.idUsuario}, parametros, {new: true} ,(err, ligaActualizada) => {
                            if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                            if(!ligaActualizada) return res.status(404).send({mensaje: "Error al editar la liga, o intento modificar la liga de otro usuario diferente al ingresado"});

                            return res.status(200).send({liga: ligaActualizada});
                        })
                    }else{
                        return res.status(500).send({mensaje:'Este nombre de liga ya se encuentra registrado dentro de sus ligas'})
                    }
                })
            }else{
                return res.status(500).send({mensaje:'Debe llenar todos los campos necesarios, asi como lo es el id del usuario dueño de la liga a editar'})
            }
        }else{
            return res.status(404).send({mensaje: "No puede editarle una liga a un administrador, solo a los usuarios"});
        }
    })

}


/* ELIMINAR LIGA (PARA ADMINISTRADORES Y USARIOS)*/
function eliminarLiga(req, res){

    var idLig = req.params.idLiga;

    Ligas.findOneAndDelete({_id:idLig, idCreadorLiga: req.user.sub},(err, ligaEliminada) => {
        if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
        if (!ligaEliminada) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar una liga que no le pertenece'});

        return res.status(200).send({liga: ligaEliminada});
    })
    
}


/* ELIMINARLE UNA LIGA A UN USUARIO (Siendo Administrador y supervisando) */
function eliminarLigaComoAdmin(req, res){
    var idLig = req.params.idLiga;
    var parametros = req.body;

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});

    if(parametros.idUsuario){
        Usuarios.find({_id: parametros.idUsuario, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){
    
                Ligas.findOneAndDelete({_id:idLig, idCreadorLiga: parametros.idUsuario},(err, ligaEliminada) => {
                    if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
                    if (!ligaEliminada) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar una liga que no le pertenece al usuario ingresado'});
    
                    return res.status(200).send({liga: ligaEliminada});
                })
            }else{
                return res.status(404).send({mensaje: "No puede eliminarle una liga a un administrador, solo a los usuarios"});
            }
        })
    }else{
        return res.status(404).send({mensaje: "Debe ingresar el id del usuario al que le pertenece la liga a editar"});
    }

}


/* VER LIGA (PARA ADMINISTRADORES Y USUARIOS)*/
function verLiga(req, res){
    var idLig = req.params.idLiga;

    Ligas.findOne({_id:idLig, idCreadorLiga: req.user.sub}, (err, ligaEncontrada) => {
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!ligaEncontrada) return res.status(404).send({mensaje: "Ocurrio un error o intento ver una liga que no le pertenece"});

        return res.status(200).send({liga: ligaEncontrada});
    })

}


/* VERLE UNA LIGA A UN USUARIO (Siendo Administrador y supervisando) */
function verLigaComoAdmin(req, res){
    var idLig = req.params.idLiga;
    var parametros = req.body;

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});

    if(parametros.idUsuario){
        Usuarios.find({_id: parametros.idUsuario, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){
    
                Ligas.findOne({_id:idLig, idCreadorLiga: parametros.idUsuario}, (err, ligaEncontrada) => {
                    if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!ligaEncontrada) return res.status(404).send({mensaje: "Ocurrio un error o intento ver una liga que no le pertenece al usuario ingresado"});
    
                    return res.status(200).send({liga: ligaEncontrada});
                })
    
            }else{
                return res.status(404).send({mensaje: "No puede ver una liga de un administrador, solo las de los usuarios"});
            }
        })
    }else{
        return res.status(404).send({mensaje: "Debe ingresar el id del usuario al que le pertenece la liga a ver"});
    }
    
}


/* VER PUNTEO DE LOS EQUIPOS POR LIGAS */
function resultadosLiga(req, res){
    var idLig = req.params.idLiga;

    Equipos.find({idCreadorEquipo: req.user.sub, idLiga: idLig},
    {"_id":0,"nombreEquipo":1, "puntos":1, "golesFavor":1, "golesContra":1, "diferenciaGoles":1, "partidosJugados":1}, 
    (err, equiposEncontrados)=>{
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!equiposEncontrados) return res.status(404).send({mensaje: "Ocurrio un error"});
        if(equiposEncontrados.length == 0) return res.status(500).send({mensaje: 'Aun no tiene equipos en la liga o intento ver los equipos de una liga que no le pertenece'})

        return res.status(200).send({equipos: equiposEncontrados});
        
    }).sort( { puntos: -1 }).limit(10)
}


/* VER LOS PUNTEOS DE LOS EQUIPOS POR LIGAS COMO ADMINISTRADOR GENERAL */
function resultadosLigaComoAdmin(req, res){
    var idLig = req.params.idLiga;

    var parametros = req.body;

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});

    if(parametros.idUsuario){
        Usuarios.find({_id: parametros.idUsuario, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){

                Equipos.find({idCreadorEquipo: parametros.idUsuario, idLiga: idLig},
                    {"_id":0,"nombreEquipo":1, "puntos":1, "golesFavor":1, "golesContra":1, "diferenciaGoles":1, "partidosJugados":1}, 
                    (err, equiposEncontrados)=>{
                        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!equiposEncontrados) return res.status(404).send({mensaje: "Ocurrio un error"});
                        if(equiposEncontrados.length == 0) return res.status(500).send({mensaje: 'El usuario elegido un no tiene equipos en la liga o intento ver los equipos de una liga que no le pertenece al usuario elegido'})
                
                        return res.status(200).send({equipos: equiposEncontrados});
                        
                    }).sort( { puntos: -1 }).limit(10)

            }else{
                return res.status(404).send({mensaje: "No puede ver los resultados de una liga de un administrador, solo las de los usuarios"});
            }
        })

    }else{
        return res.status(404).send({mensaje: "Debe ingresar el id del usuario al que le pertenece la liga de la cual quiere ver los resultados"});
    }
}


/* GENERAR UN PDF TABLA CON LOS RESULTADOS DE LA LIGA */
function crearPDF(req, res) { 
    var idLig = req.params.idLiga;
    const fs = require('fs');

    const Pdfmake = require('pdfmake');

    var fonts = {
        Roboto: {
            normal: './fonts/roboto/Roboto-Regular.ttf',
            bold: './fonts/roboto/Roboto-Medium.ttf',
            italics: './fonts/roboto/Roboto-Italic.ttf',
            bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
        }
    };

    let pdfmake = new Pdfmake(fonts);

    Equipos.find({ idCreadorEquipo: req.user.sub, idLiga: idLig }, (err, equiposObtenidos) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!equiposObtenidos) return res.status(500).send({ mensaje: "Error al obtener los equipos"});

        Ligas.find({idLiga: idLig, idCreadorLiga: req.user.sub}, (err, ligaEncontrada)=>{
            
            Ligas.findById(idLig, (err, ligaEncontrada)=>{
                var nombreLiga = ligaEncontrada.nombreLiga;

                for(let i = 0; i < equiposObtenidos.length; i++){
                    let content = [      
                    ]
    
                    content.push({
                        text: "Reporte de la Liga"+ "\n"+nombreLiga,
                        alignment: 'center',
                        fontSize: 28,
                        color: '#1A5276',
                        bold: true,
                        italics: true,
                    })
    
                    content.push({
                        text: "\n"+"\n"+'------------------------------------------------------------------------------------------------------------------'+"\n",
                        color: '#1A5276',
                        bold: true,
                    })
    
                    content.push({
                        columns: [
                            {
                              width: '16%',
                              fontSize: 11,
                              alignment: 'center',
                              text: 'Equipo'
                            },
                            {
                              width: '16%',
                              fontSize: 11,
                              alignment: 'center',
                              text: 'Goles a'+'\n'+ 'Favor'
                            },
                            {
                              width: '16%',
                              fontSize: 11,
                              alignment: 'center',
                              text: 'Goles en Contra'
                            },
                            {
                              width: '16%',
                              fontSize: 11,
                              alignment: 'center',
                              text: 'Diferencia de Goles'
                            },
                            {
                              width: '16%',
                              fontSize: 11,
                              alignment: 'center',
                              text: 'Partidos Jugados'
                            },
                            {
                              width: '16%',
                              fontSize: 11,
                              alignment: 'center',
                              text: 'Puntos'
                            }
                          ],
                    })
        
                    content.push({
                        text: '------------------------------------------------------------------------------------------------------------------'+"\n"+"\n",
                        color: '#1A5276',
                        bold: true,
                    })
        
                    for(let i = 0; i < equiposObtenidos.length; i++){
        
                        content.push({
                            columns: [
                                {
                                  width: '16%',
                                  fontSize: 10,
                                  text: equiposObtenidos[i].nombreEquipo
                                },
                                {
                                  width: '16%',
                                  fontSize: 10,
                                  alignment: 'center',
                                  text: equiposObtenidos[i].golesFavor
                                },
                                {
                                  width: '16%',
                                  fontSize: 10,
                                  alignment: 'center',
                                  text: equiposObtenidos[i].golesContra
                                },
                                {
                                  width: '16%',
                                  fontSize: 10,
                                  alignment: 'center',
                                  text: equiposObtenidos[i].diferenciaGoles
                                },
                                {
                                  width: '16%',
                                  fontSize: 10,
                                  alignment: 'center',
                                  text: equiposObtenidos[i].partidosJugados
                                },
                                {
                                  width: '16%',
                                  fontSize: 10,
                                  alignment: 'center',
                                  text: equiposObtenidos[i].puntos
                                }
                              ]
                        })
        
                        content.push({
                            text: '___________________________________________________________________________________'+"\n"+"\n",
                            color: '#154360',
                        })
                    }
        
                    let footerPdf = {
                        background: function () {
                            return {
                                canvas: [
                                    {
                                        color: '#1A5276',
                                        type: 'rect',
                                        x: 0, y: 0, w: 595, h: 45
                                        
                                    },
                                    {
                                        color: '#AED6F1',
                                        type: 'rect',
                                        x: 0, y: 20, w: 595, h: 100
                                        
                                    }
                                ]
                            };
                        },
                        footer: {
                            margin: [72, 0, 72, 0],
                            fontSize: 10,
                            color: '#1A5276',
                            columns: [{
                                    with: 'auto',
                                    alignment: 'left',
                                    text: '____________________________________________________________________________________________________' +"\n" +
                                    'Información perteneciente a la liga ©' + nombreLiga
                                }
                
                            ],
                        },
        
                        content: content,
                        pageMargins: [72, 41, 72, 70],
                    }
                
                    pdfDoc = pdfmake.createPdfKitDocument(footerPdf, {});
                    pdfDoc.pipe(fs.createWriteStream('pdfs/reporte'+nombreLiga+'.pdf'));
                    pdfDoc.end();
                    return res.status(200).send({ mensaje: 'Archivo pdf generado correctamente' });
                }

            })

            
            
        })
    }).sort( { puntos: -1 }).limit(10)
}


/* GENERAR UN PDF TABLA CON LOS RESULTADOS DE LA LIGA QUE QUIERA, DEL USUARIO QUE QUIERA (FUNCION DE ADMINISTRADOR) */
function crearPDFComoAdmin(req, res) { 
    var idLig = req.params.idLiga;
    var parametros = req.body;
    const fs = require('fs');

    const Pdfmake = require('pdfmake');

    var fonts = {
        Roboto: {
            normal: './fonts/roboto/Roboto-Regular.ttf',
            bold: './fonts/roboto/Roboto-Medium.ttf',
            italics: './fonts/roboto/Roboto-Italic.ttf',
            bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
        }
    };

    let pdfmake = new Pdfmake(fonts);

    if(req.user.rol == 'USUARIO')
    return res.status(404).send({mensaje: "Solo los administradores tienen acceso a este apartado"});


    if(parametros.idUsuario){
        Usuarios.find({_id: parametros.idUsuario, rol: 'USUARIO'},(err, usuarioEncontrado)=>{
            if(usuarioEncontrado.length != 0){

                Equipos.find({ idCreadorEquipo: parametros.idUsuario, idLiga: idLig }, (err, equiposObtenidos) => {
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if(!equiposObtenidos) return res.status(500).send({ mensaje: "Error al obtener los equipos"});
            
                    Ligas.find({idLiga: idLig, idCreadorLiga: parametros.idUsuario}, (err, ligaEncontrada)=>{
                        if(!ligaEncontrada) return res.status(500).send({ mensaje: "Error al obtener la liga"});

                        Ligas.findById(idLig, (err, ligaEncontrada)=>{
                            var nombreLiga = ligaEncontrada.nombreLiga;

                            for(let i = 0; i < equiposObtenidos.length; i++){
                                let content = [      
                                ]
                
                                content.push({
                                    text: "Reporte de la Liga"+ "\n"+nombreLiga,
                                    alignment: 'center',
                                    fontSize: 28,
                                    color: '#1A5276',
                                    bold: true,
                                    italics: true,
                                })
                
                                content.push({
                                    text: "\n"+"\n"+'------------------------------------------------------------------------------------------------------------------'+"\n",
                                    color: '#1A5276',
                                    bold: true,
                                })
                
                                content.push({
                                    columns: [
                                        {
                                          width: '16%',
                                          fontSize: 11,
                                          alignment: 'center',
                                          text: 'Equipo'
                                        },
                                        {
                                          width: '16%',
                                          fontSize: 11,
                                          alignment: 'center',
                                          text: 'Goles a'+'\n'+ 'Favor'
                                        },
                                        {
                                          width: '16%',
                                          fontSize: 11,
                                          alignment: 'center',
                                          text: 'Goles en Contra'
                                        },
                                        {
                                          width: '16%',
                                          fontSize: 11,
                                          alignment: 'center',
                                          text: 'Diferencia de Goles'
                                        },
                                        {
                                          width: '16%',
                                          fontSize: 11,
                                          alignment: 'center',
                                          text: 'Partidos Jugados'
                                        },
                                        {
                                          width: '16%',
                                          fontSize: 11,
                                          alignment: 'center',
                                          text: 'Puntos'
                                        }
                                      ],
                                })
                    
                                content.push({
                                    text: '------------------------------------------------------------------------------------------------------------------'+"\n"+"\n",
                                    color: '#1A5276',
                                    bold: true,
                                })
                    
                                for(let i = 0; i < equiposObtenidos.length; i++){
                    
                                    content.push({
                                        columns: [
                                            {
                                              width: '16%',
                                              fontSize: 10,
                                              text: equiposObtenidos[i].nombreEquipo
                                            },
                                            {
                                              width: '16%',
                                              fontSize: 10,
                                              alignment: 'center',
                                              text: equiposObtenidos[i].golesFavor
                                            },
                                            {
                                              width: '16%',
                                              fontSize: 10,
                                              alignment: 'center',
                                              text: equiposObtenidos[i].golesContra
                                            },
                                            {
                                              width: '16%',
                                              fontSize: 10,
                                              alignment: 'center',
                                              text: equiposObtenidos[i].diferenciaGoles
                                            },
                                            {
                                              width: '16%',
                                              fontSize: 10,
                                              alignment: 'center',
                                              text: equiposObtenidos[i].partidosJugados
                                            },
                                            {
                                              width: '16%',
                                              fontSize: 10,
                                              alignment: 'center',
                                              text: equiposObtenidos[i].puntos
                                            }
                                          ]
                                    })
                    
                                    content.push({
                                        text: '___________________________________________________________________________________'+"\n"+"\n",
                                        color: '#154360',
                                    })
                                }
                    
                                let footerPdf = {
                                    background: function () {
                                        return {
                                            canvas: [
                                                {
                                                    color: '#1A5276',
                                                    type: 'rect',
                                                    x: 0, y: 0, w: 595, h: 45
                                                    
                                                },
                                                {
                                                    color: '#AED6F1',
                                                    type: 'rect',
                                                    x: 0, y: 20, w: 595, h: 100
                                                    
                                                }
                                            ]
                                        };
                                    },
                                    footer: {
                                        margin: [72, 0, 72, 0],
                                        fontSize: 10,
                                        color: '#1A5276',
                                        columns: [{
                                                with: 'auto',
                                                alignment: 'left',
                                                text: '____________________________________________________________________________________________________' +"\n" +
                                                'Información perteneciente a la liga ©' + nombreLiga
                                            }
                            
                                        ],
                                    },
                    
                                    content: content,
                                    pageMargins: [72, 41, 72, 70],
                                }
                            
                                pdfDoc = pdfmake.createPdfKitDocument(footerPdf, {});
                                pdfDoc.pipe(fs.createWriteStream('pdfs/reporteAdmin'+nombreLiga+'.pdf'));
                                pdfDoc.end();
                                return res.status(200).send({ mensaje: 'Archivo pdf generado correctamente' });
                            }
                        })
                        
                    })
                }).sort( { puntos: -1 }).limit(10)

            }else{
                return res.status(404).send({mensaje: "No puede hacer un pdf de la tabla de resultados con la liga de un administrador, solo las de los usuarios"});
            }
        })

    }else{
        return res.status(404).send({mensaje: "Debe ingresar el id del usuario al que le pertenece la liga de la cual quiere generar la tabla en pdf de los resultados"});
    }
}



module.exports = {
    agregarLiga,
    editarLiga,
    eliminarLiga,
    verLiga,
    resultadosLiga,
    crearPDF,


    agregarLigaComoAdmin,
    editarLigaComoAdmin,
    eliminarLigaComoAdmin,
    verLigaComoAdmin,
    resultadosLigaComoAdmin,
    crearPDFComoAdmin
}