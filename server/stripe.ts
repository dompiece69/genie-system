import Stripe from "stripe";
import { ENV } from "./_core/env";
import {
  getProductById, createOrder, updateOrder, updateProduct, logEvent,
} from "./db";
import { generateDownloadToken } from "./solutionGenerator";
import { notifyOwner } from "./_core/notification";

export function getStripe(): Stripe | null {
  if (!ENV.stripeSecretKey) return null;
  return new Stripe(ENV.stripeSecretKey);
}

export function isStripeEnabled(): boolean {
  return !!ENV.stripeSecretKey;
}

/**
 * Create a Stripe Checkout Session for a product purchase.
 * Returns the hosted checkout URL to redirect the buyer to.
 */
export async function createCheckoutSession(opts: {
  productId: number;
  buyerEmail: string;
  buyerName?: string;
  userId?: number;
}): Promise<{ url: string; downloadToken: string }> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY to enable payments.");
  }

  const product = await getProductById(opts.productId);
  if (!product || !product.isPublished) {
    throw new Error("Product not found or unavailable.");
  }

  const downloadToken = await generateDownloadToken();
  const downloadExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Pre-create the order in 'pending' state so the webhook can confirm it
  const order = await createOrder({
    productId: opts.productId,
    userId: opts.userId,
    buyerEmail: opts.buyerEmail,
    buyerName: opts.buyerName,
    amount: product.price,
    status: "pending",
    paymentMethod: "stripe",
    deliveryStatus: "pending",
    downloadToken,
    downloadExpiresAt,
  });

  const successUrl = `${ENV.appBaseUrl}/download/${downloadToken}?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${ENV.appBaseUrl}/marketplace/${opts.productId}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: opts.buyerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.title,
            description: product.shortDescription ?? product.description.substring(0, 255),
          },
        },
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: String(order.id),
      productId: String(opts.productId),
      downloadToken,
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return { url: session.url, downloadToken };
}

/**
 * Handle incoming Stripe webhook events.
 * Must receive the raw (unparsed) request body for signature verification.
 */
export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, ENV.stripeWebhookSecret);
  } catch (err: any) {
    throw new Error(`Stripe webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = Number(session.metadata?.orderId);
    const productId = Number(session.metadata?.productId);
    const downloadToken = session.metadata?.downloadToken;

    if (!orderId || !downloadToken) return;

    // Confirm the order as completed
    await updateOrder(orderId, {
      status: "completed",
      deliveryStatus: "sent",
    });

    // Update product sales count
    const product = await getProductById(productId);
    if (product) {
      await updateProduct(productId, { salesCount: (product.salesCount || 0) + 1 });
    }

    const amount = (session.amount_total ?? 0) / 100;
    await logEvent("order_placed", orderId, "order", { productId, amount });
    await logEvent("order_completed", orderId, "order", { productId, amount });

    // Notify the store owner of the sale
    notifyOwner({
      title: `💰 New Sale: ${product?.title ?? "Product"}`,
      content: `Order #${orderId} completed for $${amount.toFixed(2)}.\nBuyer: ${session.customer_email ?? "unknown"}\nProduct ID: ${productId}`,
    }).catch(() => {
      // Notification is best-effort; don't fail the webhook
    });
  }
}
