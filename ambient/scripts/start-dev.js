#!/usr/bin/env node

/**
 * Start Development Environment
 * 
 * Starts both the backend server and Expo frontend concurrently.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development environment...');
console.log('📦 This will start both backend and frontend\n');

// Start backend
const backendScript = path.join(__dirname, 'start-backend.js');
const backend = spawn('node', [backendScript], {
  stdio: 'inherit',
  shell: true,
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('\n📱 Starting Expo frontend...\n');
  const frontend = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..'),
  });

  frontend.on('error', (err) => {
    console.error('❌ Failed to start frontend:', err.message);
  });
}, 2000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  backend.kill();
  process.exit(0);
});

