const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stats', statsSchema);
