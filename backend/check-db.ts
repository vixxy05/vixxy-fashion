
import db from "./src/models";
import bcrypt from "bcrypt";

async function checkDB() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Connected to database successfully!");

    console.log("\n📋 Users in database:");
    const users = await db.User.findAll();

    for (const user of users) {
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Full Name: ${user.fullName}`);
      console.log(`  Password Hash: ${user.passwordHash}`);
      console.log(`  Role ID: ${user.roleId || "No role ID"}`);

      // Test hash comparison
      console.log("\n  Testing passwords:");
      const testUser123 = await bcrypt.compare("user123", user.passwordHash);
      console.log(`    user123: ${testUser123 ? "✅ CORRECT" : "❌ WRONG"}`);

      const testAdmin123 = await bcrypt.compare("admin123", user.passwordHash);
      console.log(`    admin123: ${testAdmin123 ? "✅ CORRECT" : "❌ WRONG"}`);

      console.log("---");
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    await db.sequelize.close();
  }
}

checkDB();
