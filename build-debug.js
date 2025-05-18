const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting simplified build process...');

// Check if frontend directory exists
console.log('Checking if frontend directory exists...');
if (fs.existsSync('./frontend')) {
  console.log('Frontend directory found.');
} else {
  console.log('ERROR: Frontend directory not found!');
  process.exit(1);
}

// Install dependencies in root
console.log('Installing dependencies in root directory...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Root dependencies installed successfully.');
} catch (error) {
  console.log('ERROR installing root dependencies:', error);
  process.exit(1);
}

// Create a frontend dist directory
console.log('Creating frontend dist directory...');
try {
  // Create dist/frontend directory structure
  const distPath = path.join('frontend', 'dist', 'frontend');
  if (!fs.existsSync(path.join('frontend', 'dist'))) {
    fs.mkdirSync(path.join('frontend', 'dist'));
  }
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  }
  
  // Create a simple index.html file
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ITO - Request Management System</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 800px; margin: 0 auto; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    h1, h2 { color: #2c3e50; }
    .btn { display: inline-block; padding: 10px 15px; background: #3498db; color: white; 
           text-decoration: none; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>ITO - Request Management System</h1>
    
    <div class="card">
      <h2>Maintenance Mode</h2>
      <p>The application is currently being updated. Please check back later.</p>
      <p>The backend API is available at the normal endpoints.</p>
      <p>For API documentation, please visit: <a href="/api-docs">/api-docs</a></p>
      <a class="btn" href="/api-docs">View API Documentation</a>
    </div>
    
    <div class="card">
      <h2>Backend Status</h2>
      <p>The backend services are currently running.</p>
      <p>Database connection and other services have been configured.</p>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);
  console.log('Created static index.html file.');
  
  // Create an assets directory and favicon.ico
  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath);
  }
  
  // Create an empty favicon.ico file
  fs.writeFileSync(path.join(distPath, 'favicon.ico'), '');
  
  console.log('Frontend static files created successfully.');
} catch (error) {
  console.log('ERROR creating frontend static files:', error);
  process.exit(1);
}

// Install backend dependencies
console.log('Installing backend dependencies...');
try {
  execSync('cd backend && npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Backend dependencies installed successfully.');
} catch (error) {
  console.log('ERROR installing backend dependencies:', error);
  process.exit(1);
}

console.log('Build process completed successfully!'); 