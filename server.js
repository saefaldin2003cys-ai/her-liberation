const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Models
const Stats = require('./models/Stats');
const Article = require('./models/Article');
const Comment = require('./models/Comment');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Admin Route (Convenience)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Database Connection & Seeding
const DB_Data_Path = path.join(__dirname, 'database');

async function connectDB() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri || uri.includes('<password>')) {
            console.warn('⚠️ MONGODB_URI is likely invalid or default. Using In-Memory fallback or waiting for config.');
            if (!uri) return; // Skip connection if no string
        }

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');
        await seedData();
    } catch (err) {
        console.error('');
        console.error('❌ MongoDB Connection Failed!');
        console.error(`   Error: ${err.message}`);
        console.error('---------------------------------------------------');
        console.error('⚠️  ACTION REQUIRED:');
        console.error('   1. Open the .env file in your project folder.');
        console.error('   2. Replace MONGODB_URI with your REAL connection string.');
        console.error('   3. Restart the server.');
        console.error('---------------------------------------------------');
        console.error('');
    }
}

async function seedData() {
    try {
        // Seed Stats
        const statsCount = await Stats.countDocuments();
        if (statsCount === 0) {
            const statsPath = path.join(DB_Data_Path, 'stats.json');
            if (fs.existsSync(statsPath)) {
                const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
                await Stats.create(statsData);
                console.log('🌱 Seeded Stats from JSON');
            }
        }

        // Seed Comments
        const commentsCount = await Comment.countDocuments();
        if (commentsCount === 0) {
            const commentsPath = path.join(DB_Data_Path, 'comments.json');
            if (fs.existsSync(commentsPath)) {
                const commentsData = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
                if (commentsData.length > 0) {
                    await Comment.create(commentsData);
                    console.log('🌱 Seeded Comments from JSON');
                }
            }
        }

        // Seed Articles
        const articlesCount = await Article.countDocuments();
        if (articlesCount === 0) {
            const articlesPath = path.join(DB_Data_Path, 'articles.json');
            if (fs.existsSync(articlesPath)) {
                const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
                if (articlesData.length > 0) {
                    await Article.create(articlesData);
                    console.log('🌱 Seeded Articles from JSON');
                }
            }
        }
    } catch (error) {
        console.warn('⚠️ Error seeding data (normal if files missing or models mismatch):', error.message);
    }
}

// ==========================================
// API Routes (MongoDB)
// ==========================================

// --- Statistics ---
app.get('/api/stats', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = await Stats.create({ views: 150, likes: 42 });
        }
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/stats/view', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({ views: 0, likes: 0 });

        stats.views += 1;
        await stats.save();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/stats/like', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({ views: 0, likes: 0 });

        stats.likes += 1;
        await stats.save();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- Comments ---
app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ timestamp: -1 }).limit(50);
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/comments', async (req, res) => {
    try {
        const { name, text } = req.body;
        if (!name || !text) return res.status(400).json({ error: 'Missing fields' });

        const newComment = new Comment({ name, text });
        await newComment.save();
        res.json({ success: true, comment: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- Articles ---
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find().sort({ timestamp: -1 });
        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/articles', async (req, res) => {
    try {
        const { titleAr, titleEn, authorAr, authorEn, contentAr, contentEn, image } = req.body;
        // Basic validation
        if (!titleAr || !contentAr) return res.status(400).json({ error: 'Missing required fields (titleAr, contentAr)' });

        const newArticle = new Article({
            title: {
                ar: titleAr,
                en: titleEn || titleAr
            },
            author: {
                ar: authorAr,
                en: authorEn || authorAr
            },
            content: {
                ar: contentAr,
                en: contentEn || contentAr
            },
            image: image || '',
            likes: 0,
            comments: []
        });
        await newArticle.save();
        res.json(newArticle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.delete('/api/articles/:id', async (req, res) => {
    try {
        const result = await Article.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Article not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Article Likes
app.post('/api/articles/:id/like', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (article) {
            article.likes += 1;
            await article.save();
            res.json({ likes: article.likes });
        } else {
            res.status(404).json({ error: 'Article not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Article Comments
app.post('/api/articles/:id/comments', async (req, res) => {
    try {
        const { name, text } = req.body;
        const article = await Article.findById(req.params.id);
        if (article) {
            const newComment = {
                name: name || 'زائر',
                text: text,
                timestamp: Date.now()
            };
            article.comments.push(newComment);
            await article.save();
            res.json(newComment);
        } else {
            res.status(404).json({ error: 'Article not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Start
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('');
        console.log('╔════════════════════════════════════════════╗');
        console.log('║     🌸 خادم تحريرها يعمل بنجاح! 🌸         ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║  🌐 افتح الموقع: http://localhost:${PORT}      ║`);
        console.log('║  � MongoDB Integration Active!           ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('');
    });
});
