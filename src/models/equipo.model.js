const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const EquiposSchema = Schema({
    nombreEquipo: String,
    puntos: Number,
    golesFavor: Number,
    golesContra: Number,
    diferenciaGoles: Number,
    partidosJugados: Number,
    idLiga: {type: Schema.Types.ObjectId, ref: 'ligas'},
    idCreadorEquipo: {type: Schema.Types.ObjectId, ref: 'usuarios'}
});

module.exports = mongoose.model('equipos', EquiposSchema);