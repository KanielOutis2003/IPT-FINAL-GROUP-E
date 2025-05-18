const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    console.log(`Authorize middleware called with roles: ${JSON.stringify(roles)}`);

    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // Authenticate JWT token
        jwt({ secret, algorithms: ['HS256'] }),

        // Authorize based on user role
        async (req, res, next) => {
            console.log(`JWT verified, checking account with ID: ${req.user?.id}`);
            try {
                const account = await db.Account.findByPk(req.user.id);
                
                if (!account) {
                    console.log(`Account not found with ID: ${req.user.id}`);
                    return res.status(401).json({ message: 'Unauthorized - Account not found' });
                }
                
                if (roles.length && !roles.includes(account.role)) {
                    console.log(`Unauthorized role. Required: ${JSON.stringify(roles)}, User has: ${account.role}`);
                    return res.status(401).json({ message: 'Unauthorized - Insufficient role' });
                }

                console.log(`Authorization successful for user: ${account.id}, role: ${account.role}`);
                req.user.role = account.role;
                
                const employee = await db.Employee.findOne({ where: { userId: account.id } });
                if (employee) {
                    req.user.employeeId = employee.id;
                    console.log(`Employee ID attached: ${employee.id}`);
                }
                
                const refreshTokens = await db.RefreshToken.findAll({ where: { accountId: account.id } });
                req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
                next();
            } catch (error) {
                console.error('Error in authorization middleware:', error);
                return res.status(500).json({ message: 'Authorization error' });
            }
        }
    ];
}