const bcrypt = require('bcryptjs');
const db = require('./db');
const Role = require('./role');

module.exports = {
    seedDatabase
};

async function seedDatabase() {
    try {
        console.log('Checking if database needs seeding...');
        
        // Check if we need to seed the database
        const adminCount = await db.Account.count({ where: { role: Role.Admin } });
        const accountCount = await db.Account.count();
        const departmentCount = await db.Department.count();
        const employeeCount = await db.Employee.count();
        const requestCount = await db.Request.count();
        const workflowCount = await db.Workflow.count();
        
        // If there's already data in the database, don't seed
        if (adminCount > 0 || accountCount > 0) {
            console.log('Database already has accounts, skipping seed process');
            return;
        }
        
        console.log('Seeding database with default data...');
        
        // Create departments
        const departments = await db.Department.bulkCreate([
            { name: 'Human Resources', description: 'Manages employee relations and recruitment' },
            { name: 'Information Technology', description: 'Handles technical infrastructure and support' },
            { name: 'Finance', description: 'Manages company finances and budgeting' },
            { name: 'Marketing', description: 'Handles company branding and promotions' }
        ]);
        
        console.log('Created departments:', departments.length);
        
        // Create user accounts
        const accounts = await db.Account.bulkCreate([
            {
                email: 'admin@example.com',
                passwordHash: await bcrypt.hash('admin123', 10),
                firstName: 'Admin',
                lastName: 'User',
                title: 'System Administrator',
                role: Role.User,
                verified: new Date(),
                acceptTerms: true
            },
            {
                email: 'hr@example.com',
                passwordHash: await bcrypt.hash('user123', 10),
                firstName: 'HR',
                lastName: 'Manager',
                title: 'HR Director',
                role: Role.User,
                verified: new Date(),
                acceptTerms: true
            },
            {
                email: 'tech@example.com',
                passwordHash: await bcrypt.hash('user123', 10),
                firstName: 'Tech',
                lastName: 'Support',
                title: 'IT Specialist',
                role: Role.User,
                verified: new Date(),
                acceptTerms: true
            },
            {
                email: 'finance@example.com',
                passwordHash: await bcrypt.hash('user123', 10),
                firstName: 'Finance',
                lastName: 'Officer',
                title: 'Financial Analyst',
                role: Role.User,
                verified: new Date(),
                acceptTerms: true
            }
        ]);
        
        console.log('Created accounts:', accounts.length);
        
        // Create employees linked to user accounts
        const employees = await db.Employee.bulkCreate([
            {
                employeeId: 'EMP001',
                userId: accounts[0].id,
                position: 'System Administrator',
                departmentId: departments[1].id, // IT department
                hireDate: new Date(),
                status: 'Active'
            },
            {
                employeeId: 'EMP002',
                userId: accounts[1].id,
                position: 'HR Director',
                departmentId: departments[0].id, // HR department
                hireDate: new Date(),
                status: 'Active'
            },
            {
                employeeId: 'EMP003',
                userId: accounts[2].id,
                position: 'IT Specialist',
                departmentId: departments[1].id, // IT department
                hireDate: new Date(),
                status: 'Active'
            },
            {
                employeeId: 'EMP004',
                userId: accounts[3].id,
                position: 'Financial Analyst',
                departmentId: departments[2].id, // Finance department
                hireDate: new Date(),
                status: 'Active'
            }
        ]);
        
        console.log('Created employees:', employees.length);
        
        // Create requests
        const requests = await db.Request.bulkCreate([
            {
                type: 'Equipment',
                status: 'Pending',
                employeeId: employees[1].id,
                details: { reason: 'Need new laptop for HR tasks' }
            },
            {
                type: 'Leave',
                status: 'Approved',
                employeeId: employees[2].id,
                details: { startDate: '2023-06-15', endDate: '2023-06-20', reason: 'Vacation' }
            },
            {
                type: 'Training',
                status: 'Pending',
                employeeId: employees[3].id,
                details: { course: 'Advanced Excel', date: '2023-07-10' }
            }
        ]);
        
        console.log('Created requests:', requests.length);
        
        // Create request items
        const requestItems = await db.RequestItem.bulkCreate([
            {
                name: 'Laptop',
                quantity: 1,
                requestId: requests[0].id
            },
            {
                name: 'Monitor',
                quantity: 2,
                requestId: requests[0].id
            },
            {
                name: 'Excel Course Materials',
                quantity: 1,
                requestId: requests[2].id
            }
        ]);
        
        console.log('Created request items:', requestItems.length);
        
        // Create workflows
        const workflows = await db.Workflow.bulkCreate([
            {
                employeeId: employees[1].id,
                type: 'Onboarding',
                status: 'Completed',
                details: { steps: ['Documentation', 'Training', 'Equipment Setup'] }
            },
            {
                employeeId: employees[2].id,
                type: 'Leave Approval',
                status: 'Pending',
                details: { approvers: ['HR Manager', 'Department Head'] }
            },
            {
                employeeId: employees[3].id,
                type: 'Training Request',
                status: 'Pending',
                details: { approver: 'Department Head' }
            }
        ]);
        
        console.log('Created workflows:', workflows.length);
        
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
} 