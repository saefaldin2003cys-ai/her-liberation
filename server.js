const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// ==========================================
// Security Packages
// ==========================================
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Import Models
const Stats = require('./models/Stats');
const Article = require('./models/Article');
const Comment = require('./models/Comment');

const app = express();
const PORT = process.env.PORT || 5500;

// ==========================================
// Trust Proxy (for Render/Heroku)
// ==========================================
app.set('trust proxy', 1);

// ==========================================
// Security Middleware
// ==========================================

// 1. Helmet - Set security HTTP headers (Enhanced)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.github.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
}));

// 2. Rate Limiting - Prevent DDoS and brute force attacks
var limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: function(req) {
        // Skip rate limiting for static files
        return req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/);
    }
});
app.use('/api/', limiter);

// Stricter rate limit for POST requests (comments, likes)
var postLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 POST requests per minute
    message: { error: 'Too many submissions, please wait a moment.' },
    keyGenerator: function(req) {
        return req.ip + ':' + req.path;
    }
});

// Very strict limiter for sensitive operations
var strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: { error: 'Rate limit exceeded for this operation.' }
});

// 3. CORS Configuration - Restrict origins
var allowedOrigins = [
    'https://her-liberation.onrender.com',
    'https://herliberation.com',
    'https://www.herliberation.com'
];

var corsOptions = {
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc) in dev
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 4. Body Parser with size limits
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Data Sanitization against NoSQL Injection
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: function(data) {
        console.warn('🚨 NoSQL Injection attempt blocked:', data.key);
    }
}));

// 6. Prevent HTTP Parameter Pollution
app.use(hpp({
    whitelist: [] // No parameters allowed to be duplicated
}));

// 7. Custom XSS Protection middleware (Enhanced)
var dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi
];

