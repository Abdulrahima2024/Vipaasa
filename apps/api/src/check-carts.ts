import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const carts = await prisma.cart.findMany({
    include: {
      user: true,
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });

  console.log("=== DB CARTS ===");
  carts.forEach(c => {
    console.log(`Cart: ID=${c.id}, User=${c.user?.email || "Guest"}`);
    c.items.forEach(item => {
      console.log(`  - Item: ${item.variant.product.name} - ${item.variant.name} (Qty: ${item.quantity})`);
    });
  });
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
