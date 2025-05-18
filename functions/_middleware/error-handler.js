module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    console.error(`Error processing request to ${req.method} ${req.path}:`, err);
    
    switch (true) {
        case typeof err === 'string':
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            console.log(`String error (${statusCode}): ${err}`);
            return res.status(statusCode).json({ message: err });
            
        case err.name === 'UnauthorizedError':
            console.log('JWT authorization error:', err.message);
            return res.status(401).json({ message: 'Unauthorized', details: err.message });
            
        case err.name === 'ValidationError':
            console.log('Validation error:', err.message);
            return res.status(400).json({ message: 'Validation Error', details: err.message });
            
        case err.name === 'SequelizeError' || err.name === 'SequelizeDatabaseError':
            console.log('Database error:', err.message);
            return res.status(500).json({ message: 'Database Error', details: 'A database error occurred' });
            
        default:
            console.error('Unhandled error:', err);
            return res.status(500).json({ message: 'Internal Server Error', details: err.message });
    }
}