#!/bin/bash

# Ayora Food Journal Deployment Script
# This script sets up and deploys the application

echo "🚀 Starting Ayora Food Journal Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is available
check_docker() {
    print_status "Checking Docker installation..."
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
        return 0
    else
        print_warning "Docker not found. Installing Docker..."

        # Install Docker (Ubuntu/Debian)
        if command -v apt-get &> /dev/null; then
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
            sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        elif command -v yum &> /dev/null; then
            sudo yum install -y docker
        else
            print_error "Cannot install Docker automatically. Please install Docker manually."
            return 1
        fi
    fi
}

# Check if Node.js is available
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        print_success "Node.js is installed: $(node --version)"
        return 0
    else
        print_warning "Node.js not found. Installing Node.js..."

        # Install Node.js using NodeSource
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."

    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOL
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ayora
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
AI_SERVICE_URL=https://api.example.com/analyze
NUTRITION_API_KEY=your-api-key-here
GOOGLE_VISION_API_KEY=your-google-vision-api-key
SPEECH_TO_TEXT_API_KEY=your-speech-to-text-api-key
FRONTEND_URL=http://localhost:3000
EOL
        print_success "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install --production
    cd ..
    print_success "Backend dependencies installed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install --production
    cd ..
    print_success "Frontend dependencies installed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend application..."
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

# Setup MongoDB (if using Docker)
setup_database() {
    print_status "Setting up database..."

    # Check if MongoDB container is running
    if docker ps | grep -q mongodb; then
        print_success "MongoDB container is already running"
    else
        print_status "Starting MongoDB container..."
        docker run -d \
            --name ayora-mongodb \
            -p 27017:27017 \
            -e MONGO_INITDB_ROOT_USERNAME=admin \
            -e MONGO_INITDB_ROOT_PASSWORD=password123 \
            -v ayora-data:/data/db \
            mongo:latest

        print_success "MongoDB container started"
    fi
}

# Start the application
start_application() {
    print_status "Starting Ayora Food Journal application..."

    # Start backend server
    print_status "Starting backend server..."
    cd backend
    nohup npm start > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..

    # Start frontend server
    print_status "Starting frontend server..."
    cd frontend
    nohup npm start > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..

    print_success "Application started!"
    print_status "Backend PID: $BACKEND_PID"
    print_status "Frontend PID: $FRONTEND_PID"
}

# Create deployment status file
create_deployment_status() {
    cat > deployment-status.json << EOL
{
    "deployment_time": "$(date)",
    "status": "success",
    "services": {
        "backend": {
            "url": "http://localhost:5000",
            "status": "running",
            "pid": "$BACKEND_PID"
        },
        "frontend": {
            "url": "http://localhost:3000",
            "status": "running",
            "pid": "$FRONTEND_PID"
        },
        "database": {
            "type": "mongodb",
            "url": "mongodb://localhost:27017/ayora",
            "status": "running"
        }
    },
    "demo_accounts": {
        "patient": {
            "email": "patient@demo.com",
            "password": "password123",
            "role": "patient"
        },
        "doctor": {
            "email": "doctor@demo.com",
            "password": "password123",
            "role": "doctor"
        }
    },
    "api_endpoints": [
        "GET /api/health",
        "POST /api/users/register",
        "POST /api/users/login",
        "GET /api/meals",
        "POST /api/meals",
        "POST /api/images/upload",
        "POST /api/voice/process",
        "GET /api/doctors/patients/requiring-attention"
    ]
}
EOL
}

# Health check function
health_check() {
    print_status "Performing health check..."

    # Check backend
    if curl -s http://localhost:5000/api/health > /dev/null; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi

    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        return 1
    fi

    return 0
}

# Main deployment function
main() {
    print_status "Starting deployment process..."

    # Check prerequisites
    check_docker
    check_nodejs

    # Setup environment
    setup_environment

    # Install dependencies
    install_backend_deps
    install_frontend_deps

    # Build frontend
    build_frontend

    # Setup database
    setup_database

    # Start application
    start_application

    # Wait for services to start
    print_status "Waiting for services to start..."
    sleep 10

    # Health check
    if health_check; then
        print_success "All health checks passed!"
    else
        print_error "Some health checks failed. Check logs."
        exit 1
    fi

    # Create deployment status
    create_deployment_status

    # Display success message
    print_success "🎉 Ayora Food Journal deployed successfully!"
    print_status ""
    print_status "📊 Deployment Summary:"
    print_status "   Backend: http://localhost:5000"
    print_status "   Frontend: http://localhost:3000"
    print_status "   Health Check: http://localhost:5000/api/health"
    print_status ""
    print_status "🔐 Demo Accounts:"
    print_status "   Patient: patient@demo.com / password123"
    print_status "   Doctor: doctor@demo.com / password123"
    print_status ""
    print_status "📝 To view logs:"
    print_status "   Backend: tail -f backend.log"
    print_status "   Frontend: tail -f frontend.log"
    print_status ""
    print_status "🛑 To stop the application:"
    print_status "   kill $BACKEND_PID $FRONTEND_PID"
    print_status "   docker stop ayora-mongodb"
}

# Run main function
main "$@"
