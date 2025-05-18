require('dotenv').config();
const path = require('path');
const fs = require('fs');
const rootPath = require('rootpath')();

function getConfig() {
    try {
        console.log('Current directory:', process.cwd());
        
        // Look for .env file first
        const envPath = path.join(process.cwd(), '.env');
        console.log('Looking for .env file at:', envPath);
        if (fs.existsSync(envPath)) {
            console.log('.env file found');
        } else {
            console.log('.env file not found');
        }
        
        // Load config from json file
        const configPath = path.join(process.cwd(), 'config.json');
        console.log('Loaded default config from:', configPath);
        const config = require(configPath);
        
        // Override config settings with environment variables when available
        config.database.host = process.env.DB_HOST || config.database.host;
        console.log(`Environment variable DB_HOST ${process.env.DB_HOST ? 'found' : 'not found'}, using ${config.database.host}`);
        
        config.database.port = parseInt(process.env.DB_PORT || config.database.port);
        console.log(`Environment variable DB_PORT ${process.env.DB_PORT ? 'found' : 'not found'}, using ${config.database.port}`);
        
        config.database.user = process.env.DB_USER || config.database.user;
        console.log(`Environment variable DB_USER ${process.env.DB_USER ? 'found' : 'not found'}, using ${config.database.user}`);
        
        config.database.password = process.env.DB_PASSWORD || config.database.password;
        console.log(`Environment variable DB_PASSWORD ${process.env.DB_PASSWORD ? 'found' : 'not found'}, using fallback`);
        
        config.database.database = process.env.DB_NAME || config.database.database;
        console.log(`Environment variable DB_NAME ${process.env.DB_NAME ? 'found' : 'not found'}, using ${config.database.database}`);
        
        config.secret = process.env.JWT_SECRET || config.secret;
        console.log(`Environment variable JWT_SECRET ${process.env.JWT_SECRET ? 'found' : 'not found'}, using fallback`);
        
        config.emailFrom = process.env.EMAIL_FROM || config.emailFrom;
        console.log(`Environment variable EMAIL_FROM ${process.env.EMAIL_FROM ? 'found' : 'not found'}, using fallback`);
        
        if (process.env.SMTP_HOST) {
            config.smtpOptions = {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            };
        } else {
            console.log(`Environment variable SMTP_HOST not found, using fallback`);
            console.log(`Environment variable SMTP_PORT not found, using fallback`);
            console.log(`Environment variable SMTP_USER not found, using fallback`);
            console.log(`Environment variable SMTP_PASS not found, using fallback`);
        }
        
        if (process.env.FRONTEND_URL) {
            config.frontendUrls.development = process.env.FRONTEND_URL;
        } else {
            console.log(`Environment variable FRONTEND_URL not found, using fallback: ${config.frontendUrls.development}`);
        }
        
        if (process.env.PRODUCTION_FRONTEND_URL) {
            config.frontendUrls.production = process.env.PRODUCTION_FRONTEND_URL;
        } else {
            console.log(`Environment variable PRODUCTION_FRONTEND_URL not found, using fallback`);
        }
        
        console.log('Final database config:', {
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            database: config.database.database,
            hasPassword: !!config.database.password,
        });
        
        console.log('Config loaded successfully');
        
        return config;
    } catch (error) {
        console.error('Error loading configuration:', error);
        throw error;
    }
}

module.exports = getConfig(); 