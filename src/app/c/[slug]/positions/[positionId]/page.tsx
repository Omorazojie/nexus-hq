"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Company, Position } from "@/lib/supabase";

export default function PositionDetailPage() {
  const params = useParams<{ slug: string; positionId: string }>();
  const { slug, positionId } = params;

  const [company, setCompany] = useState<Company | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: companyData }, { data: positionData }] =
        await Promise.all([
          supabase.from("companies").select("*").eq("slug", slug).single(),
          supabase.from("positions").select("*").eq("id", positionId).single(),
        ]);
      setCompany(companyData as Company | null);
      setPosition(positionData as Position | null);
      setLoading(false);
    }
    load();
  }, [slug, positionId]);

  async function handleApply(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("applications").insert({
      position_id: positionId,
      applicant_name: name.trim(),
      applicant_email: email.trim(),
      message: message.trim() || null,
    });
    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong submitting your application.");
      return;
    }

    setApplied(true);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-text-dim">
        <p className="font-mono text-sm">Loading…</p>
      </main>
    );
  }

  if (!position || !company) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-text">
        <p>Position not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-16 text-text">
      <div className="mx-auto max-w-2xl">
        <a
          href={`/c/${slug}`}
          className="font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text"
        >
          ← {company.name}
        </a>

        <div className="mt-6 rounded-2xl border border-line bg-ink-soft p-8">
          <p className="font-mono text-xs uppercase tracking-wider text-lamp">
            {position.position_type || "Position"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {position.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-text-dim">
            {position.location && <span>📍 {position.location}</span>}
            {position.pay && <span>💰 {position.pay}</span>}
          </div>

          {position.description && (
            <div className="mt-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-text-dim">
                What you&apos;ll do
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text">
                {position.description}
              </p>
            </div>
          )}

          {position.expectations && (
            <div className="mt-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-text-dim">
                What&apos;s expected
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text">
                {position.expectations}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-ink-soft p-8">
          {applied ? (
            <div className="text-center">
              <p className="font-mono text-sm text-live">
                ✓ Application sent to {company.name}.
              </p>
              <p className="mt-2 text-sm text-text-dim">
                They&apos;ll be able to see it and follow up with you
                directly.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold">
                Apply for this position
              </h2>
              <form onSubmit={handleApply} className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
                    Your name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-line bg-ink px-4 py-3 text-text focus:border-lamp"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
                    Your email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-line bg-ink px-4 py-3 text-text focus:border-lamp"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
                    Why you&apos;re a fit (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-line bg-ink px-4 py-3 text-text focus:border-lamp"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-lamp px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Apply"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
