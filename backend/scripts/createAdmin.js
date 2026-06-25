import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/userModel.js";

dotenv.config();

connectDB();

const createAdmin = async () => {
  try {
    const adminName =
      process.env.ADMIN_NAME || "EliteShop Admin";

    const adminEmail =
      process.env.ADMIN_EMAIL;

    const adminPassword =
      process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
      );
      process.exit(1);
    }

    const existingAdmin = await User.findOne({
      email: adminEmail.toLowerCase(),
    });

    if (existingAdmin) {
      existingAdmin.name = adminName;
      existingAdmin.role = "admin";
      existingAdmin.isAdmin = true;
      existingAdmin.isActive = true;
      existingAdmin.isVerified = true;

      if (adminPassword) {
        existingAdmin.password = adminPassword;
      }

      await existingAdmin.save();

      console.log("Admin updated successfully");
      console.log("Email:", adminEmail);

      process.exit();
    }

    await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: "admin",
      isAdmin: true,
      isActive: true,
      isVerified: true,
      phone: "9999999999",
      address: "EliteShop Admin Office",
      avatar: "/images/default-avatar.png",
    });

    console.log("Admin created successfully");
    console.log("Email:", adminEmail);

    process.exit();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();