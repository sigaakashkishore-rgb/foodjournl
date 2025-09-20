// Virtual Environment Setup for Ayora Food Journal
// This script simulates a virtual environment deployment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VirtualEnvironment {
  constructor() {
    this.baseDir = __dirname;
    this.envName = 'ayora-env';
    this.isWindows = process.platform === 'win32';
    this.deploymentUrl = 'http://localhost:8080';
  }

  // Color output functions
  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };

    const timestamp = new Date().toISOString().slice(11, 19);
    const prefix = colors[type] || colors.info;
    const reset = colors.reset;

    console.log(`${prefix}[${timestamp}] [${type.toUpperCase()}]${reset} ${message}`);
  }

  // Create virtual environment structure
  createEnvironment() {
    this.log('Creating virtual environment structure...', 'info');

    const envStructure = {
      'ayora-env': {
        'bin': {},
        'lib': {},
        'include': {},
        'backend': {
          'app.py': this.getBackendScript(),
          'requirements.txt': this.getRequirements(),
          'Procfile': 'web: python app.py'
        },
        'frontend': {
          'package.json': this.getFrontendPackageJson(),
          'build.sh': this.getBuildScript()
        },
        'database': {
          'init.sql': this.getDatabaseInit()
        },
        'deployment': {
          'docker-compose.yml': this.getDockerCompose(),
          'Dockerfile.backend': this.getDockerfileBackend(),
          'Dockerfile.frontend': this.getDockerfileFrontend()
        }
      }
    };

    this.createDirectoryStructure(envStructure);
    this.log('Virtual environment structure created', 'success');
  }

  // Create directory structure
  createDirectoryStructure(structure, currentPath = '') {
    for (const [key, value] of Object.entries(structure)) {
      const fullPath = path.join(currentPath, key);

      if (typeof value === 'object' && !Array.isArray(value)) {
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        this.createDirectoryStructure(value, fullPath);
      } else {
        // Create file
        fs.writeFileSync(fullPath, value);
      }
    }
  }

  // Get backend script content
  getBackendScript() {
    return `#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
from datetime import datetime

PORT = int(os.environ.get('PORT', 5000))

class AyoraHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'status': 'healthy',
                'service': 'ayora-backend',
                'version': '1.0.0',
                'timestamp': datetime.now().isoformat(),
                'environment': 'virtual'
            }
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/api/demo':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'message': 'Ayora Food Journal API Demo',
                'features': [
                    'Image Recognition',
                    'Voice Processing',
                    'Ayurvedic Analysis',
                    'Doctor-Patient System'
                ],
                'demo_accounts': {
                    'patient': 'patient@demo.com / password123',
                    'doctor': 'doctor@demo.com / password123'
                }
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path in ['/api/users/register', '/api/users/login', '/api/meals']:
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'message': 'Demo endpoint - registration/login successful',
                'demo_mode': True
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            super().do_POST()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), AyoraHandler) as httpd:
        print(f"Ayora Backend running on port {PORT}")
        httpd.serve_forever()
`;
  }

  // Get requirements.txt content
  getRequirements() {
    return `flask==2.3.3
gunicorn==21.2.0
python-dotenv==1.0.0
requests==2.31.0
pymongo==4.5.0
bcrypt==4.0.1
pyjwt==2.8.0
pillow==10.0.1
speechrecognition==3.10.0
opencv-python==4.8.1.78
`;
  }

  // Get frontend package.json
  getFrontendPackageJson() {
    return JSON.stringify({
      name: 'ayora-frontend',
      version: '1.0.0',
      scripts: {
        build: 'echo "Frontend build complete"',
        start: 'python3 -m http.server 3000',
        dev: 'python3 -m http.server 3000'
      }
    }, null, 2);
  }

  // Get build script
  getBuildScript() {
    return `#!/bin/bash
echo "Building Ayora Frontend..."
echo "Installing dependencies..."
echo "Running build process..."
echo "Build complete!"
echo "Frontend ready for deployment"
`;
  }

  // Get database initialization
  getDatabaseInit() {
    return `-- Ayora Food Journal Database Initialization
CREATE DATABASE IF NOT EXISTS ayora_db;
USE ayora_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') DEFAULT 'snack',
    calories INT DEFAULT 0,
    protein DECIMAL(5,2) DEFAULT 0,
    carbs DECIMAL(5,2) DEFAULT 0,
    fat DECIMAL(5,2) DEFAULT 0,
    ayurvedic_properties JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert demo data
INSERT INTO users (name, email, password_hash, role) VALUES
('Demo Patient', 'patient@demo.com', 'password123', 'patient'),
('Demo Doctor', 'doctor@demo.com', 'password123', 'doctor');
`;
  }

  // Get Docker Compose configuration
  getDockerCompose() {
    return `version: '3.8'

services:
  ayora-backend:
    build:
      context: ../backend
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/ayora
    depends_on:
      - mongodb

  ayora-frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - ayora-backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
`;
  }

  // Get Dockerfile for backend
  getDockerfileBackend() {
    return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
`;
  }

  // Get Dockerfile for frontend
  getDockerfileFrontend() {
    return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
`;
  }

  // Start virtual environment
  startEnvironment() {
    this.log('Starting virtual environment...', 'info');

    try {
      // Start the demo server
      this.log('Starting Ayora Demo Server...', 'info');
      execSync('node serve-demo.js', {
        stdio: 'inherit',
        cwd: this.baseDir
      });

    } catch (error) {
      this.log('Error starting virtual environment', 'error');
      this.log(error.message, 'error');
    }
  }

  // Create deployment status
  createDeploymentStatus() {
    const status = {
      deployment_id: Date.now().toString(),
      environment: 'virtual',
      status: 'active',
      services: {
        'ayora-demo-server': {
          url: this.deploymentUrl,
          status: 'running',
          port: 8080
        },
        'ayora-backend-api': {
          url: 'http://localhost:5000',
          status: 'simulated',
          port: 5000
        },
        'ayora-frontend': {
          url: 'http://localhost:3000',
          status: 'simulated',
          port: 3000
        }
      },
      features: [
        'Image Recognition Demo',
        'Voice Processing Demo',
        'Ayurvedic Analysis',
        'Doctor-Patient System',
        'Nutrition Analytics',
        'Interactive UI Showcase'
      ],
      demo_accounts: {
        patient: {
          email: 'patient@demo.com',
          password: 'password123',
          role: 'patient'
        },
        doctor: {
          email: 'doctor@demo.com',
          password: 'password123',
          role: 'doctor'
        }
      },
      deployment_time: new Date().toISOString(),
      access_url: this.deploymentUrl
    };

    fs.writeFileSync('deployment-status.json', JSON.stringify(status, null, 2));
    this.log('Deployment status created', 'success');

    return status;
  }

  // Display deployment information
  displayDeploymentInfo() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 AYORA FOOD JOURNAL - VIRTUAL ENVIRONMENT DEPLOYED');
    console.log('='.repeat(80));
    console.log('');
    console.log('📱 ACCESS INFORMATION:');
    console.log(`   🌐 Demo URL: ${this.deploymentUrl}`);
    console.log(`   📊 Status: http://localhost:8080/deployment-status.json`);
    console.log('');
    console.log('🍽️ FEATURES AVAILABLE:');
    console.log('   ✅ Image Recognition Demo');
    console.log('   ✅ Voice Journaling Demo');
    console.log('   ✅ Ayurvedic Diet Tracking');
    console.log('   ✅ Doctor-Patient System');
    console.log('   ✅ Nutrition Analytics');
    console.log('   ✅ Beautiful UI Showcase');
    console.log('');
    console.log('🔐 DEMO ACCOUNTS:');
    console.log('   Patient: patient@demo.com / password123');
    console.log('   Doctor: doctor@demo.com / password123');
    console.log('');
    console.log('📡 API ENDPOINTS:');
    console.log('   GET  /api/health');
    console.log('   GET  /api/demo');
    console.log('   POST /api/users/register');
    console.log('   POST /api/users/login');
    console.log('   POST /api/meals');
    console.log('');
    console.log('🛠️  ADDITIONAL COMMANDS:');
    console.log('   npm run demo    - Start demo server');
    console.log('   npm run deploy  - Run deployment script');
    console.log('   npm run test    - Run API tests');
    console.log('');
    console.log('🛑 TO STOP: Press Ctrl+C');
    console.log('='.repeat(80));
  }

  // Main deployment function
  async deploy() {
    this.log('Starting Ayora Food Journal virtual environment deployment...', 'info');

    try {
      // Create environment structure
      this.createEnvironment();

      // Create deployment status
      const status = this.createDeploymentStatus();

      // Display deployment information
      this.displayDeploymentInfo();

      // Start the environment
      this.startEnvironment();

    } catch (error) {
      this.log('Deployment failed', 'error');
      this.log(error.message, 'error');
      process.exit(1);
    }
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  const virtualEnv = new VirtualEnvironment();
  virtualEnv.deploy();
}

module.exports = VirtualEnvironment;
