import { askAi } from "@/lib/askAI";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";


export async function POST(req: NextRequest) {
    try {
      const session=await auth()
     
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { message: "Please type a message first" },
        { status: 400 }
      );
    }

    // You need to get the authenticated user's ID here.
    // Replace this with however your authentication works.
    const userId = session?.user?.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const orderContext =
      orders.length === 0
        ? "This customer has no orders yet."
        : orders
            .map((order, i) => {
              const itemList = order.items
                .map(
                  (item: { name: string; quantity: number }) =>
                    `${item.name} x${item.quantity}`
                )
                .join(", ");

              return `Order ${i + 1}:
- Items: ${itemList}
- Status: ${order.status}
- Paid: ${order.isPaid ? "Yes" : "No"}
- Placed on: ${order.createdAt.toDateString()}
- Delivery address: ${order.address.city}, ${order.address.state}`;
            })
            .join("\n\n");

    const aiResponse = await askAi([
      {
        role: "system",
        content: `You are a helpful customer support assistant for a grocery delivery app.

Here is this customer's order history:

${orderContext}

Guidelines:
- Answer naturally and conversationally.
- Don't list order IDs unless the customer specifically asks.
- Keep responses short and focused.
- If asked about "my orders", give a brief summary.
- Be warm and helpful, not robotic.`,
      },
      {
        role: "user",
        content: message,
      },
    ]);

    return NextResponse.json({
      reply: aiResponse,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}