import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey);

  const body = await req.json();
  const { companySlug, companyName, amount, description } = body as {
    companySlug: string;
    companyName: string;
    amount: number;
    description: string;
  };

  if (!companySlug || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Payment to ${companyName}`,
              description: description || undefined,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/c/${companySlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/c/${companySlug}?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Could not start checkout." },
      { status: 500 }
    );
  }
}
