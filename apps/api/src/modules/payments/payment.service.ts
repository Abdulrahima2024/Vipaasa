import { prisma } from "../../config/database";

export async function getPayments() {
  const dbPayments = await prisma.payment.findMany({
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return dbPayments.map((p) => {
    // Map payer name
    const payerName = p.user?.profile
      ? `${p.user.profile.firstName} ${p.user.profile.lastName}`.trim()
      : p.user?.email.split("@")[0] || "Customer";

    // Map method string
    let method = "Razorpay (Online)";
    if (p.paymentMethod === "COD") {
      method = "Cash on Delivery";
    } else if (p.paymentMethod === "UPI") {
      method = "UPI (Online)";
    } else if (p.paymentMethod === "CARD") {
      method = "Card Payment";
    } else if (p.paymentMethod === "WALLET") {
      method = "Wallet Payment";
    } else if (p.paymentMethod === "NET_BANKING") {
      method = "Net Banking (Online)";
    }

    // Map bank details / transaction reference
    const bankDetails = p.paymentMethod === "COD" 
      ? "Cash Payment - N/A" 
      : `${p.gatewayName} - ${p.transactionReference || p.gatewayPaymentIntentId || "Ref N/A"}`;

    return {
      id: `PAY-${p.id.substring(0, 6).toUpperCase()}`,
      payerName,
      amount: parseFloat(p.amount.toString()),
      method,
      date: p.createdAt.toISOString().split("T")[0],
      bankDetails,
    };
  });
}
