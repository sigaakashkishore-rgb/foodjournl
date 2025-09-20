# 🚀 Ayora Food Journal - Deployment Guide

This guide provides comprehensive instructions for deploying the Ayora Food Journal application to various platforms.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Heroku Deployment](#heroku-deployment)
5. [Vercel Deployment](#vercel-deployment)
6. [Railway Deployment](#railway-deployment)
7. [AWS Deployment](#aws-deployment)
8. [Environment Variables](#environment-variables)
9. [Troubleshooting](#troubleshooting)

## 🎯 Quick Start

### Option 1: Interactive Demo (No Setup Required)
```bash
# Simply open this file in your browser:
open demo.html
```

### Option 2: One-Click Deployment
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 🏠 Local Development

### Prerequisites
- Node.js 18+ and npm
- MongoDB (or Docker)
- Git

### Setup Steps
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ayora-fullstack

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Start MongoDB (if not using Docker)
mongod

# Start backend server
cd backend
npm run dev

# Start frontend (new terminal)
cd frontend
npm start
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Setup
```bash
# Build backend image
docker build -t ayora-backend ./backend

# Build frontend image
docker build -t ayora-frontend ./frontend

# Run MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Run backend
docker run -d --name ayora-backend -p 5000:5000 ayora-backend

# Run frontend
docker run -d --name ayora-frontend -p 3000:3000 ayora-frontend
```

## 🚀 Heroku Deployment

### Backend Deployment
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create Heroku app
heroku create ayora-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-jwt-secret>

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Frontend Deployment
```bash
# Create separate Heroku app for frontend
heroku create ayora-frontend

# Set build configuration
heroku config:set REACT_APP_API_URL=https://ayora-backend.herokuapp.com

# Deploy
cd frontend
git add .
git commit -m "Deploy frontend to Heroku"
git push heroku main
```

## ⚡ Vercel Deployment

### Frontend Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel

# Set environment variables in Vercel dashboard
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend on Vercel (Serverless)
```bash
# Create vercel.json for backend
{
  "functions": {
    "src/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}

# Deploy backend
vercel --prod
```

## 🚂 Railway Deployment

### One-Click Deploy
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub"
4. Connect your repository
5. Railway will auto-detect the services

### Manual Setup
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=<your-mongodb-uri>

# Deploy
railway up
```

## ☁️ AWS Deployment

### Using AWS Elastic Beanstalk
```bash
# Install AWS CLI and EB CLI
pip install awsebcli

# Initialize EB application
eb init ayora-app

# Create environment
eb create ayora-env

# Deploy
eb deploy
```

### Using AWS ECS Fargate
```bash
# Build Docker images
docker build -t ayora-backend ./backend
docker build -t ayora-frontend ./frontend

# Push to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag ayora-backend <account-id>.dkr.ecr.us-east-1.amazonaws.com/ayora-backend
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ayora-backend
```

## 🔧 Environment Variables

### Required Variables
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ayora
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

### Optional Variables
```bash
AI_SERVICE_URL=https://api.example.com/analyze
NUTRITION_API_KEY=your-api-key
GOOGLE_VISION_API_KEY=your-google-vision-key
SPEECH_TO_TEXT_API_KEY=your-speech-to-text-key
REDIS_URL=redis://localhost:6379
```

## 📊 Monitoring & Logs

### View Application Logs
```bash
# Local development
tail -f backend.log
tail -f frontend.log

# Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Heroku
heroku logs --tail

# Railway
railway logs
```

### Health Check
```bash
# Test API health
curl https://your-backend-url.com/api/health

# Test frontend
curl https://your-frontend-url.com
```

## 🔒 Security Checklist

- [ ] Change default JWT secret
- [ ] Set strong database passwords
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Configure environment-specific settings

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm start
```

**MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection
mongo --eval "db.stats()"
```

**Build Errors**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear React build
cd frontend && rm -rf build node_modules
npm install && npm run build
```

**Environment Variables Not Loading**
```bash
# Check if .env file exists
ls -la backend/.env

# Verify variables are set
node -e "console.log(process.env.JWT_SECRET)"
```

## 📞 Support

If you encounter issues:

1. Check the logs using the commands above
2. Verify all environment variables are set correctly
3. Ensure all prerequisites are installed
4. Try the troubleshooting steps above

For additional help, refer to:
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🎉 Deployment Complete!

Once deployed successfully, you'll have access to:

- **Frontend**: Modern React application with beautiful UI
- **Backend**: RESTful API with authentication
- **Database**: MongoDB for data persistence
- **Features**: Image recognition, voice processing, doctor-patient system

**Demo Accounts:**
- Patient: `patient@demo.com` / `password123`
- Doctor: `doctor@demo.com` / `password123`

Enjoy your Ayora Food Journal! 🍽️✨
