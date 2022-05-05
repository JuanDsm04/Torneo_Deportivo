const { application } = require('express');
const express = require('express');
const partidoControlador = require('../controllers/partido.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/agregarPartido', md_autenticacion.Auth, partidoControlador.agregarPartido);
api.post('/agregarPartidoComoAdmin/:idUsuario', md_autenticacion.Auth, partidoControlador.agregarPartidoComoAdmin);

module.exports = api;