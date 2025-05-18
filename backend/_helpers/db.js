const config = require('./config');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    try {
        const { host, port, user, password, database } = config.database;
        console.log('Database connection details:', { 
            host, 
            port, 
            user, 
            database,
            // Don't log the actual password
            hasPassword: !!password 
        });
        
        // Test the connection first
        console.log('Attempting to connect to MySQL server...');
        console.log(`Connecting to: ${host}:${port} with user ${user}`);
        
        try {
            const connection = await mysql.createConnection({ 
                host, 
                port, 
                user, 
                password,
                connectTimeout: 20000
            });
            
            console.log('Successfully connected to MySQL server');
            
            // Test if we can query the server
            console.log('Testing query execution...');
            const [results] = await connection.query('SELECT 1 as test');
            console.log('Query test result:', results);
            
            // Create database if it doesn't exist
            console.log(`Creating database ${database} if it doesn't exist...`);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
            console.log(`Database ${database} is ready`);
            
            // Close the initial connection
            await connection.end();
        } catch (connectionError) {
            console.error('Failed to connect to MySQL server:', connectionError);
            console.error('Connection error details:', {
                code: connectionError.code,
                errno: connectionError.errno,
                sqlState: connectionError.sqlState,
                sqlMessage: connectionError.sqlMessage
            });
            throw connectionError;
        }
        
        // Create Sequelize instance
        console.log('Initializing Sequelize...');
        const sequelize = new Sequelize(database, user, password, { 
            host,
            port,
            dialect: 'mysql',
            logging: console.log,  // Enable SQL logging
            dialectOptions: {
                connectTimeout: 20000
            }
        });
        
        // Test Sequelize connection
        try {
            await sequelize.authenticate();
            console.log('Sequelize connection established successfully');
        } catch (authError) {
            console.error('Sequelize authentication failed:', authError);
            console.error('Authentication error details:', {
                code: authError.code,
                errno: authError.errno,
                sqlState: authError.sqlState,
                sqlMessage: authError.sqlMessage
            });
            throw authError;
        }
        
        // Initialize models
        console.log('Initializing models...');
        db.Account = require('../accounts/account.model')(sequelize);
        db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
        db.Employee = require('../employees/employee.model')(sequelize);
        db.Department = require('../departments/department.model')(sequelize);
        db.Request = require('../requests/request.model')(sequelize);
        db.RequestItem = require('../requests/request-item.model')(sequelize);
        db.Workflow = require('../workflows/workflow.model')(sequelize);
        
        // Set up associations
        console.log('Setting up model associations...');
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);

        db.Employee.belongsTo(db.Account, { foreignKey: 'userId', as: 'user' });
        db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });
        db.Department.hasMany(db.Employee, { foreignKey: 'departmentId' });

        db.Request.belongsTo(db.Employee, { foreignKey: 'employeeId' });
        db.Request.hasMany(db.RequestItem, { foreignKey: 'requestId' });
        db.RequestItem.belongsTo(db.Request, { foreignKey: 'requestId' });

        db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId', as: 'employee' });
        db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId', as: 'workflows' });

        // Sync database - using force: true for development to recreate tables
        // Change to alter: true for production
        console.log('Syncing database...');
        try {
            // Use alter: true instead of force for a production database
            await sequelize.sync({ alter: true });
            console.log('Database sync completed');
            
            // Seed data if needed
            console.log('Seeding database...');
            const seedData = require('./seed-data');
            await seedData.seedDatabase();
            console.log('Database seeding completed');
            
            console.log('Database initialization completed successfully');
        } catch (syncError) {
            console.error('Database sync error:', syncError);
            console.error('Sync error details:', {
                code: syncError.code,
                errno: syncError.errno,
                sqlState: syncError.sqlState,
                sqlMessage: syncError.sqlMessage
            });
            console.error('SQL causing the error:', syncError.sql);
            console.error('Falling back to creating tables individually...');
            
            // Try to sync each model individually
            for (const model of Object.values(sequelize.models)) {
                try {
                    await model.sync({ alter: true });
                    console.log(`Model ${model.name} synced successfully`);
                } catch (modelSyncError) {
                    console.error(`Error syncing model ${model.name}:`, modelSyncError);
                    console.error('Model sync error details:', {
                        code: modelSyncError.code,
                        errno: modelSyncError.errno,
                        sqlState: modelSyncError.sqlState,
                        sqlMessage: modelSyncError.sqlMessage
                    });
                }
            }
            
            // Try to seed anyway
            try {
                console.log('Attempting to seed database despite sync errors...');
                const seedData = require('./seed-data');
                await seedData.seedDatabase();
                console.log('Database seeding completed');
            } catch (seedError) {
                console.error('Database seeding error:', seedError);
                console.error('Seed error details:', {
                    code: seedError.code,
                    errno: seedError.errno,
                    sqlState: seedError.sqlState,
                    sqlMessage: seedError.sqlMessage
                });
            }
        }
    } catch (error) {
        console.error('Database initialization error:', error);
        console.error('Error details:', {
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        throw error;
    }
}