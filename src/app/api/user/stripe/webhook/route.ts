import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }

  return new Stripe(secretKey);
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();

    const sig = req.headers.get("stripe-signature");
    const rawBody = await req.text();

    if (!sig) {
      return NextResponse.json(
        { message: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        webhookSecret
      );
    } catch (error) {
      console.error("Signature verification failed:", error);

      return NextResponse.json(
        { message: "Invalid Stripe signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      await connectDb();

      await Order.findByIdAndUpdate(
        session.metadata?.orderId,
        {
          isPaid: true,
        }
      );
    }

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      { message: "Webhook error" },
      { status: 500 }
    );
  }
}