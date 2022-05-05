const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const JornadasSchema = Schema({
    numeroJornada: Number,
    idLiga:  {type: Schema.Types.ObjectId, ref: 'ligas'},
    idCreadorJornada: {type: Schema.Types.ObjectId, ref: 'usuarios'}
});

module.exports = mongoose.model('jornadas', JornadasSchema);