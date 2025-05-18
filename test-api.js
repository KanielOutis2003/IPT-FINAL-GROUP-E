// Import fetch properly for Node.js v18+
import('node-fetch').then(({ default: fetch }) => {
  async function testAPI() {
    try {
      console.log('Testing API connection...');
      
      // Test the authenticate endpoint with seed account
      const response = await fetch('http://localhost:10001/api/accounts/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
    } catch (error) {
      console.error('Error testing API:', error);
    }
  }

  testAPI();
}).catch(err => {
  console.error('Failed to import node-fetch:', err);
}); 