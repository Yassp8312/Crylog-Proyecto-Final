const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

const authenticate = async (req, res, next) => {
    try {
        let token;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ message: 'No autorizado - Token no proporcionado' });
            }
            req.flash('error', 'Por favor inicia sesión para continuar');
            return res.redirect('/auth/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ message: 'No autorizado - Usuario no encontrado' });
            }
            req.flash('error', 'Sesión inválida');
            return res.redirect('/auth/login');
        }

        req.user = user;
        req.token = token;
        res.locals.user = user;
        res.locals.isAuthenticated = true;
        res.locals.isAdmin = user.role === 'admin';

        next();
    } catch (error) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ message: 'No autorizado - Token inválido' });
        }
        
        res.clearCookie('token');
        req.flash('error', 'Sesión expirada, por favor inicia sesión nuevamente');
        return res.redirect('/auth/login');
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (user) {
                req.user = user;
                req.token = token;
                res.locals.user = user;
                res.locals.isAuthenticated = true;
                res.locals.isAdmin = user.role === 'admin';
            }
        }

        next();
    } catch (error) {
        next();
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({ message: 'Acceso denegado - Se requiere rol de administrador' });
        }
        req.flash('error', 'No tienes permisos para realizar esta acción');
        return res.redirect('/');
    }
    next();
};

const requireOwnerOrAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const Post = require('../models/Post');
        
        const post = await Post.findById(id);
        
        if (!post) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(404).json({ message: 'Post no encontrado' });
            }
            req.flash('error', 'Post no encontrado');
            return res.redirect('/posts');
        }

        if (post.author_id !== req.user.id && req.user.role !== 'admin') {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({ message: 'Acceso denegado - No eres el autor de este post' });
            }
            req.flash('error', 'No tienes permisos para realizar esta acción');
            return res.redirect(`/posts/${post.slug}`);
        }

        req.post = post;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateToken,
    authenticate,
    optionalAuth,
    requireAdmin,
    requireOwnerOrAdmin
};
