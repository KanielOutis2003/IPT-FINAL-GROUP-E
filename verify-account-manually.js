// Script to manually verify an account by email
require('rootpath')();
const config = require('./backend/config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

async function main() {
    try {
        // Initialize database connection
        const { host, port, user, password, database } = config.database;
        console.log('Database connection details:', { 
            host, port, user, database,
            hasPassword: !!password 
        });
        
        // Create Sequelize instance
        const sequelize = new Sequelize(database, user, password, { 
            host, port, dialect: 'mysql', logging: false
        });
        
        // Test Sequelize connection
        await sequelize.authenticate();
        console.log('Sequelize connection established successfully');
        
        // Define Account model
        const Account = sequelize.define('Account', {
            email: { type: Sequelize.STRING },
            verified: { type: Sequelize.DATE },
            verificationToken: { type: Sequelize.STRING }
        }, { tableName: 'Accounts' });
        
        // Check if email was provided as command line argument
        const email = process.argv[2];
        if (!email) {
            console.log('Please provide an email address as a command line argument');
            console.log('Example: node verify-account-manually.js user@example.com');
            process.exit(1);
        }
        
        // Verify the account
        await verifyAccountByEmail(email, Account);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

async function verifyAccountByEmail(email, Account) {
    try {
        console.log(`Attempting to verify account with email: ${email}`);
        
        // Find the account
        const account = await Account.findOne({ where: { email } });
        
        if (!account) {
            console.log(`Account with email ${email} not found`);
            return;
        }
        
        console.log(`Found account: ${account.email}`);
        console.log(`Current verification status: ${account.verified ? 'Verified' : 'Not verified'}`);
        
        // Set the verified date and clear the token
        account.verified = new Date();
        account.verificationToken = null;
        
        // Save the changes
        await account.save();
        
        // Verify the changes were saved
        const updatedAccount = await Account.findOne({ where: { email } });
        console.log(`Updated verification status: ${updatedAccount.verified ? 'Verified' : 'Not verified'}`);
        console.log('Account verified successfully');
    } catch (error) {
        console.error('Error verifying account:', error);
    }
}

// Run the main function
main(); 