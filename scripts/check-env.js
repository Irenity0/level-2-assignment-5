const fs = require("fs")
const path = require("path")

function checkEnvironment() {
  console.log("🔍 Checking environment configuration...")

  // Check if .env file exists
  const envPath = path.join(process.cwd(), ".env")
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env file not found!")
    console.log("   Run: cp .env.example .env")
    process.exit(1)
  }

  // Load environment variables
  require("dotenv").config()

  const requiredVars = ["MONGODB_URI", "JWT_SECRET"]
  const missingVars = []

  requiredVars.forEach((varName) => {
    if (!process.env[varName] || process.env[varName].includes("your-super-secret")) {
      missingVars.push(varName)
    }
  })

  if (missingVars.length > 0) {
    console.log("❌ Missing or default environment variables:")
    missingVars.forEach((varName) => {
      console.log(`   - ${varName}`)
    })
    console.log("\n   Please update your .env file with proper values.")
    process.exit(1)
  }

  // Check MongoDB connection
  const mongoose = require("mongoose")

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("✅ MongoDB connection successful")
      mongoose.connection.close()
    })
    .catch((error) => {
      console.log("❌ MongoDB connection failed:")
      console.log(`   ${error.message}`)
      console.log("\n   Make sure MongoDB is running:")
      console.log("   - macOS: brew services start mongodb-community")
      console.log("   - Ubuntu: sudo systemctl start mongod")
      console.log("   - Windows: net start MongoDB")
      process.exit(1)
    })

  console.log("✅ Environment configuration is valid")
}

checkEnvironment()