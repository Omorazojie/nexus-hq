"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "company"}-${suffix}`;
}

export default function StartPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mission, setMission] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a company name.");
      return;
    }

    setLoading(true);
    const slug = slugify(name);

    const { error: insertError } = await supabase.from("companies").insert({
      slug,
      name: name.trim(),
      mission: mission.trim() || null,
    });

    setLoading(false);

    if (insertError) {
      setError("Something went wrong creating your company. Please try again.");
      return;
    }

    router.push(`/c/${slug}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 py-16 text-text">
      <div className="w-full max-w-lg">
        
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text"
        >
          ← Back home
        </a>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
          Form your company
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Give it a name and a mission. You&apos;ll get a public company page
          right away.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              Company name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bright Path Studio"
              className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              Mission (optional)
            </label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="What does your company do, and for whom?"
              rows={4}
              className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-lamp px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create company"}
          </button>
        </form>
      </div>
    </main>
  );
}
