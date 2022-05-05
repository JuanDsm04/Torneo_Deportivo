const { application } = require('express');
const express = require('express');
const ligaControlador = require('../controllers/liga.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/agregarLiga', md_autenticacion.Auth, ligaControlador.agregarLiga);
api.put('/editarLiga/:idLiga', md_autenticacion.Auth, ligaControlador.editarLiga);
api.delete('/eliminarLiga/:idLiga', md_autenticacion.Auth, ligaControlador.eliminarLiga);
api.get('/verLiga/:idLiga', md_autenticacion.Auth, ligaControlador.verLiga);
api.get('/resultadosLiga/:idLiga', md_autenticacion.Auth, ligaControlador.resultadosLiga);
api.get('/crearPDF/:idLiga', md_autenticacion.Auth, ligaControlador.crearPDF);

// Funciones de los administradores con las ligas de todos los usuarios
api.post('/agregarLigaComoAdmin/:idUsuario', md_autenticacion.Auth, ligaControlador.agregarLigaComoAdmin);
api.put('/editarLigaComoAdmin/:idLiga', md_autenticacion.Auth, ligaControlador.editarLigaComoAdmin);
api.delete('/eliminarLigaComoAdmin/:idLiga', md_autenticacion.Auth, ligaControlador.eliminarLigaComoAdmin);
api.get('/verLigaComoAdmin/:idLiga', md_autenticacion.Auth, ligaControlador.verLigaComoAdmin);

module.exports = api;