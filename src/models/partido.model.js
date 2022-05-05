const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const PartidosSchema = Schema({
    numeroPartido: Number,
    equipo1: String,
    equipo2: String,
    golesEquipo1: Number,
    golesEquipo2: Number,
    idJornada: {type: Schema.Types.ObjectId, ref: 'jornadas'},
    idLiga:  {type: Schema.Types.ObjectId, ref: 'ligas'},
    idCreadorPartido: {type: Schema.Types.ObjectId, ref: 'usuarios'}
});

module.exports = mongoose.model('partidos', PartidosSchema);