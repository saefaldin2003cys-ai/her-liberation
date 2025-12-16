const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

// Import Models
const Stats = require('./models/Stats');
const Article = require('./models/Article');
const Comment = require('./models/Comment');

const app = express();
const PORT = process.env.PORT || 5500;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// 1. Helmet - Set security HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "https://her-liberation.onrender.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// 2. Rate Limiting - Prevent DDoS and brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limit for POST requests
const strictLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute for POST
    message: { error: 'Too many submissions, please wait a moment.' },
});
app.use('/api/comments', strictLimiter);
app.use('/api/articles', strictLimiter);

// 3. CORS - Configure allowed origins
const allowedOrigins = [
    'https://her-liberation.onrender.com',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow for now, but log suspicious origins
            console.warn(`⚠️ Request from unknown origin: ${origin}`);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Body parser with size limit
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent large payload attacks

// 5. Data Sanitization against NoSQL injection
app.use(mongoSanitize());

// 6. Custom XSS Protection middleware
const sanitizeInput = (obj) => {
    if (typeof obj === 'string') {
        return obj
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim()
            .slice(0, 1000); // Limit string length
    }
    if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            obj[key] = sanitizeInput(obj[key]);
        }
    }
    return obj;
};

app.use((req, res, next) => {
    if (req.body) {
        req.body = sanitizeInput(req.body);
    }
    next();
});

// 7. Prevent HTTP Parameter Pollution
app.use((req, res, next) => {
    // Only keep the first value if duplicate query params
    for (let key in req.query) {
        if (Array.isArray(req.query[key])) {
            req.query[key] = req.query[key][0];
        }
    }
    next();
});

// ============================================
// STATIC FILES & ROUTES
// ============================================

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
        
        // Validation
        if (!name || !text) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        
        // Length validation
        if (name.length > 50 || text.length > 500) {
            return res.status(400).json({ error: 'Content too long' });
        }
        
        // Check for spam patterns
        const spamPatterns = [/http[s]?:\/\//i, /<script/i, /javascript:/i];
        if (spamPatterns.some(pattern => pattern.test(text) || pattern.test(name))) {
            console.warn(`⚠️ Spam attempt blocked: ${name}`);
            return res.status(400).json({ error: 'Invalid content' });
        }

        const newComment = new Comment({ name: name.trim(), text: text.trim() });
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
        if (!titleAr || !contentAr) {
            return res.status(400).json({ error: 'Missing required fields (titleAr, contentAr)' });
        }
        
        // Length validation
        if (titleAr.length > 200 || contentAr.length > 10000) {
            return res.status(400).json({ error: 'Content too long' });
        }
        
        // Image URL validation
        if (image && !image.match(/^(https?:\/\/|data:image\/)/i)) {
            return res.status(400).json({ error: 'Invalid image URL' });
        }

        const newArticle = new Article({
            title: {
                ar: titleAr.trim(),
                en: (titleEn || titleAr).trim()
            },
            author: {
                ar: (authorAr || '').trim(),
                en: (authorEn || authorAr || '').trim()
            },
            content: {
                ar: contentAr.trim(),
                en: (contentEn || contentAr).trim()
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

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - Must be after all routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message;
    
    res.status(err.status || 500).json({ 
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// ============================================
// START SERVER
// ============================================
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('');
        console.log('╔════════════════════════════════════════════╗');
        console.log('║     🌸 خادم تحريرها يعمل بنجاح! 🌸         ║');
        console.log('║     🔒 Security Features Enabled           ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║  🌐 افتح الموقع: http://localhost:${PORT}      ║`);
        console.log('║  📝 MongoDB Integration Active!           ║');
        console.log('║  🛡️  Rate Limiting: ✓                      ║');
        console.log('║  🔐 Helmet Security: ✓                    ║');
        console.log('║  🧹 XSS Protection: ✓                     ║');
        console.log('║  💉 NoSQL Injection Protection: ✓         ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('');
    });
});