function sanitizeInput(obj) {
    if (typeof obj === 'string') {
        var sanitized = obj
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .replace(/\\/g, '&#x5C;')
            .replace(/`/g, '&#x60;')
            .trim();
        
        // Check for dangerous patterns
        for (var i = 0; i < dangerousPatterns.length; i++) {
            if (dangerousPatterns[i].test(obj)) {
                console.warn('🚨 XSS attempt blocked');
                return '';
            }
        }
        
        return sanitized.slice(0, 1000); // Max 1000 chars
    }
    if (typeof obj === 'object' && obj !== null) {
        for (var key in obj) {
            // Block prototype pollution
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                delete obj[key];
                console.warn('🚨 Prototype pollution attempt blocked');
                continue;
            }
            obj[key] = sanitizeInput(obj[key]);
        }
    }
    return obj;
}

// Apply XSS sanitization to all requests
app.use(function(req, res, next) {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query);
    if (req.params) req.params = sanitizeInput(req.params);
    next();
});

// 8. Security headers for static files (Enhanced)
app.use(function(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    next();
});

// 9. Request logging for security monitoring
app.use(function(req, res, next) {
    var ip = req.ip || req.connection.remoteAddress;
    var userAgent = req.get('User-Agent') || 'Unknown';
    
    // Log suspicious requests
    if (req.method === 'POST' || req.method === 'DELETE') {
        console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.path + ' from ' + ip);
    }
    
    // Block suspicious user agents
    var suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab'];
    var lowerUA = userAgent.toLowerCase();
    for (var i = 0; i < suspiciousAgents.length; i++) {
        if (lowerUA.indexOf(suspiciousAgents[i]) !== -1) {
            console.warn('🚨 Blocked suspicious user agent:', userAgent);
            return res.status(403).json({ error: 'Access denied' });
        }
    }
    
    next();
});

// 10. Block common attack paths
app.use(function(req, res, next) {
    var blockedPaths = [
        '/wp-admin', '/wp-login', '/wp-content',
        '/phpmyadmin', '/pma', '/mysql',
        '/.env', '/.git', '/.htaccess',
        '/admin.php', '/config.php',
        '/shell', '/cmd', '/exec'
    ];
    
    var lowerPath = req.path.toLowerCase();
    for (var i = 0; i < blockedPaths.length; i++) {
        if (lowerPath.indexOf(blockedPaths[i]) !== -1) {
            console.warn('🚨 Blocked attack path:', req.path, 'from', req.ip);
            return res.status(404).send('Not Found');
        }
    }
    next();
});

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public'), {
    dotfiles: 'deny',
    etag: true,
    maxAge: '1d',
    index: 'index.html'
}));

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
        var stats = await Stats.findOne();
        if (!stats) {
            stats = await Stats.create({ views: 150, likes: 42 });
        }
        res.json(stats);
    } catch (error) {
        console.error('Stats GET error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/stats/view', postLimiter, async (req, res) => {
    try {
        var stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({ views: 0, likes: 0 });

        stats.views += 1;
        await stats.save();
        res.json(stats);
    } catch (error) {
        console.error('Stats view error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/stats/like', postLimiter, async (req, res) => {
    try {
        var stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({ views: 0, likes: 0 });

        stats.likes += 1;
        await stats.save();
        res.json(stats);
    } catch (error) {
        console.error('Stats like error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- Comments ---
app.get('/api/comments', async (req, res) => {
    try {
        var comments = await Comment.find().sort({ timestamp: -1 }).limit(50);
        res.json(comments);
    } catch (error) {
        console.error('Comments GET error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/comments', postLimiter, async (req, res) => {
    try {
        var name = req.body.name;
        var text = req.body.text;
        
        // Validate input
        if (!name || !text) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        
        // Additional validation
        if (typeof name !== 'string' || typeof text !== 'string') {
            return res.status(400).json({ error: 'Invalid input type' });
        }
        
        if (name.length > 50 || text.length > 500) {
            return res.status(400).json({ error: 'Input too long' });
        }

        var newComment = new Comment({ name: name, text: text });
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
        var articles = await Article.find().sort({ timestamp: -1 });
        res.json(articles);
    } catch (error) {
        console.error('Articles GET error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/articles', postLimiter, async (req, res) => {
    try {
        var titleAr = req.body.titleAr;
        var titleEn = req.body.titleEn;
        var authorAr = req.body.authorAr;
        var authorEn = req.body.authorEn;
        var contentAr = req.body.contentAr;
        var contentEn = req.body.contentEn;
        var image = req.body.image;
        
        // Validation
        if (!titleAr || !contentAr) {
            return res.status(400).json({ error: 'Missing required fields (titleAr, contentAr)' });
        }
        
        // Length validation
        if (titleAr.length > 200 || (contentAr && contentAr.length > 10000)) {
            return res.status(400).json({ error: 'Content too long' });
        }
        
        // Image URL validation
        if (image && !(/^https?:\/\/.+/.test(image))) {
            return res.status(400).json({ error: 'Invalid image URL' });
        }

        var newArticle = new Article({
            title: {
                ar: titleAr,
                en: titleEn || titleAr
            },
            author: {
                ar: authorAr || 'مجهول',
                en: authorEn || authorAr || 'Anonymous'
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
        console.error('Article POST error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.delete('/api/articles/:id', async (req, res) => {
    try {
        // Validate MongoDB ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid article ID' });
        }
        
        var result = await Article.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Article not found' });
        }
    } catch (error) {
        console.error('Article DELETE error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Article Likes
app.post('/api/articles/:id/like', postLimiter, async (req, res) => {
    try {
        // Validate MongoDB ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid article ID' });
        }
        
        var article = await Article.findById(req.params.id);
        if (article) {
            article.likes += 1;
            await article.save();
            res.json({ likes: article.likes });
        } else {
            res.status(404).json({ error: 'Article not found' });
        }
    } catch (error) {
        console.error('Article like error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Article Comments
app.post('/api/articles/:id/comments', postLimiter, async (req, res) => {
    try {
        // Validate MongoDB ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid article ID' });
        }
        
        var name = req.body.name;
        var text = req.body.text;
        
        // Validate input
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Comment text is required' });
        }
        
        if (text.length > 500 || (name && name.length > 50)) {
            return res.status(400).json({ error: 'Input too long' });
        }
        
        var article = await Article.findById(req.params.id);
        if (article) {
            var newComment = {
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
        console.error('Article comment error:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ==========================================
// Error Handling Middleware
// ==========================================

// 404 Handler for API routes
app.use('/api/*', function(req, res) {
    res.status(404).json({ error: 'API endpoint not found' });
});

// CORS error handler
app.use(function(err, req, res, next) {
    if (err.message === 'Not allowed by CORS') {
        console.warn('🚨 CORS violation from:', req.get('origin'));
        return res.status(403).json({ error: 'CORS policy violation' });
    }
    next(err);
});

// Global error handler - Don't leak error details in production
app.use(function(err, req, res, next) {
    console.error('Global error:', err.message);
    
    // Don't leak stack traces in production
    var errorResponse = {
        error: 'Internal server error'
    };
    
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.details = err.message;
    }
    
    res.status(500).json(errorResponse);
});

// ==========================================
// Graceful Shutdown
// ==========================================
process.on('SIGTERM', function() {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close().then(function() {
        console.log('📦 MongoDB connection closed.');
        process.exit(0);
    }).catch(function(err) {
        console.error('Error closing MongoDB:', err);
        process.exit(1);
    });
});

process.on('SIGINT', function() {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    mongoose.connection.close().then(function() {
        console.log('📦 MongoDB connection closed.');
        process.exit(0);
    }).catch(function(err) {
        console.error('Error closing MongoDB:', err);
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', function(err) {
    console.error('🚨 Uncaught Exception:', err.message);
    console.error(err.stack);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', function(reason, promise) {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start
connectDB().then(function() {
    app.listen(PORT, function() {
        console.log('');
        console.log('╔════════════════════════════════════════════╗');
        console.log('║     🌸 خادم تحريرها يعمل بنجاح! 🌸         ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log('║  🌐 افتح الموقع: http://localhost:' + PORT + '      ║');
        console.log('║  🔒 Security Features: ENABLED             ║');
        console.log('║  📦 MongoDB Integration Active!            ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('');
        console.log('🛡️ Security Features:');
        console.log('   ✅ Helmet (HTTP Security Headers)');
        console.log('   ✅ Rate Limiting (DDoS Protection)');
        console.log('   ✅ CORS (Origin Control)');
        console.log('   ✅ NoSQL Injection Prevention');
        console.log('   ✅ XSS Protection');
        console.log('   ✅ HPP (Parameter Pollution)');
        console.log('   ✅ Input Validation & Sanitization');
        console.log('   ✅ Suspicious Agent Blocking');
        console.log('   ✅ Attack Path Blocking');
        console.log('');
    });
});
