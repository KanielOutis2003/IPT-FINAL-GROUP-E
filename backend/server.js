require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');
const config = require('_helpers/config');
const path = require('path');

// Add this near the top of the file, after the requires
console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    // Don't log the actual password
    hasDBPassword: !!process.env.DB_PASSWORD
});

// CORS configuration with specific allowed origin
app.use(cors({
    origin: ['http://localhost:4200', 'https://ipt-final-224d3.web.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Get the root directory (where both frontend and backend folders are)
const rootDir = path.join(__dirname, '..');
const frontendPath = path.join(rootDir, 'frontend', 'dist', 'frontend');

console.log('Root directory:', rootDir);
console.log('Frontend path:', frontendPath);

// Serve static files from the frontend build directory
app.use(express.static(frontendPath));

// api routes
app.use('/api/accounts', require('./accounts/accounts.controller'));
app.use('/api/employees', require('./employees/index'));
app.use('/api/departments', require('./departments/index'));
app.use('/api/requests', require('./requests/index'));
app.use('/api/workflows', require('./workflows/index'));

// swagger docs route
app.use('/api-docs', require('_helpers/swagger'));

// global error handler
app.use(errorHandler);

// Handle frontend routes - must be after API routes
app.get('*', (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    console.log('Current directory:', __dirname);
    console.log('Root directory:', rootDir);
    console.log('Frontend path:', frontendPath);
    console.log('Serving index.html from:', indexPath);
    
    // Check if the file exists before trying to serve it
    const fs = require('fs');
    if (!fs.existsSync(frontendPath)) {
        console.error('Frontend directory does not exist:', frontendPath);
        console.error('Directory contents of root:', fs.readdirSync(rootDir));
        return res.status(500).send('Frontend build not found. Please check the build process.');
    }
    
    if (!fs.existsSync(indexPath)) {
        console.error('index.html does not exist in:', frontendPath);
        console.error('Frontend directory contents:', fs.readdirSync(frontendPath));
        return res.status(500).send('Frontend index.html not found. Please check the build process.');
    }
    
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            console.error('Current directory:', __dirname);
            console.error('Root directory:', rootDir);
            console.error('Frontend path:', frontendPath);
            console.error('Full index path:', indexPath);
            res.status(500).send('Error loading frontend application');
        }
    });
});

// start server
let port;
if (process.env.PORT) {
    port = parseInt(process.env.PORT, 10);
} else {
    port = process.env.NODE_ENV === 'production' ? 80 : 10001;
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log('Current directory:', __dirname);
    console.log('Root directory:', rootDir);
    console.log('Frontend path:', frontendPath);
});

// Export the app for Firebase Functions
module.exports = app;