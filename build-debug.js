const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting debug build process...');

// Check if frontend directory exists
console.log('Checking if frontend directory exists...');
if (fs.existsSync('./frontend')) {
  console.log('Frontend directory found.');
} else {
  console.log('ERROR: Frontend directory not found!');
  process.exit(1);
}

// Check if Angular CLI is installed globally
try {
  console.log('Checking if Angular CLI is installed...');
  execSync('npx -v', { stdio: 'inherit' });
  console.log('NPX available.');
} catch (error) {
  console.log('ERROR: NPX not available:', error);
  process.exit(1);
}

// Show directory structure
console.log('Showing directory structure:');
try {
  execSync('ls -la', { stdio: 'inherit' });
  console.log('Showing frontend directory structure:');
  execSync('ls -la ./frontend', { stdio: 'inherit' });
} catch (error) {
  console.log('Error showing directory structure:', error);
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

// Move to the frontend directory for all Angular operations
console.log('Changing to frontend directory...');
process.chdir('./frontend');

// Install frontend dependencies
console.log('Installing frontend dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Frontend dependencies installed successfully.');
} catch (error) {
  console.log('ERROR installing frontend dependencies:', error);
  process.exit(1);
}

// Explicitly install Angular CLI and build package in frontend directory
console.log('Installing Angular CLI and build packages...');
try {
  execSync('npm install @angular/cli@16.2.12 @angular-devkit/build-angular@16.2.12 --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Angular CLI and build packages installed successfully.');
} catch (error) {
  console.log('ERROR installing Angular CLI and build packages:', error);
  // Continue anyway, it might already be installed
}

// Build the Angular app using the local node_modules binaries
console.log('Building Angular app...');
try {
  // Use the local node_modules/.bin/ng directly
  execSync('node ./node_modules/@angular/cli/bin/ng build --configuration production', { stdio: 'inherit' });
  console.log('Angular app built successfully.');
} catch (error) {
  console.log('ERROR building Angular app:', error);
  console.log(error.message);
  process.exit(1);
}

// Return to the root directory
console.log('Returning to root directory...');
process.chdir('..');

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