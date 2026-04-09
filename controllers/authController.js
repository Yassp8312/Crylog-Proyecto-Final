const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');
const { body, validationResult } = require('express-validator');

// Validaciones
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    body('email')
        .isEmail()
        .withMessage('Por favor ingresa un email válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('passwordConfirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        })
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Por favor ingresa un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];

// Mostrar formulario de registro
const getRegister = (req, res) => {
    if (res.locals.isAuthenticated) {
        return res.redirect('/');
    }
    res.render('auth/register', {
        title: 'Registro - Monolith Blog',
        errors: [],
        formData: {}
    });
};

// Procesar registro
const postRegister = [
    ...registerValidation,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).render('auth/register', {
                title: 'Registro - Monolith Blog',
                errors: errors.array(),
                formData: req.body
            });
        }

        const { username, email, password } = req.body;

        // Verificar si el email ya existe
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).render('auth/register', {
                title: 'Registro - Monolith Blog',
                errors: [{ msg: 'Ya existe una cuenta con este email' }],
                formData: req.body
            });
        }

        // Verificar si el username ya existe
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).render('auth/register', {
                title: 'Registro - Monolith Blog',
                errors: [{ msg: 'Este nombre de usuario ya está en uso' }],
                formData: req.body
            });
        }

        // Crear usuario
        const user = await User.create({
            username,
            email,
            password,
            role: 'user'
        });

        // Generar token
        const token = generateToken(user);

        // Guardar token en cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        req.flash('success', '¡Bienvenido! Tu cuenta ha sido creada exitosamente');
        res.redirect('/');
    })
];

// Mostrar formulario de login
const getLogin = (req, res) => {
    if (res.locals.isAuthenticated) {
        return res.redirect('/');
    }
    res.render('auth/login', {
        title: 'Iniciar Sesión - Monolith Blog',
        errors: [],
        formData: {}
    });
};

// Procesar login
const postLogin = [
    ...loginValidation,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).render('auth/login', {
                title: 'Iniciar Sesión - Monolith Blog',
                errors: errors.array(),
                formData: req.body
            });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).render('auth/login', {
                title: 'Iniciar Sesión - Monolith Blog',
                errors: [{ msg: 'Email o contraseña incorrectos' }],
                formData: req.body
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).render('auth/login', {
                title: 'Iniciar Sesión - Monolith Blog',
                errors: [{ msg: 'Email o contraseña incorrectos' }],
                formData: req.body
            });
        }

        // Generar token
        const token = generateToken(user);

        // Guardar token en cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        // Redirigir a la página que intentaba visitar o al inicio
        const redirectTo = req.query.redirect || '/';
        req.flash('success', `¡Bienvenido de nuevo, ${user.username}!`);
        res.redirect(redirectTo);
    })
];

// Cerrar sesión
const logout = (req, res) => {
    res.clearCookie('token');
    req.flash('success', 'Has cerrado sesión exitosamente');
    res.redirect('/');
};

// API: Obtener usuario actual
const getMe = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: req.user.toJSON()
    });
});

// API: Actualizar perfil
const updateProfile = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    const user = await User.update(req.user.id, updates);
    
    res.json({
        success: true,
        data: user.toJSON()
    });
});

module.exports = {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    logout,
    getMe,
    updateProfile
};
