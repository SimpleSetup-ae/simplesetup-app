#!/bin/bash

# Simple Setup Corporate Tax Registration Agent - Environment Setup
# This script sets up a dedicated development environment for the project

set -e

echo "🚀 Setting up Simple Setup Corporate Tax Registration Agent Environment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This setup script is designed for macOS. Please adapt for your OS."
    exit 1
fi

# Install Homebrew if not present
if ! command -v brew >/dev/null 2>&1; then
    print_info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    print_status "Homebrew installed"
else
    print_status "Homebrew already installed"
fi

# Update Homebrew
print_info "Updating Homebrew..."
brew update

# Install rbenv for Ruby version management
if ! command -v rbenv >/dev/null 2>&1; then
    print_info "Installing rbenv..."
    brew install rbenv ruby-build
    
    # Add rbenv to shell profile
    if [[ "$SHELL" == *"zsh"* ]]; then
        echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
        echo 'eval "$(rbenv init -)"' >> ~/.zshrc
        export PATH="$HOME/.rbenv/bin:$PATH"
        eval "$(rbenv init -)"
    elif [[ "$SHELL" == *"bash"* ]]; then
        echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile
        echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
        export PATH="$HOME/.rbenv/bin:$PATH"
        eval "$(rbenv init -)"
    fi
    
    print_status "rbenv installed"
else
    print_status "rbenv already installed"
fi

# Install Node Version Manager (nvm)
if [ ! -d "$HOME/.nvm" ]; then
    print_info "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # Source nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    print_status "nvm installed"
else
    print_status "nvm already installed"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Ruby 3.1.4
print_info "Installing Ruby 3.1.4..."
if ! rbenv versions | grep -q "3.1.4"; then
    rbenv install 3.1.4
    print_status "Ruby 3.1.4 installed"
else
    print_status "Ruby 3.1.4 already installed"
fi

# Set local Ruby version
rbenv local 3.1.4
rbenv rehash

# Install Node.js 18.19.0
print_info "Installing Node.js 18.19.0..."
nvm install 18.19.0
nvm use 18.19.0
nvm alias default 18.19.0
print_status "Node.js 18.19.0 installed and set as default"

# Install essential system dependencies
print_info "Installing system dependencies..."
brew install postgresql@15 redis imagemagick libvips

# Install Rails and Bundler
print_info "Installing Rails and Bundler..."
gem install bundler rails --no-document
rbenv rehash

# Install global npm packages
print_info "Installing global npm packages..."
npm install -g @expo/cli typescript ts-node

# Install PostgreSQL and Redis services
print_info "Setting up PostgreSQL and Redis services..."
brew services start postgresql@15
brew services start redis

# Create .env file from template
if [ ! -f .env ]; then
    print_info "Creating .env file from template..."
    cp env.template .env
    print_warning "Please configure your .env file with actual values"
else
    print_status ".env file already exists"
fi

# Install project dependencies
print_info "Installing project dependencies..."

# Install root npm dependencies
npm install

# Install shared package dependencies
cd shared && npm install && cd ..

# Install backend dependencies
cd backend
if [ -f Gemfile ]; then
    bundle install
else
    print_warning "Backend Gemfile not found, skipping bundle install"
fi
cd ..

print_status "Environment setup complete!"
echo ""
echo "🎉 Your Simple Setup Corporate Tax Registration Agent environment is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your .env file with actual API keys and credentials"
echo "2. Start the development environment: ./start.sh"
echo "3. Access your applications:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Redis: localhost:6379"
echo "   - PostgreSQL: localhost:5432"
echo ""
echo "🔧 Useful commands:"
echo "   - Check Ruby version: ruby -v"
echo "   - Check Node version: node -v"
echo "   - Check Rails version: rails -v"
echo "   - Start services: ./start.sh"
echo "   - Stop services: Ctrl+C in the start.sh terminal"
echo ""
print_info "Happy coding! 🚀"
