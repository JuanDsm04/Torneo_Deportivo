const { application } = require('express');
const express = require('express');
const ligaControlador = require('../controllers/liga.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/agregarLiga', md_autenticacion.Auth, ligaControlador.agregarLiga);
api.put('/editarLiga/:idLiga', md_autenticacion.Auth, ligaControlador.editarLiga);
api.delete('/eliminarLiga/:idLiga', md_autenticacion.Auth, ligaControlador.eliminarLiga);
api.get('/verLiga/:idLiga', md_autenticacion.Auth, ligaControlador.verLiga);

module.exports = api;