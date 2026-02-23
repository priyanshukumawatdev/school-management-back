require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const User = require("../models/user/User");

const seedAdmin = async () => {
  try {
    await db();
    console.log("🔌 Database connected successfully");

    const existingAdmin = await User.findOne({ role: "Admin" });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin@123", 10);

    const admin = await User.create({
      name: "Super Admin",
      mobile: "9979945499",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "Admin",
    });

    console.log("🔥 Admin created successfully");
    process.exit(0);

  } catch (error) {
    console.error("❌ Admin Seeder Error:", error);
    process.exit(1);
  }
};

// 🔥 IMPORTANT — Call the function
seedAdmin();
