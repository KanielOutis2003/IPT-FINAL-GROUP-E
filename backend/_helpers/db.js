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
        const connection = await mysql.createConnection({ 
            host, 
            port, 
            user, 
            password,
            connectTimeout: 10000
        });
        
        console.log('Successfully connected to MySQL server');
        
        // Create database if it doesn't exist
        console.log(`Creating database ${database} if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        console.log(`Database ${database} is ready`);
        
        // Close the initial connection
        await connection.end();
        
        // Create Sequelize instance
        console.log('Initializing Sequelize...');
        const sequelize = new Sequelize(database, user, password, { 
            host,
            port,
            dialect: 'mysql',
            logging: false
        });
        
        // Test Sequelize connection
        await sequelize.authenticate();
        console.log('Sequelize connection established successfully');
        
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

        // Sync database
        console.log('Syncing database...');
        await sequelize.sync({ alter: true });
        console.log('Database sync completed');
        
        // Seed data if needed
        console.log('Seeding database...');
        const seedData = require('./seed-data');
        await seedData.seedDatabase();
        console.log('Database seeding completed');
        
        console.log('Database initialization completed successfully');
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