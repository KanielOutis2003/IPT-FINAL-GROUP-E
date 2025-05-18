const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('Attempting to connect to database...');
        const conn = await mysql.createConnection({
            host: '153.92.15.31', 
            port: 3306, 
            user: 'u875409848_ito', 
            password: '9T2Z5$3UKkgSYzE', 
            database: 'u875409848_ito',
            connectTimeout: 30000
        });
        
        console.log('Connected successfully!');
        
        const [rows] = await conn.query('SELECT 1 as test');
        console.log('Query result:', rows);
        
        console.log('Running SHOW TABLES query...');
        const [tables] = await conn.query('SHOW TABLES');
        console.log('Tables in database:', tables);
        
        await conn.end();
        console.log('Connection closed');
    } catch (err) {
        console.error('Error connecting to database:', err);
        console.error('Error details:', {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
        });
    }
}

testConnection(); 