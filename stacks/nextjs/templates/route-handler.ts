import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/billing/handle-stripe-event";
import { logger } from "@/lib/logger";

export const POST = async (request: Request) => {
  const payload = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    logger.warn({ error }, "stripe webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (error) {
    logger.error({ error, eventId: event.id }, "stripe event handling failed");
    return NextResponse.json({ error: "Handler failure" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
