const { application } = require('express');
const express = require('express');
const equipoControlador = require('../controllers/equipo.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/agregarEquipo', md_autenticacion.Auth, equipoControlador.agregarEquipo);
api.put('/editarEquipo/:idEquipo', md_autenticacion.Auth, equipoControlador.editarEquipo);
api.delete('/eliminarEquipo/:idEquipo', md_autenticacion.Auth, equipoControlador.eliminarEquipo);
api.get('/verEquiposLiga/:idLiga', md_autenticacion.Auth, equipoControlador.verEquiposLiga);


/* Funciones de Administrador con respecto a los equipos de todos los usuarios normales */
api.post('/agregarEquipoComoAdmin/:idUsuario', md_autenticacion.Auth, equipoControlador.agregarEquipoComoAdmin);
api.put('/editarEquipoComoAdmin/:idEquipo', md_autenticacion.Auth, equipoControlador.editarEquipoComoAdmin);
api.delete('/eliminarEquipoComoAdmin/:idEquipo', md_autenticacion.Auth, equipoControlador.eliminarEquipoComoAdmin);
api.get('/verEquiposLigaComoAdmin/:idLiga', md_autenticacion.Auth, equipoControlador.verEquiposLigaComoAdmin);


module.exports = api;