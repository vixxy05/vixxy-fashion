
import db from './models';

async function seedProducts() {
  await db.sequelize.sync();

  await db.Product.create({
    name: "Floral Print Dress",
    slug: "floral-print-dress",
    description: "Beautiful floral print dress for summer",
    shortDescription: "Floral dress",
    sku: "FLD001",
    price: 299000,
    stockQuantity: 10,
    isActive: true,
    isFeatured: true
  });

  console.log("Product created!");
  await db.sequelize.close();
}

seedProducts();
