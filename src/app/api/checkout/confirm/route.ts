import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const companyId = req.nextUrl.searchParams.get("company_id");

  if (!secretKey || !sessionId || !companyId) {
    return NextResponse.json({ error: "Missing data." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ recorded: false });
    }

    // Avoid recording the same payment twice on refresh
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ recorded: true, alreadyExisted: true });
    }

    const amount = (session.amount_total || 0) / 100;

    await supabase.from("payments").insert({
      company_id: companyId,
      type: "incoming",
      amount,
      currency: session.currency || "usd",
      description: session.line_items?.data?.[0]?.description || "Payment",
      status: "paid",
      stripe_session_id: sessionId,
    });

    return NextResponse.json({ recorded: true });
  } catch {
    return NextResponse.json({ error: "Could not confirm." }, { status: 500 });
  }
}
