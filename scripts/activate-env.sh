#!/bin/bash

# Simple Setup Corporate Tax Registration Agent - Environment Activation
# Source this script to activate the project environment: source ./activate-env.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Activating Simple Setup Corporate Tax Registration Agent Environment...${NC}"

# Activate rbenv and set Ruby version
if command -v rbenv >/dev/null 2>&1; then
    eval "$(rbenv init -)"
    if [ -f .ruby-version ]; then
        rbenv local $(cat .ruby-version)
        echo -e "${GREEN}✅ Ruby $(cat .ruby-version) activated${NC}"
    fi
else
    echo "⚠️  rbenv not found. Please run ./setup-environment.sh first."
fi

# Activate nvm and set Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

if command -v nvm >/dev/null 2>&1; then
    if [ -f .nvmrc ]; then
        nvm use $(cat .nvmrc)
        echo -e "${GREEN}✅ Node.js $(cat .nvmrc) activated${NC}"
    fi
else
    echo "⚠️  nvm not found. Please run ./setup-environment.sh first."
fi

# Load environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo "⚠️  .env file not found. Copy env.template to .env and configure it."
fi

# Set project-specific paths
export PATH="./node_modules/.bin:$PATH"
export PATH="./backend/bin:$PATH"

echo -e "${GREEN}🎉 Environment activated! Current versions:${NC}"
echo "   Ruby: $(ruby -v 2>/dev/null || echo 'Not available')"
echo "   Node: $(node -v 2>/dev/null || echo 'Not available')"
echo "   Rails: $(rails -v 2>/dev/null || echo 'Not available')"
echo ""
echo -e "${BLUE}💡 Run './start.sh' to start all development services${NC}"
