/**
 * Custom Error Classes
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}

/**
 * Sequelize Error Handler
 * Menangani error yang berasal dari Sequelize ORM
 */
const handleSequelizeError = (error) => {
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return new ValidationError(messages);
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path || 'field';
        return new ConflictError(`${field} already exists`);
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return new ValidationError('Invalid reference to related resource');
    }

    if (error.name === 'SequelizeDatabaseError') {
        return new InternalServerError('Database operation failed');
    }

    return error;
};

/**
 * JWT Error Handler
 * Menangani error yang berasal dari JWT
 */
const handleJWTError = (error) => {
    if (error.name === 'JsonWebTokenError') {
        return new UnauthorizedError('Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
        return new UnauthorizedError('Token expired');
    }

    return error;
};

/**
 * Development Error Response
 * Menampilkan detail error lengkap untuk debugging
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        code: err.statusCode,
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

/**
 * Production Error Response
 * Menampilkan error yang aman untuk production
 */
const sendErrorProd = (err, res) => {
    // Operational error (dipercaya): kirim ke client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            code: err.statusCode,
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming error atau unknown error: jangan bocorkan detail
        console.error('ERROR 💥', err);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Something went wrong',
        });
    }
};

/**
 * Global Error Handler Middleware
 * Middleware utama untuk menangani semua error di aplikasi
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || err.status || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;
        error.name = err.name;

        // Handle specific error types
        error = handleSequelizeError(error);
        error = handleJWTError(error);

        sendErrorProd(error, res);
    }
};

/**
 * Async Handler Wrapper
 * Wrapper untuk menangkap error dari async functions
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found Handler
 * Middleware untuk menangani route yang tidak ditemukan
 */
const notFoundHandler = (req, res, next) => {
    const err = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(err);
};

module.exports = {
    // Error Classes
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
    
    // Middleware
    errorHandler,
    asyncHandler,
    notFoundHandler,
};
