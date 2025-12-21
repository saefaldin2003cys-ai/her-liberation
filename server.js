const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');
// Sharp disabled - images will be stored as-is
const sharp = null;
require('dotenv').config();

// ==========================================
// Security Packages
// ==========================================
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ==========================================
// Security Configuration
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '24h';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 12);

// ==========================================
// IP Blacklist & Security State
// ==========================================
var ipBlacklist = new Map(); // IP -> { count, lastAttempt, blocked }
var captchaStore = new Map(); // token -> { answer, expires }
var sessionStore = new Map(); // sessionId -> { ip, userAgent, lastActivity }

// Auto-cleanup expired entries every 10 minutes
setInterval(function() {
    var now = Date.now();
    ipBlacklist.forEach(function(value, key) {
        if (value.blocked && now - value.lastAttempt > 3600000) { // 1 hour
            ipBlacklist.delete(key);
        }
    });
    captchaStore.forEach(function(value, key) {
        if (now > value.expires) {
            captchaStore.delete(key);
        }
    });
    sessionStore.forEach(function(value, key) {
        if (now - value.lastActivity > 86400000) { // 24 hours
            sessionStore.delete(key);
        }
    });
}, 600000);

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

// 1. Helmet - Basic security headers only (CSP disabled for now)
app.use(helmet({
    contentSecurityPolicy: false, // Disabled - will enable later
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    hidePoweredBy: true
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
    'https://www.herliberation.com',
    'https://her-liberation.org',
    'https://www.her-liberation.org'
];

var corsOptions = {
    origin: function(origin, callback) {
        // Allow requests with no origin (same-origin requests from the app itself)
        if (!origin) {
            return callback(null, true);
        }
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        // In production, check allowed origins
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn('🚨 CORS blocked origin:', origin);
            callback(null, false); // Don't throw error, just reject
        }
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 4. Body Parser with size limits
app.use(express.json({ limit: '5mb' })); // Increased for base64 images
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

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
            // Skip sanitization for image field if it's a valid data URL or external URL
            if (key === 'image' && typeof obj[key] === 'string') {
                if (obj[key].startsWith('data:image/') || obj[key].startsWith('https://') || obj[key].startsWith('http://')) {
                    continue; // Don't sanitize valid image URLs
                }
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

// ==========================================
// 11. RCE (Remote Code Execution) Protection
// ==========================================
var rcePatterns = [
    /\$\{.*\}/gi,                    // Template injection ${}
    /\{\{.*\}\}/gi,                  // Template injection {{}}
    /`[^`]*\$\{[^`]*`/gi,            // Template literals with injection
    /eval\s*\(/gi,                   // eval()
    /Function\s*\(/gi,               // Function constructor
    /setTimeout\s*\([^,]*,/gi,       // setTimeout with string
    /setInterval\s*\([^,]*,/gi,      // setInterval with string
    /exec\s*\(/gi,                   // exec()
    /spawn\s*\(/gi,                  // spawn()
    /child_process/gi,               // child_process module
    /require\s*\(['"][^'"]+['"]\)/gi,// require() calls
    /import\s*\(/gi,                 // dynamic import
    /process\.env/gi,                // process.env access
    /process\.exit/gi,               // process.exit
    /__dirname/gi,                   // __dirname
    /__filename/gi,                  // __filename
    /\\x[0-9a-f]{2}/gi,              // Hex encoded
    /\\u[0-9a-f]{4}/gi,              // Unicode encoded
    /\.constructor\s*\(/gi,          // Constructor access
    /\[\s*['"]constructor['"]\s*\]/gi // Bracket constructor access
];

function checkRCE(input) {
    if (typeof input !== 'string') return false;
    for (var i = 0; i < rcePatterns.length; i++) {
        if (rcePatterns[i].test(input)) {
            return true;
        }
    }
    return false;
}

app.use(function(req, res, next) {
    var fullUrl = req.originalUrl + JSON.stringify(req.body || {}) + JSON.stringify(req.query || {});
    
    if (checkRCE(fullUrl)) {
        console.error('🚨 RCE ATTEMPT BLOCKED from', req.ip, ':', req.originalUrl);
        
        // Auto-blacklist IP
        var ipData = ipBlacklist.get(req.ip) || { count: 0, lastAttempt: 0, blocked: false };
        ipData.count += 10; // Heavy penalty
        ipData.lastAttempt = Date.now();
        if (ipData.count >= 5) ipData.blocked = true;
        ipBlacklist.set(req.ip, ipData);
        
        return res.status(403).json({ error: 'Access denied - Security violation' });
    }
    next();
});

// ==========================================
// 12. IP Blacklist Middleware
// ==========================================
app.use(function(req, res, next) {
    var ipData = ipBlacklist.get(req.ip);
    
    if (ipData && ipData.blocked) {
        var timeSinceBlock = Date.now() - ipData.lastAttempt;
        if (timeSinceBlock < 3600000) { // 1 hour block
            console.warn('🚫 Blocked IP attempt:', req.ip);
            return res.status(403).json({ error: 'Access temporarily blocked' });
        } else {
            // Unblock after 1 hour
            ipBlacklist.delete(req.ip);
        }
    }
    next();
});

// ==========================================
// 13. Logic Vulnerability Protection
// ==========================================
var requestHistory = new Map(); // IP -> [timestamps]

app.use(function(req, res, next) {
    // Prevent request replay attacks
    var requestId = req.headers['x-request-id'];
    if (requestId) {
        var replayKey = req.ip + ':' + requestId;
        if (requestHistory.has(replayKey)) {
            console.warn('🚨 Replay attack blocked:', replayKey);
            return res.status(409).json({ error: 'Duplicate request' });
        }
        requestHistory.set(replayKey, Date.now());
        setTimeout(function() { requestHistory.delete(replayKey); }, 300000); // 5 min
    }
    
    // Prevent parameter tampering on sensitive fields
    if (req.body) {
        var forbiddenFields = ['_id', 'id', 'isAdmin', 'role', 'permissions', 'password', 'hash'];
        for (var i = 0; i < forbiddenFields.length; i++) {
            if (req.body[forbiddenFields[i]] !== undefined) {
                if (req.path.indexOf('/admin') === -1 && req.path.indexOf('/auth') === -1) {
                    console.warn('🚨 Parameter tampering blocked:', forbiddenFields[i]);
                    delete req.body[forbiddenFields[i]];
                }
            }
        }
    }
    
    // Prevent mass assignment
    if (req.body && typeof req.body === 'object') {
        var allowedFields = ['name', 'text', 'titleAr', 'titleEn', 'contentAr', 'contentEn', 
                             'authorAr', 'authorEn', 'image', 'imagePosition', 'password', 'captchaToken', 'captchaAnswer'];
        var keys = Object.keys(req.body);
        for (var j = 0; j < keys.length; j++) {
            if (allowedFields.indexOf(keys[j]) === -1 && keys[j].charAt(0) !== '_') {
                // Allow but log unexpected fields
                console.log('📝 Unexpected field:', keys[j]);
            }
        }
    }
    
    next();
});

// ==========================================
// 14. CAPTCHA System (Simple Math-based)
// ==========================================
app.get('/api/captcha', function(req, res) {
    var num1 = Math.floor(Math.random() * 10) + 1;
    var num2 = Math.floor(Math.random() * 10) + 1;
    var operators = ['+', '-', '*'];
    var op = operators[Math.floor(Math.random() * operators.length)];
    
    var answer;
    var question;
    
    if (op === '+') {
        answer = num1 + num2;
        question = num1 + ' + ' + num2;
    } else if (op === '-') {
        // Ensure positive result
        if (num1 < num2) { var temp = num1; num1 = num2; num2 = temp; }
        answer = num1 - num2;
        question = num1 + ' - ' + num2;
    } else {
        answer = num1 * num2;
        question = num1 + ' × ' + num2;
    }
    
    var token = uuidv4();
    captchaStore.set(token, {
        answer: answer,
        expires: Date.now() + 300000 // 5 minutes
    });
    
    res.json({
        token: token,
        question: question + ' = ?'
    });
});

function verifyCaptcha(token, answer) {
    if (!token || answer === undefined) return false;
    
    var captcha = captchaStore.get(token);
    if (!captcha) return false;
    if (Date.now() > captcha.expires) {
        captchaStore.delete(token);
        return false;
    }
    
    var isValid = parseInt(answer) === captcha.answer;
    captchaStore.delete(token); // One-time use
    return isValid;
}

// ==========================================
// 15. JWT Authentication for Admin
// ==========================================
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

// Admin authentication middleware
function requireAdmin(req, res, next) {
    var authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    var token = authHeader.substring(7);
    var decoded = verifyToken(token);
    
    if (!decoded || !decoded.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Verify session
    var session = sessionStore.get(decoded.sessionId);
    if (!session) {
        return res.status(401).json({ error: 'Session expired' });
    }
    
    // Verify IP consistency (less strict - allow IP changes within session lifetime)
    // Store multiple allowed IPs per session to handle proxy/network changes
    if (!session.allowedIPs) {
        session.allowedIPs = [session.ip];
    }
    
    if (session.allowedIPs.indexOf(req.ip) === -1) {
        // Allow up to 3 different IPs per session (for network changes)
        if (session.allowedIPs.length < 3) {
            session.allowedIPs.push(req.ip);
            console.log('📝 New IP added to session:', req.ip);
        } else {
            console.warn('🚨 Too many IP changes for session:', decoded.sessionId);
            sessionStore.delete(decoded.sessionId);
            return res.status(401).json({ error: 'Session invalid - too many IP changes' });
        }
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    req.adminSession = decoded;
    next();
}

// Admin login endpoint
app.post('/api/auth/login', strictLimiter, function(req, res) {
    var password = req.body.password;
    
    console.log('🔐 Login attempt received');
    
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password required' });
    }
    
    // Check if IP is blacklisted
    var ipData = ipBlacklist.get(req.ip) || { count: 0, lastAttempt: 0, blocked: false };
    if (ipData.blocked) {
        return res.status(403).json({ error: 'Too many failed attempts. Try again later.' });
    }
    
    // Debug: Check if hash is loaded
    console.log('🔐 Hash loaded:', ADMIN_PASSWORD_HASH ? 'Yes (length: ' + ADMIN_PASSWORD_HASH.length + ')' : 'No');
    
    // Verify password
    var isValid = false;
    try {
        isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
    } catch (err) {
        console.error('🚨 bcrypt error:', err.message);
        return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (!isValid) {
        // Track failed attempts
        ipData.count += 1;
        ipData.lastAttempt = Date.now();
        if (ipData.count >= 5) {
            ipData.blocked = true;
            console.warn('🚨 IP blocked after failed login attempts:', req.ip);
        }
        ipBlacklist.set(req.ip, ipData);
        
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Clear failed attempts on success
    ipBlacklist.delete(req.ip);
    
    // Create session
    var sessionId = uuidv4();
    sessionStore.set(sessionId, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        lastActivity: Date.now()
    });
    
    // Generate token
    var token = generateToken({
        isAdmin: true,
        sessionId: sessionId,
        iat: Date.now()
    });
    
    console.log('✅ Admin login from:', req.ip);
    res.json({ success: true, token: token });
});

// Admin logout
app.post('/api/auth/logout', function(req, res) {
    var authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        var token = authHeader.substring(7);
        var decoded = verifyToken(token);
        if (decoded && decoded.sessionId) {
            sessionStore.delete(decoded.sessionId);
        }
    }
    res.json({ success: true });
});

// Verify token endpoint
app.get('/api/auth/verify', function(req, res) {
    var authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false });
    }
    
    var token = authHeader.substring(7);
    var decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ valid: false });
    }
    
    var session = sessionStore.get(decoded.sessionId);
    if (!session) {
        return res.status(401).json({ valid: false });
    }
    
    // Allow IP to be added to session's allowed IPs
    if (!session.allowedIPs) {
        session.allowedIPs = [session.ip];
    }
    
    if (session.allowedIPs.indexOf(req.ip) === -1 && session.allowedIPs.length < 3) {
        session.allowedIPs.push(req.ip);
    }
    
    res.json({ valid: true, expiresAt: decoded.exp * 1000 });
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

        // Seed Articles - DISABLED (use admin panel to add articles)
        // Articles should be managed through the admin panel only
        // const articlesCount = await Article.countDocuments();
        // if (articlesCount === 0) {
        //     const articlesPath = path.join(DB_Data_Path, 'articles.json');
        //     if (fs.existsSync(articlesPath)) {
        //         const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
        //         if (articlesData.length > 0) {
        //             await Article.create(articlesData);
        //             console.log('🌱 Seeded Articles from JSON');
        //         }
        //     }
        // }
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
        var captchaToken = req.body.captchaToken;
        var captchaAnswer = req.body.captchaAnswer;
        
        // Verify CAPTCHA first
        if (!verifyCaptcha(captchaToken, captchaAnswer)) {
            return res.status(400).json({ error: 'فشل التحقق - CAPTCHA verification failed' });
        }
        
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

// ==========================================
// Image Upload Configuration (MongoDB Base64 Storage)
// ==========================================
const uploadsDir = path.join(__dirname, 'public', 'uploads');

// Ensure uploads directory exists (for local development)
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use memory storage for base64 conversion
const memoryStorage = multer.memoryStorage();

const fileFilter = function(req, file, cb) {
    // Accept only image files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('نوع الملف غير مدعوم. الأنواع المسموحة: JPEG, PNG, GIF, WebP'), false);
    }
};

const upload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB max for base64
    },
    fileFilter: fileFilter
});

// Image upload endpoint - stores as base64 data URL
app.post('/api/upload', requireAdmin, function(req, res) {
    console.log('📤 Upload request received');
    
    upload.single('image')(req, res, async function(err) {
        console.log('📤 Processing upload...');
        
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                console.error('❌ File too large');
                return res.status(400).json({ error: 'حجم الصورة كبير جداً (الحد الأقصى 2MB)' });
            }
            console.error('❌ Multer error:', err);
            return res.status(400).json({ error: 'خطأ في رفع الصورة: ' + err.message });
        } else if (err) {
            console.error('❌ Upload error:', err);
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            console.error('❌ No file received');
            return res.status(400).json({ error: 'لم يتم اختيار صورة' });
        }
        
        console.log('📤 File received:', req.file.originalname, 'Size:', req.file.size);
        
        try {
            let imageBuffer = req.file.buffer;
            let mimeType = 'image/jpeg';
            
            // Process with sharp if available (resize to 770x770)
            if (sharp) {
                console.log('📤 Processing with sharp...');
                imageBuffer = await sharp(req.file.buffer)
                    .resize(770, 770, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .jpeg({ quality: 80 })
                    .toBuffer();
                mimeType = 'image/jpeg';
                console.log('✅ Image processed with sharp (770x770)');
            }
            
            // Convert to base64 data URL
            const base64Image = imageBuffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64Image}`;
            
            console.log('✅ Image uploaded as base64 (size:', Math.round(dataUrl.length / 1024), 'KB)');
            return res.json({ success: true, url: dataUrl });
            
        } catch (processError) {
            console.error('❌ Image processing error:', processError.message);
            console.error(processError.stack);
            
            // Fallback: return original as base64
            const base64Image = req.file.buffer.toString('base64');
            const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
            return res.json({ success: true, url: dataUrl });
        }
    });
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

app.post('/api/articles', requireAdmin, async (req, res) => {
    try {
        var titleAr = req.body.titleAr;
        var titleEn = req.body.titleEn;
        var authorAr = req.body.authorAr;
        var authorEn = req.body.authorEn;
        var contentAr = req.body.contentAr;
        var contentEn = req.body.contentEn;
        var image = req.body.image;
        var imagePosition = parseInt(req.body.imagePosition) || 50;
        
        // Validate imagePosition (0-100)
        if (isNaN(imagePosition) || imagePosition < 0 || imagePosition > 100) {
            imagePosition = 50;
        }
        
        // Validation
        if (!titleAr || !contentAr) {
            return res.status(400).json({ error: 'Missing required fields (titleAr, contentAr)' });
        }
        
        // Length validation
        if (titleAr.length > 200 || (contentAr && contentAr.length > 10000)) {
            return res.status(400).json({ error: 'Content too long' });
        }
        
        // Image URL validation (allow local uploads, external URLs, or base64 data URLs)
        if (image && !(/^(https?:\/\/.+|\/uploads\/.+|data:image\/.+)$/.test(image))) {
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
            imagePosition: imagePosition,
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

app.delete('/api/articles/:id', requireAdmin, async (req, res) => {
    try {
        // Validate MongoDB ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid article ID' });
        }
        
        var result = await Article.findByIdAndDelete(req.params.id);
        if (result) {
            console.log('✅ Article deleted by admin:', req.params.id);
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
        console.log('   ✅ RCE Protection');
        console.log('   ✅ IP Auto-Blacklisting');
        console.log('   ✅ JWT Admin Authentication');
        console.log('   ✅ CAPTCHA for Comments');
        console.log('   ✅ Logic Vulnerability Protection');
        console.log('   ✅ Session Hijacking Prevention');
        console.log('');
    });
});
