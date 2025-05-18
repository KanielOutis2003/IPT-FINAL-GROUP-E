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

// Install frontend dependencies
console.log('Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Frontend dependencies installed successfully.');
} catch (error) {
  console.log('ERROR installing frontend dependencies:', error);
  process.exit(1);
}

// Check if build-angular is installed
console.log('Checking if @angular-devkit/build-angular is installed in frontend...');
const frontendNodeModulesPath = path.join('frontend', 'node_modules', '@angular-devkit', 'build-angular');
if (fs.existsSync(frontendNodeModulesPath)) {
  console.log('@angular-devkit/build-angular found in frontend node_modules.');
} else {
  console.log('WARNING: @angular-devkit/build-angular not found in frontend node_modules.');
  console.log('Installing @angular-devkit/build-angular explicitly...');
  try {
    execSync('cd frontend && npm install @angular-devkit/build-angular@16.2.12 --legacy-peer-deps', { stdio: 'inherit' });
    console.log('@angular-devkit/build-angular installed explicitly.');
  } catch (error) {
    console.log('ERROR installing @angular-devkit/build-angular:', error);
  }
}

// Build the Angular app
console.log('Building Angular app...');
try {
  execSync('cd frontend && npx ng build --configuration production', { stdio: 'inherit' });
  console.log('Angular app built successfully.');
} catch (error) {
  console.log('ERROR building Angular app:', error);
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