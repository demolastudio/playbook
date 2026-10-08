import { env } from "cloudflare:workers";
import Stripe from "stripe";
import { handleStripeEvent } from "@/features/payment/handle-stripe-event";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    logger.warn({ error }, "stripe webhook signature verification failed");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleStripeEvent(getDb(), event);
  } catch (error) {
    logger.error({ error, eventId: event.id }, "stripe event handling failed");
    return Response.json({ error: "Handler failure" }, { status: 500 });
  }

  return Response.json({ received: true });
};
