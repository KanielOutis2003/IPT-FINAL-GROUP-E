const functions = require('firebase-functions');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import server app
let app;
try {
  // First try to require the server directly
  app = require('./server');
  console.log('Successfully imported server from ./server.js');
} catch (error) {
  console.error('Error importing from ./server.js:', error.message);
  
  try {
    // If that fails, try requiring with a relative path to backend
    app = require('../backend/server');
    console.log('Successfully imported server from ../backend/server.js');
  } catch (err) {
    console.error('Error importing from ../backend/server.js:', err.message);
    // If we can't load the server, create a simple error app
    const errorApp = express();
    errorApp.get('*', (req, res) => {
      res.status(500).send('Server initialization failed. Check function logs.');
    });
    app = errorApp;
  }
}

// Configure the function with appropriate resource settings for a larger app
const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
};

// Export the Express app as a Firebase Cloud Function
exports.api = functions.runWith(runtimeOpts).https.onRequest(app); 