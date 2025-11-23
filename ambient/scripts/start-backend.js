#!/usr/bin/env node

/**
 * Start Backend Server
 * 
 * Starts the FastAPI backend server using `uv run fastapi dev`.
 * Requires Python 3.12+ and uv package manager.
 */

const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'backend');

console.log('🚀 Starting backend server with FastAPI dev...');
console.log(`📁 Backend directory: ${backendDir}`);
console.log('💡 Using: uv run fastapi dev\n');

// Use uv run fastapi dev (FastAPI's built-in dev command)
// Note: fastapi dev uses uvicorn under the hood
// Use --host 0.0.0.0 to allow connections from other devices/simulators
const uv = spawn('uv', ['run', 'fastapi', 'dev', 'main.py', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

uv.on('error', (err) => {
  console.error('❌ Failed to start backend with uv:', err.message);
  console.log('\n💡 Make sure:');
  console.log('   1. uv is installed: https://github.com/astral-sh/uv');
  console.log('   2. You are in the backend directory');
  console.log('   3. Dependencies are installed: uv sync');
  console.log('\n💡 Or run manually:');
  console.log('   cd backend');
  console.log('   uv run fastapi dev main.py');
  process.exit(1);
});

uv.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\n❌ Backend exited with code ${code}`);
  }
});

