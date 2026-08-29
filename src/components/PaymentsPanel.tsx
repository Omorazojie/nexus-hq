"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Payment } from "@/lib/supabase";

export default function PaymentsPanel({
  companyId,
  companySlug,
  companyName,
}: {
  companyId: string;
  companySlug: string;
  companyName: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [banner, setBanner] = useState("");

  const [payAmount, setPayAmount] = useState("");
  const [payDescription, setPayDescription] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const [payoutName, setPayoutName] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  const loadPayments = useCallback(async () => {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setPayments((data as Payment[]) || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Handle returning from Stripe Checkout
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "success" && sessionId) {
      setConfirming(true);
      fetch(
        `/api/checkout/confirm?session_id=${sessionId}&company_id=${companyId}`
      )
        .then((r) => r.json())
        .then(() => {
          setBanner("✓ Payment received and recorded.");
          setConfirming(false);
          loadPayments();
          router.replace(`/c/${companySlug}`);
        })
        .catch(() => setConfirming(false));
    } else if (paymentStatus === "cancelled") {
      setBanner("Payment was cancelled.");
      router.replace(`/c/${companySlug}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;

    setPayLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companySlug,
        companyName,
        amount,
        description: payDescription.trim() || `Payment to ${companyName}`,
      }),
    });
    const data = await res.json();
    setPayLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      setBanner("Could not start checkout. Try again.");
    }
  }

  async function handlePayout(e: FormEvent) {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (!payoutName.trim() || !amount || amount <= 0) return;

    setPayoutLoading(true);
    const { error } = await supabase.from("payments").insert({
      company_id: companyId,
      type: "payout",
      amount,
      currency: "usd",
      description: payoutNote.trim() || "Payout",
      status: "recorded",
      payee_name: payoutName.trim(),
    });
    setPayoutLoading(false);

    if (!error) {
      setPayoutName("");
      setPayoutAmount("");
      setPayoutNote("");
      loadPayments();
    }
  }

  const totalIn = payments
    .filter((p) => p.type === "incoming" && p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOut = payments
    .filter((p) => p.type === "payout")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="mt-8 rounded-xl border border-line bg-ink-soft p-6 sm:p-8">
      <h2 className="font-mono text-xs uppercase tracking-wider text-text-dim">
        Payments{" "}
        <span className="text-text-dim/60">(test mode — no real money)</span>
      </h2>

      {(banner || confirming) && (
        <p className="mt-3 font-mono text-xs text-live">
          {confirming ? "Confirming payment…" : banner}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-line bg-ink px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-dim">
            Received
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-live">
            ${totalIn.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-ink px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-dim">
            Paid out
          </p>
          <p className="mt-1 font-display text-xl font-semibold">
            ${totalOut.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <form onSubmit={handlePay} className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-lamp">
            Pay this company
          </h3>
          <input
            type="number"
            min="1"
            step="0.01"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="Amount (USD)"
            className="rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-lamp"
          />
          <input
            value={payDescription}
            onChange={(e) => setPayDescription(e.target.value)}
            placeholder="What's this for? (optional)"
            className="rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-lamp"
          />
          <button
            type="submit"
            disabled={payLoading}
            className="rounded-full bg-lamp px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {payLoading ? "Redirecting…" : "Pay with test card"}
          </button>
          <p className="font-mono text-[10px] text-text-dim">
            Use test card 4242 4242 4242 4242, any future date, any CVC.
          </p>
        </form>

        <form onSubmit={handlePayout} className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-text-dim">
            Log a payout to someone
          </h3>
          <input
            value={payoutName}
            onChange={(e) => setPayoutName(e.target.value)}
            placeholder="Who was paid?"
            className="rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-lamp"
          />
          <input
            type="number"
            min="1"
            step="0.01"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="Amount (USD)"
            className="rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-lamp"
          />
          <input
            value={payoutNote}
            onChange={(e) => setPayoutNote(e.target.value)}
            placeholder="Note (optional)"
            className="rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-lamp"
          />
          <button
            type="submit"
            disabled={payoutLoading}
            className="rounded-full border border-line px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-text transition-colors hover:border-lamp/50 disabled:opacity-60"
          >
            {payoutLoading ? "Saving…" : "Log payout"}
          </button>
          <p className="font-mono text-[10px] text-text-dim">
            Recorded here for now — real payouts come later.
          </p>
        </form>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-text-dim">
          Recent activity
        </h3>
        {loading ? (
          <p className="mt-3 text-sm text-text-dim">Loading…</p>
        ) : payments.length === 0 ? (
          <p className="mt-3 text-sm text-text-dim">No transactions yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {payments.slice(0, 8).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between font-mono text-xs"
              >
                <span className="text-text-dim">
                  {p.type === "incoming"
                    ? `↓ ${p.description}`
                    : `↑ ${p.payee_name} — ${p.description}`}
                </span>
                <span
                  className={
                    p.type === "incoming" ? "text-live" : "text-text"
                  }
                >
                  {p.type === "incoming" ? "+" : "-"}${Number(p.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
