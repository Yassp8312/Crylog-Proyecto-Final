const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const { optionalAuth } = require('./middlewares/auth');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(methodOverride('_method'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error'),
        info: req.flash('info')
    };
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(optionalAuth);
app.use((req, res, next) => {
    res.locals.isAuthenticated = res.locals.isAuthenticated || false;
    res.locals.isAdmin = res.locals.isAdmin || false;
    res.locals.user = res.locals.user || null;
    res.locals.title = res.locals.title || 'Crylog';
    next();
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.get('/about', optionalAuth, (req, res) => {
    res.render('about', {
        title: 'Sobre Nosotros - Crylog'
    });
});

app.get('/', optionalAuth, async (req, res) => {
    try {
        const Post = require('./models/Post');
        const { posts } = await Post.findAll({ limit: 6 });
        res.render('posts/index', {
            title: 'Crylog - Neo-Editorial Experience',
            posts,
            pagination: { total: posts.length },
            homePage: true
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.render('posts/index', {
            title: 'Crylog - Neo-Editorial Experience',
            posts: [],
            pagination: { total: 0 },
            homePage: true
        });
    }
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await testConnection();
        
        app.listen(PORT, () => {
            console.log(`
🗿 CRYLOG
================
Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Database: Supabase
URL: http://localhost:${PORT}
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        app.listen(PORT, () => {
            console.log(`
⚠️  CRYLOG (DB Connection Failed)
========================================
Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Warning: Database connection failed
URL: http://localhost:${PORT}
            `);
        });
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;
