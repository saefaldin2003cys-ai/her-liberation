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
    authorBio: {
        ar: { type: String },
        en: { type: String }
    },
    date: { type: String },
    content: {
        ar: { type: String, required: true },
        en: { type: String }
    },
    image: { type: String }, // Main image (kept for backwards compatibility)
    imagePosition: { type: Number, default: 50, min: 0, max: 100 },
    images: [{
        url: { type: String, required: true },
        caption: {
            ar: { type: String },
            en: { type: String }
        },
        alignment: { type: String, enum: ['full', 'left', 'right'], default: 'full' },
        position: { type: Number, default: 50, min: 0, max: 100 }
    }],
    slug: { type: String, unique: true, sparse: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
