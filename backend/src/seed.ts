import dotenv from "dotenv";
import db from "./models";
import bcrypt from "bcrypt";

dotenv.config();

async function seed() {
  try {
    console.log("Resetting database...");
    await db.sequelize.sync({ force: true });
    console.log("✅ Database reset!");

    console.log("\nCreating roles...");
    // Chỉ giữ 2 role: ADMIN và CUSTOMER
    const adminRole = await db.Role.create({
      roleName: "ADMIN",
      description: "Administrator - manage store operations",
    });
    const customerRole = await db.Role.create({
      roleName: "CUSTOMER",
      description: "Customer - browse and purchase products",
    });
    console.log("✅ Roles created!");

    console.log("\nCreating test users...");
    const adminHashedPassword = await bcrypt.hash("admin123", 10);
    const userHashedPassword = await bcrypt.hash("user123", 10);
    
    // Tạo tài khoản ADMIN
    const adminUser = await db.User.create({
      email: "admin@vixxy.com",
      passwordHash: adminHashedPassword,
      fullName: "Store Admin",
      phone: "0911223344",
      roleId: adminRole.id,
      emailVerified: true,
      phoneVerified: true,
      status: "active",
    });
    console.log("✅ Admin created: admin@vixxy.com / admin123");

    // Tạo tài khoản CUSTOMER
    const customerUser = await db.User.create({
      email: "user@vixxy.com",
      passwordHash: userHashedPassword,
      fullName: "Nguyen Van A",
      phone: "0901234567",
      roleId: customerRole.id,
      emailVerified: true,
      phoneVerified: true,
      status: "active",
    });
    console.log("✅ Customer created: user@vixxy.com / user123");

    console.log("\nCreating products...");
    const products = [
      { 
        name: "Crystal Falls Couture Gown", 
        slug: "crystal-falls-gown", 
        description: "Váy couture sequin tím lavender", 
        shortDescription: "Váy dạ hội", 
        sku: "CFGC-001", 
        price: 79900000, 
        stockQuantity: 10, 
        isActive: true, 
        isFeatured: true 
      },
      { 
        name: "Winter Aurora", 
        slug: "winter-aurora", 
        description: "Váy dạ haute couture phối lông thú", 
        shortDescription: "Váy mùa đông", 
        sku: "WA-001", 
        price: 24900000, 
        stockQuantity: 15, 
        isActive: true, 
        isFeatured: true 
      },
      { 
        name: "Spring Blossom", 
        slug: "spring-blossom", 
        description: "Váy vàng tầng lớp", 
        shortDescription: "Váy mùa xuân", 
        sku: "SB-001", 
        price: 19900000, 
        stockQuantity: 20, 
        isActive: true, 
        isFeatured: true 
      },
      { 
        name: "Midnight Sovereign Gown", 
        slug: "midnight-sovereign-gown", 
        description: "Váy đen mermaid satin", 
        shortDescription: "Váy đen", 
        sku: "MSG-001", 
        price: 12900000, 
        stockQuantity: 25, 
        isActive: true, 
        isFeatured: true 
      },
    ];
    await db.Product.bulkCreate(products);
    console.log("✅ Products created!");

    console.log("\n🎉 All data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
