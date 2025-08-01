const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    password: String,
    role: String,
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)

async function createAdmin() {
  try {
    console.log(process.env.MONGODB_URI)
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/digital-wallet")

    const adminExists = await User.findOne({ role: "admin" })
    if (adminExists) {
      console.log("Admin already exists")
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash("admin123", 12)

    const admin = new User({
      name: "System Admin",
      email: "admin@digitalwallet.com",
      phone: "01000000000",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isApproved: true,
    })

    await admin.save()
    console.log("Admin created successfully")
    console.log("Email: admin@digitalwallet.com")
    console.log("Password: admin123")

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin:", error)
    process.exit(1)
  }
}

createAdmin()
