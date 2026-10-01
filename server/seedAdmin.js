import "dotenv/config";
import bcrypt from "bcryptjs";
import sequelize, { connectDatabase } from "./config/db.js";
import User from "./models/User.js";

try {
  await connectDatabase();
  const email = "admin@lab.com";
  const existingAdmin = await User.findOne({ where: { email } });
  if (existingAdmin) {
    console.log("Admin already exists; no changes made.");
  } else {
    await User.create({
      name: "Laboratory Admin",
      email,
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    console.log("Default laboratory admin created.");
  }
} catch (error) {
  console.error("Could not seed admin:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
