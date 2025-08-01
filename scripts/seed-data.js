const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Define schemas
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    password: String,
    role: String,
    isActive: { type: Boolean, default: true },
    isApproved: Boolean,
  },
  { timestamps: true },
)

const walletSchema = new mongoose.Schema(
  {
    userId: String,
    balance: { type: Number, default: 50 },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)
const Wallet = mongoose.model("Wallet", walletSchema)

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/digital-wallet")
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Wallet.deleteMany({})
    console.log("Cleared existing data")

    // Create Admin
    const adminPassword = await bcrypt.hash("admin123", 12)
    const admin = new User({
      name: "System Admin",
      email: "admin@digitalwallet.com",
      phone: "01000000000",
      password: adminPassword,
      role: "admin",
      isActive: true,
      isApproved: true,
    })
    await admin.save()
    console.log("✅ Admin created: admin@digitalwallet.com / admin123")

    // Create Test Users
    const userPassword = await bcrypt.hash("user123", 12)
    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "01111111111",
        password: userPassword,
        role: "user",
        isActive: true,
        isApproved: true,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "01222222222",
        password: userPassword,
        role: "user",
        isActive: true,
        isApproved: true,
      },
    ]

    const createdUsers = await User.insertMany(users)
    console.log("✅ Test users created: john@example.com, jane@example.com / user123")

    // Create Test Agent
    const agentPassword = await bcrypt.hash("agent123", 12)
    const agent = new User({
      name: "Agent Smith",
      email: "agent@example.com",
      phone: "01333333333",
      password: agentPassword,
      role: "agent",
      isActive: true,
      isApproved: true,
    })
    await agent.save()
    console.log("✅ Test agent created: agent@example.com / agent123")

    // Create wallets for users and agent
    const wallets = [
      ...createdUsers.map((user) => ({ userId: user._id.toString(), balance: 50 })),
      { userId: agent._id.toString(), balance: 50 },
    ]

    await Wallet.insertMany(wallets)
    console.log("✅ Wallets created with ৳50 initial balance")

    console.log("\n🎉 Seed data created successfully!")
    console.log("\n📋 Test Accounts:")
    console.log("Admin: admin@digitalwallet.com / admin123")
    console.log("User 1: john@example.com / user123")
    console.log("User 2: jane@example.com / user123")
    console.log("Agent: agent@example.com / agent123")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding data:", error)
    process.exit(1)
  }
}

seedData()