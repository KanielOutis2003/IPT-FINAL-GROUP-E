// Simple Express server to serve static Angular files
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Get port from environment or use 4200 as default
const PORT = process.env.PORT || 4200;

// Path to the static files
const distPath = path.join(__dirname, 'dist', 'frontend');
const indexPath = path.join(distPath, 'index.html');

// Check if dist/frontend exists, if not, create a simple placeholder
if (!fs.existsSync(distPath)) {
  console.log('Creating placeholder frontend...');
  fs.mkdirSync(distPath, { recursive: true });
  
  // Create a simple index.html if it doesn't exist
  if (!fs.existsSync(indexPath)) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Management System</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #333; }
          .loader { border: 16px solid #f3f3f3; border-top: 16px solid #3498db; border-radius: 50%; width: 120px; height: 120px; animation: spin 2s linear infinite; margin: 0 auto; margin-top: 50px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h1>User Management System</h1>
        <p>The application is temporarily in maintenance mode.</p>
        <p>Please try again later.</p>
        <div class="loader"></div>
      </body>
      </html>
    `;
    fs.writeFileSync(indexPath, html);
  }
}

// Serve static files from /dist/frontend
app.use(express.static(distPath));

// For any routes that don't match static files, send the index.html
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
}); 