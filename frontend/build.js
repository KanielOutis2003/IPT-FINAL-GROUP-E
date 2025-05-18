const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure we're in the frontend directory
process.chdir(__dirname);

// Function to run commands and log output
function runCommand(command) {
    console.log(`Running: ${command}`);
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to execute command: ${command}`);
        console.error(error);
        process.exit(1);
    }
}

// Main build process
async function build() {
    console.log('Starting build process...');
    
    // Clean dist directory if it exists
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
        console.log('Cleaning dist directory...');
        fs.rmSync(distPath, { recursive: true, force: true });
    }

    // Install specific Angular packages
    console.log('Installing Angular packages...');
    const angularPackages = [
        '@angular/animations@16.2.12',
        '@angular/common@16.2.12',
        '@angular/compiler@16.2.12',
        '@angular/core@16.2.12',
        '@angular/forms@16.2.12',
        '@angular/platform-browser@16.2.12',
        '@angular/platform-browser-dynamic@16.2.12',
        '@angular/router@16.2.12',
        '@angular-devkit/build-angular@16.2.12',
        '@angular/cli@16.2.12',
        '@angular/compiler-cli@16.2.12',
        '@angular-devkit/core@16.2.12',
        '@angular-devkit/schematics@16.2.12',
        '@schematics/angular@16.2.12'
    ];
    
    runCommand(`npm install --save-exact --legacy-peer-deps ${angularPackages.join(' ')}`);

    // Verify Angular installation
    console.log('Verifying Angular installation...');
    runCommand('ng version');

    // Create a temporary build script that uses the global ng command
    console.log('Creating temporary build script...');
    const buildScript = `
        const { execSync } = require('child_process');
        
        // Use the global ng command
        execSync('ng build --configuration production', { 
            stdio: 'inherit',
            env: {
                ...process.env,
                PATH: process.env.PATH + ':/opt/render/project/src/frontend/node_modules/.bin'
            }
        });
    `;
    
    fs.writeFileSync('temp-build.js', buildScript);

    // Run the temporary build script
    console.log('Building application...');
    runCommand('node temp-build.js');

    // Clean up
    console.log('Cleaning up...');
    fs.unlinkSync('temp-build.js');

    console.log('Build completed successfully!');
}

build().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
}); 