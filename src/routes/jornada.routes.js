const { application } = require('express');
const express = require('express');
const jornadaControlador = require('../controllers/jornada.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/agregarJornada', md_autenticacion.Auth, jornadaControlador.agregarJornada);
api.post('/agregarJornadaComoAdmin/:idUsuario', md_autenticacion.Auth, jornadaControlador.agregarJornadaComoAdmin);

module.exports = api;