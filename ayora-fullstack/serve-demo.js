// Simple HTTP Server to serve the Ayora Food Journal Demo
// This creates a local server to showcase the application

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;

  // Default to index.html for root path
  if (pathname === '/') {
    pathname = '/demo.html';
  }

  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(pathname);
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 - Not Found</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            h1 { font-size: 4rem; margin-bottom: 20px; }
            p { font-size: 1.2rem; line-height: 1.6; }
            a { color: #64b5f6; text-decoration: none; font-weight: bold; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🍽️ 404</h1>
            <h2>Page Not Found</h2>
            <p>The requested file could not be found on the Ayora Food Journal demo server.</p>
            <p><a href="/demo.html">← Back to Demo Home</a></p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache',
        'X-Powered-By': 'Ayora-Demo-Server'
      });
      res.end(data);
    });
  });
});

// Add request logging
server.on('request', (req, res) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.socket.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
    console.log(`💡 You can change the port by modifying the PORT variable in serve-demo.js`);
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 Ayora Food Journal Demo Server Started!');
  console.log('='.repeat(60));
  console.log('📱 Demo Application Details:');
  console.log(`   Server URL: http://localhost:${PORT}`);
  console.log(`   Main Demo: http://localhost:${PORT}/demo.html`);
  console.log(`   API Test: http://localhost:${PORT}/test-api.js`);
  console.log('');
  console.log('🍽️ Features Available:');
  console.log('   ✅ Image Recognition Demo');
  console.log('   ✅ Voice Journaling Demo');
  console.log('   ✅ Ayurvedic Diet Tracking');
  console.log('   ✅ Doctor-Patient System');
  console.log('   ✅ Nutrition Analytics');
  console.log('   ✅ Beautiful UI Showcase');
  console.log('');
  console.log('🔐 Demo Accounts:');
  console.log('   Patient: patient@demo.com / password123');
  console.log('   Doctor: doctor@demo.com / password123');
  console.log('');
  console.log('📊 API Endpoints Demonstrated:');
  console.log('   GET /api/health');
  console.log('   POST /api/users/register');
  console.log('   POST /api/users/login');
  console.log('   GET/POST /api/meals');
  console.log('   POST /api/images/upload');
  console.log('   POST /api/voice/process');
  console.log('');
  console.log('🛑 To stop the server: Press Ctrl+C');
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Ayora Demo Server...');
  server.close(() => {
    console.log('✅ Server stopped successfully!');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server stopped successfully!');
    process.exit(0);
  });
});

module.exports = server;
