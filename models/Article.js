const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        ar: { type: String, required: true },
        en: { type: String }
    },
    excerpt: { type: String },
    author: {
        ar: { type: String, default: 'تحريرها' },
        en: { type: String, default: 'HerLiberation' }
    },
    date: { type: String }, // Keeping as string to match current JSON format
    content: {
        ar: { type: String, required: true },
        en: { type: String }
    },
    image: { type: String },
    imagePosition: { type: String, default: 'center', enum: ['top', 'center', 'bottom'] },
    likes: { type: Number, default: 0 },
    comments: [{
        name: String, // Changed from user to name to match frontend
        text: String,
        timestamp: { type: Date, default: Date.now } // Changed from date to timestamp
    }],
    timestamp: { type: Date, default: Date.now } // Changed from createdAt
});

module.exports = mongoose.model('Article', articleSchema);
