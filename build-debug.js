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

// Check angular.json file
console.log('Checking Angular configuration...');
try {
  if (fs.existsSync('./angular.json')) {
    const angularConfig = require('./angular.json');
    console.log('Angular project type:', angularConfig.projects?.frontend?.projectType);
    console.log('Angular builder:', angularConfig.projects?.frontend?.architect?.build?.builder);
  } else {
    console.log('WARNING: angular.json file not found!');
  }
} catch (error) {
  console.log('Error reading angular.json:', error);
}

// Remove node_modules to start fresh
console.log('Removing node_modules directory...');
try {
  if (process.platform === 'win32') {
    if (fs.existsSync('./node_modules')) {
      execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
    }
  } else {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  console.log('Removed node_modules directory.');
} catch (error) {
  console.log('Error removing node_modules directory:', error);
}

// Install frontend dependencies
console.log('Installing frontend dependencies...');
try {
  execSync('npm install --legacy-peer-deps --verbose', { stdio: 'inherit' });
  console.log('Frontend dependencies installed successfully.');
} catch (error) {
  console.log('ERROR installing frontend dependencies:', error);
  process.exit(1);
}

// Check if core packages are installed
console.log('Checking for key Angular packages:');
const requiredPackages = [
  '@angular/cli',
  '@angular-devkit/build-angular'
];

for (const pkg of requiredPackages) {
  if (fs.existsSync(`./node_modules/${pkg}`)) {
    console.log(`✓ ${pkg} is installed.`);
  } else {
    console.log(`✗ ${pkg} is NOT installed. Installing it now...`);
    try {
      execSync(`npm install ${pkg}@16.2.12 --legacy-peer-deps --verbose`, { stdio: 'inherit' });
    } catch (err) {
      console.log(`ERROR installing ${pkg}:`, err);
    }
  }
}

// Try a direct build approach using the locally installed packages
console.log('Attempting direct Angular build...');
try {
  // Create a direct build script
  const buildScript = `
    const { execSync } = require('child_process');
    const angularCliPath = require.resolve('@angular/cli/lib/init.js');
    const buildAngularPath = require.resolve('@angular-devkit/build-angular');
    
    console.log('Angular CLI path:', angularCliPath);
    console.log('Build Angular path:', buildAngularPath);
    
    // Run the Angular CLI programmatically
    process.argv[2] = 'build';
    process.argv[3] = '--configuration=production';
    
    require('@angular/cli/lib/init');
  `;
  
  fs.writeFileSync('direct-build.js', buildScript);
  console.log('Created direct-build.js script.');
  
  // Run the direct build script
  execSync('node direct-build.js', { stdio: 'inherit' });
  console.log('Angular app built successfully with direct approach.');
} catch (error) {
  console.log('ERROR with direct build approach:', error);
  
  // Try alternative approach with global installation
  try {
    console.log('Trying alternative build with global installation...');
    execSync('npm install -g @angular/cli@16.2.12 @angular-devkit/build-angular@16.2.12', { stdio: 'inherit' });
    execSync('ng build --configuration production', { stdio: 'inherit' });
    console.log('Angular app built successfully with global installation.');
  } catch (globalError) {
    console.log('ERROR with global installation approach:', globalError);
    
    // One last attempt with Angular CLI version 15
    try {
      console.log('Trying with Angular CLI version 15...');
      execSync('npm install -g @angular/cli@15 @angular-devkit/build-angular@15', { stdio: 'inherit' });
      execSync('ng build --configuration production', { stdio: 'inherit' });
      console.log('Angular app built successfully with Angular 15.');
    } catch (finalError) {
      console.log('ERROR with Angular 15 approach:', finalError);
      process.exit(1);
    }
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