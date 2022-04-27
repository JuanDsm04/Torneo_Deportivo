const { application } = require('express');
const express = require('express');
const usuarioControlador = require('../controllers/usuario.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/login', usuarioControlador.Login);
api.post('/registrarUsuario', usuarioControlador.registrarUsuario);
api.post('/registrarAdmin', md_autenticacion.Auth, usuarioControlador.registrarUsuarioAdministrador);
api.put('/editarUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.editarUsuario);
api.delete('/eliminarUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.eliminarUsuario);
api.get('/verUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.verUsuario);

module.exports = api;