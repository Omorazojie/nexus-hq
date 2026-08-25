"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/supabase";

const POSITION_TYPES = ["Full-time", "Part-time", "Contract"];

export default function NewPositionPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const [title, setTitle] = useState("");
  const [positionType, setPositionType] = useState(POSITION_TYPES[0]);
  const [location, setLocation] = useState("");
  const [pay, setPay] = useState("");
  const [description, setDescription] = useState("");
  const [expectations, setExpectations] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompany() {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();
      setCompany(data as Company | null);
      setLoadingCompany(false);
    }
    loadCompany();
  }, [slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please give the position a title.");
      return;
    }
    if (!company) {
      setError("Could not find this company.");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("positions").insert({
      company_id: company.id,
      title: title.trim(),
      position_type: positionType,
      location: location.trim(),
      pay: pay.trim(),
      description: description.trim(),
      expectations: expectations.trim(),
    });
    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong posting this position. Please try again.");
      return;
    }

    router.push(`/c/${slug}`);
  }

  if (loadingCompany) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-text-dim">
        <p className="font-mono text-sm">Loading…</p>
      </main>
    );
  }

  if (!company) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-text">
        <p>Company not found.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center bg-ink px-6 py-16 text-text">
      <div className="w-full max-w-lg">
        <a
          href={`/c/${slug}`}
          className="font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text"
        >
          ← Back to {company.name}
        </a>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
          Post a position
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Define the role clearly — this is what candidates worldwide will
          see.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              Job title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Customer Support Lead"
              className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
                Type
              </label>
              <select
                value={positionType}
                onChange={(e) => setPositionType(e.target.value)}
                className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text focus:border-lamp"
              >
                {POSITION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
                Pay
              </label>
              <input
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                placeholder="e.g. $800/mo"
                className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              Location / timezone
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, any timezone — or GMT+1 to GMT+3"
              className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this person actually do day to day?"
              rows={4}
              className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              Expectations
            </label>
            <textarea
              value={expectations}
              onChange={(e) => setExpectations(e.target.value)}
              placeholder="Skills, experience, hours, or results you expect from this hire."
              rows={4}
              className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-lamp px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post position"}
          </button>
        </form>
      </div>
    </main>
  );
}
