const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting debug build process...');

// Check if we're on Render by checking environment variable
const isRender = process.env.RENDER === 'true';
console.log(`Running on Render: ${isRender ? 'Yes' : 'No'}`);

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

// Move to the frontend directory for all Angular operations
console.log('Changing to frontend directory...');
process.chdir('./frontend');

// List directory contents (works on both Windows and Linux)
console.log('Listing directory contents:');
try {
  if (process.platform === 'win32') {
    execSync('dir', { stdio: 'inherit' });
  } else {
    execSync('ls -la', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('Error listing directory:', error);
}

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

// Find the correct path to Angular CLI
let ngPath;
if (fs.existsSync('./node_modules/.bin/ng')) {
  ngPath = './node_modules/.bin/ng';
} else if (fs.existsSync('./node_modules/@angular/cli/bin/ng')) {
  ngPath = 'node ./node_modules/@angular/cli/bin/ng';
} else {
  console.log('WARNING: Could not find Angular CLI binary, will try with npx');
  ngPath = 'npx ng';
}

// Build the Angular app using the local node_modules binaries
console.log(`Building Angular app using: ${ngPath}`);
try {
  execSync(`${ngPath} build --configuration production`, { stdio: 'inherit' });
  console.log('Angular app built successfully.');
} catch (error) {
  console.log('ERROR building Angular app:', error);
  console.log(error.message);
  
  // Try an alternative approach with npx if the first one failed
  try {
    console.log('Trying alternative build approach with npx...');
    execSync('npx @angular/cli@16.2.12 build --configuration production', { stdio: 'inherit' });
    console.log('Angular app built successfully with alternative approach.');
  } catch (altError) {
    console.log('ERROR building Angular app with alternative approach:', altError);
    process.exit(1);
  }
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