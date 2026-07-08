
import db from "./models";

async function checkDb() {
  await db.sequelize.sync();

  console.log("=== USERS ===");
  const users = await db.User.findAll({ raw: true });
  console.log(users);

  console.log("=== PRODUCTS ===");
  const products = await db.Product.findAll({ raw: true });
  console.log(products);
}

checkDb();
