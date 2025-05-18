const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const config = require('./config.json');

async function createUser() {
    try {
        // Connect to database
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database
        });
        
        console.log('Connected to database');
        
        // Create user details
        const email = 'rodmayol82@gmail.com';
        const password = 'Pass@word1';
        const passwordHash = await bcrypt.hash(password, 10);
        const role = 'Admin'; // Options: Admin, User
        
        // Check if email already exists
        const [existingUsers] = await connection.query(
            'SELECT * FROM accounts WHERE email = ?', 
            [email]
        );
        
        if (existingUsers.length > 0) {
            console.log(`User with email ${email} already exists`);
            console.log('Existing user details:', existingUsers[0]);
            
            // Update password if user wants to reset
            const resetPassword = true; // Set to true to reset password
            
            if (resetPassword) {
                await connection.query(
                    'UPDATE accounts SET passwordHash = ? WHERE email = ?',
                    [passwordHash, email]
                );
                console.log('Password has been reset');
            }
            
            await connection.end();
            return;
        }
        
        // Insert new user
        const now = new Date();
        const verificationToken = randomTokenString();
        
        const [result] = await connection.query(
            `INSERT INTO accounts 
             (email, passwordHash, title, firstName, lastName, acceptTerms, role, verificationToken, created, updated) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, passwordHash, 'Mr', 'Rod', 'Mayol', true, role, verificationToken, now, now]
        );
        
        console.log('User created successfully');
        console.log('User ID:', result.insertId);
        
        // Verify the account immediately for convenience
        await connection.query(
            'UPDATE accounts SET verified = ? WHERE id = ?',
            [now, result.insertId]
        );
        
        console.log('Account verified');
        console.log('Login Credentials:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role:', role);
        
        await connection.end();
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

function randomTokenString() {
    return require('crypto').randomBytes(40).toString('hex');
}

createUser(); 