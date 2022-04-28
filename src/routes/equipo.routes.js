const { application } = require('express');
const express = require('express');
const equipoControlador = require('../controllers/equipo.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/agregarEquipo', md_autenticacion.Auth, equipoControlador.agregarEquipo);
api.put('/editarEquipo/:idEquipo', md_autenticacion.Auth, equipoControlador.editarEquipo);
api.delete('/eliminarEquipo/:idEquipo', md_autenticacion.Auth, equipoControlador.eliminarEquipo);
api.get('/verEquiposLiga/:idLiga', md_autenticacion.Auth, equipoControlador.verEquiposLiga);

module.exports = api;