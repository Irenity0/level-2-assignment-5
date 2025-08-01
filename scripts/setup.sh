#!/bin/bash

# Setup script for Digital Wallet API

echo "🛠️  Setting up Digital Wallet API..."

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB:"
    echo "   macOS: brew install mongodb-community"
    echo "   Ubuntu: sudo apt install mongodb"
    echo "   Windows: Download from https://www.mongodb.com/try/download/community"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Generate a random JWT secret if not set
if ! grep -q "your-super-secret-jwt-key-here" .env; then
    echo "✅ JWT secret already configured."
else
    echo "🔐 Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    sed -i.bak "s/your-super-secret-jwt-key-here/$JWT_SECRET/" .env
    rm .env.bak 2>/dev/null
    echo "✅ JWT secret generated and configured."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB: brew services start mongodb-community (macOS)"
echo "2. Seed database: node scripts/seed-data.js"
echo "3. Start server: npm run dev"
echo ""
echo "API will be available at: http://localhost:5000"