import db from "../models";

export default async function seedProducts(): Promise<void> {
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
      isFeatured: true,
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
      isFeatured: true,
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
      isFeatured: true,
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
      isFeatured: true,
    },
  ];

  await db.Product.bulkCreate(products);
  console.log("✅ Sequelize products seeded");
}
