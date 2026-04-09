// Manejador de errores 404
const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

// Manejador de errores global
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error('Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Recurso no encontrado';
        error = { message, status: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000 || (err.message && err.message.includes('duplicate'))) {
        const message = 'Ya existe un recurso con ese valor';
        error = { message, status: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, status: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = { message, status: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = { message, status: 401 };
    }

    // Supabase errors
    if (err.message && err.message.includes('Supabase')) {
        const message = 'Error de base de datos';
        error = { message, status: 500 };
    }

    const statusCode = error.status || err.status || 500;
    const message = error.message || err.message || 'Error interno del servidor';

    // Si es una petición AJAX o API, devolver JSON
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Para peticiones normales, renderizar vista de error
    res.status(statusCode).render('error', {
        title: `Error ${statusCode}`,
        message,
        statusCode,
        error: process.env.NODE_ENV === 'development' ? err : {},
        user: res.locals.user || null
    });
};

// Wrapper para async handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    notFound,
    errorHandler,
    asyncHandler
};
