const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findFirst();
  if (!order) return console.log("No order");
  
  const partner = await prisma.deliveryPartner.findFirst();
  if (!partner) return console.log("No partner");

  console.log("Order ID:", order.id);
  console.log("Partner ID:", partner.id);
  
  try {
    const assignment = await prisma.orderAssignment.upsert({
      where: { orderId: order.id },
      update: {
        deliveryPartnerId: partner.id,
        assignedById: order.userId, // mock user id
        status: "ASSIGNED",
        notes: "test",
        assignedAt: new Date(),
      },
      create: {
        orderId: order.id,
        deliveryPartnerId: partner.id,
        assignedById: order.userId,
        status: "ASSIGNED",
        notes: "test",
      }
    });

    console.log("Assignment created:", assignment);
    
    const fetchedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { OrderAssignment: true }
    });
    
    console.log("Fetched Order with Assignment:", fetchedOrder.OrderAssignment);
    
  } catch (error) {
    console.error("UPSERT ERROR:", error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
