import { createProduct } from "./modules/products/product.repository";
import { prisma } from "./config/database";

async function main() {
  try {
    // get a category ID
    const cat = await prisma.category.findFirst();
    if (!cat) {
      console.log("No category found");
      return;
    }
    console.log("Using category:", cat.name, cat.id);

    const payload = {
      name: "Fortune Sunflower Oil",
      slug: "fortune-sunflower-oil-test",
      categoryId: cat.id,
      description: "Premium sunflower oil",
      isActive: true,
      images: ["https://www.amazon.in/Fortune-Sunlite-Refined-Sunflower-Oil/dp/B00NYZTGEO"],
      variants: [
        {
          name: "1kg Pack",
          sku: "FORTUNE-1KG",
          weightGrams: 1000,
          price: 200,
          stock: 20,
        }
      ]
    };

    console.log("Creating product...");
    const res = await createProduct(payload);
    console.log("Created successfully:", res);
  } catch (err) {
    console.error("Failed to create product. Error details:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
