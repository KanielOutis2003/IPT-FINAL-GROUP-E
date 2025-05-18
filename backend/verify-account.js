require('rootpath')();
const db = require('_helpers/db');

// Function to verify an account by email
async function verifyAccountByEmail(email) {
    try {
        // Find the account
        const account = await db.Account.findOne({ where: { email } });
        
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
        const updatedAccount = await db.Account.findOne({ where: { email } });
        console.log(`Updated verification status: ${updatedAccount.verified ? 'Verified' : 'Not verified'}`);
        console.log('Account verified successfully');
    } catch (error) {
        console.error('Error verifying account:', error);
    } finally {
        process.exit();
    }
}

// Check if email argument is provided
const email = process.argv[2];
if (!email) {
    console.log('Please provide an email address as an argument');
    console.log('Usage: node verify-account.js <email>');
    process.exit(1);
}

// Run the verification
verifyAccountByEmail(email); 