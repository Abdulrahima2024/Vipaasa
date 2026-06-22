import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    if (p.images && Array.isArray(p.images)) {
      const fixedImages = p.images.map(url => {
        if (typeof url === 'string' && url.includes('amazon.in')) {
          // Replace bad amazon page URL with a placeholder image of sunflower oil
          return 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'; 
        }
        return url;
      });
      await prisma.product.update({
        where: { id: p.id },
        data: { images: fixedImages }
      });
    }
  }
  console.log("Database fixed!");
}
fix().catch(console.error).finally(() => prisma.$disconnect());
