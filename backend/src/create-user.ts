
import db from "./models";
import bcrypt from "bcrypt";

async function createTestUser() {
  await db.sequelize.sync();

  console.log("Checking for existing user...");
  const existingUser = await db.User.findOne({ where: { email: "test@test.com" } });
  if (existingUser) {
    console.log("User already exists!", existingUser.toJSON());
    return existingUser;
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // First check or create a role
  let role = await db.Role.findOne({ where: { roleName: "CUSTOMER" } });
  if (!role) {
    role = await db.Role.create({ roleName: "CUSTOMER", description: "Customer" });
  }

  console.log("Creating user...");
  const user = await db.User.create({
    email: "test@test.com",
    passwordHash,
    fullName: "Test User",
    phone: "08123456789",
    status: "active",
    emailVerified: true,
    phoneVerified: true,
    roleId: role.id
  });

  console.log("User created!", user.toJSON());

  return user;
}

createTestUser();
