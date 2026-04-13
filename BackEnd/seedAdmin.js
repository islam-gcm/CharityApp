const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const adminData = {
  name: process.env.ADMIN_NAME || "Gacem Islam",
  email: (process.env.ADMIN_EMAIL || "gacemislam2006@gmail.com").toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "mamous2006"
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin already exists");
      console.log("Email:", adminData.email);
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: "admin",
      status: "approved"
    });

    console.log("Admin created successfully");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Admin seed failed:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
