const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    question: { type: String, required: true, default: 'minimum_marriage_age' },
    votes: {
        agree18: { type: Number, default: 0 },    // نعم، أوافق (+18)
        disagree: { type: Number, default: 0 },   // لا، لا أوافق

    },
    voters: [{ type: String }] // Store voter IPs to prevent double voting
});

module.exports = mongoose.model('Poll', pollSchema);
