const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const LigasSchema = Schema({
    nombreLiga: String,
    idCreadorLiga: {type: Schema.Types.ObjectId, ref: 'usuarios'}
});

module.exports = mongoose.model('ligas', LigasSchema);