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
        
        // Ensure all required properties exist
        if (!config.database) config.database = {};
        if (!config.frontendUrls) config.frontendUrls = {};
        if (!config.backendUrls) config.backendUrls = {};
        
        // Ensure development and production URLs exist
        if (!config.frontendUrls.development) config.frontendUrls.development = "http://localhost:4200";
        if (!config.frontendUrls.production) config.frontendUrls.production = "https://r-ito-f1e03.web.app";
        if (!config.backendUrls.development) config.backendUrls.development = "http://localhost:10001";
        if (!config.backendUrls.production) config.backendUrls.production = "https://ipt-final-group-e-zht3.onrender.com";
        
        // Override config settings with environment variables when available
        config.database.host = process.env.DB_HOST || config.database.host || "localhost";
        console.log(`Environment variable DB_HOST ${process.env.DB_HOST ? 'found' : 'not found'}, using ${config.database.host}`);
        
        config.database.port = parseInt(process.env.DB_PORT || config.database.port || 3306);
        console.log(`Environment variable DB_PORT ${process.env.DB_PORT ? 'found' : 'not found'}, using ${config.database.port}`);
        
        config.database.user = process.env.DB_USER || config.database.user || "root";
        console.log(`Environment variable DB_USER ${process.env.DB_USER ? 'found' : 'not found'}, using ${config.database.user}`);
        
        config.database.password = process.env.DB_PASSWORD || config.database.password || "";
        console.log(`Environment variable DB_PASSWORD ${process.env.DB_PASSWORD ? 'found' : 'not found'}, using fallback`);
        
        config.database.database = process.env.DB_NAME || config.database.database || "testdb";
        console.log(`Environment variable DB_NAME ${process.env.DB_NAME ? 'found' : 'not found'}, using ${config.database.database}`);
        
        config.secret = process.env.JWT_SECRET || config.secret || "DEFAULT_SECRET_KEY_CHANGE_IN_PRODUCTION";
        console.log(`Environment variable JWT_SECRET ${process.env.JWT_SECRET ? 'found' : 'not found'}, using fallback`);
        
        config.emailFrom = process.env.EMAIL_FROM || config.emailFrom || "noreply@example.com";
        console.log(`Environment variable EMAIL_FROM ${process.env.EMAIL_FROM ? 'found' : 'not found'}, using fallback`);
        
        // Set up SMTP with fallbacks
        if (!config.smtpOptions) config.smtpOptions = {};
        
        if (process.env.SMTP_HOST) {
            config.smtpOptions = {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                auth: {
                    user: process.env.SMTP_USER || "",
                    pass: process.env.SMTP_PASS || ""
                }
            };
        } else {
            // Make sure we have default fallbacks
            config.smtpOptions.host = config.smtpOptions.host || "smtp.example.com";
            config.smtpOptions.port = config.smtpOptions.port || 587;
            if (!config.smtpOptions.auth) config.smtpOptions.auth = {};
            config.smtpOptions.auth.user = config.smtpOptions.auth.user || "user@example.com";
            config.smtpOptions.auth.pass = config.smtpOptions.auth.pass || "password";
            
            console.log(`Environment variable SMTP_HOST not found, using fallback`);
            console.log(`Environment variable SMTP_PORT not found, using fallback`);
            console.log(`Environment variable SMTP_USER not found, using fallback`);
            console.log(`Environment variable SMTP_PASS not found, using fallback`);
        }
        
        if (process.env.FRONTEND_URL) {
            config.frontendUrls.development = process.env.FRONTEND_URL;
            config.frontendUrls.production = process.env.FRONTEND_URL;
        } else {
            console.log(`Environment variable FRONTEND_URL not found, using fallback: ${config.frontendUrls.development}`);
        }
        
        if (process.env.PRODUCTION_FRONTEND_URL) {
            config.frontendUrls.production = process.env.PRODUCTION_FRONTEND_URL;
        } else {
            console.log(`Environment variable PRODUCTION_FRONTEND_URL not found, using fallback: ${config.frontendUrls.production}`);
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