"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function NewProductPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [listingType, setListingType] = useState<"buy" | "inquire">("buy");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompany() {
      const [{ data: companyData }, { data: userData }] = await Promise.all([
        supabase.from("companies").select("*").eq("slug", slug).single(),
        supabase.auth.getUser(),
      ]);
      setCompany(companyData as Company | null);
      setUser(userData.user);
      setLoadingCompany(false);
    }
    loadCompany();
  }, [slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please give it a name.");
      return;
    }
    if (listingType === "buy" && (!price || parseFloat(price) <= 0)) {
      setError("Please enter a price, or switch to \u201cInquire\u201d.");
      return;
    }
    if (!company) return;

    setSubmitting(true);
    const { error: insertError } = await supabase.from("products").insert({
      company_id: company.id,
      name: name.trim(),
      description: description.trim() || null,
      price: listingType === "buy" ? parseFloat(price) : null,
      image_url: imageUrl.trim() || null,
      listing_type: listingType,
    });
    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    router.push(`/c/${slug}/storefront`);
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

  if (!user || company.owner_id !== user.id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-text">
        <div className="text-center">
          <p className="font-display text-xl font-semibold">
            Only {company.name}&apos;s owner can list a product.
          </p>
          <a
            href="/login"
            className="mt-4 inline-block rounded-full bg-lamp px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-ink"
          >
            Log in
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center bg-ink px-6 py-16 text-text">
      <div className="w-full max-w-lg">
        <a
          href={`/c/${slug}/storefront`}
          className="font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text"
        >
          ← Back to storefront
        </a>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
          List a product or service
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Logo design package"
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
              rows={3}
              placeholder="What is it, and what's included?"
              className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              Image URL (optional)
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste a link to a photo, e.g. https://..."
              className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
              How should customers get this?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setListingType("buy")}
                className={`flex-1 rounded-lg border px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                  listingType === "buy"
                    ? "border-lamp bg-lamp/10 text-lamp"
                    : "border-line text-text-dim"
                }`}
              >
                Buy now (instant)
              </button>
              <button
                type="button"
                onClick={() => setListingType("inquire")}
                className={`flex-1 rounded-lg border px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                  listingType === "inquire"
                    ? "border-lamp bg-lamp/10 text-lamp"
                    : "border-line text-text-dim"
                }`}
              >
                Inquire first
              </button>
            </div>
          </div>

          {listingType === "buy" && (
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-dim">
                Price (USD)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 49.99"
                className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-lamp px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {submitting ? "Listing…" : "List it"}
          </button>
        </form>
      </div>
    </main>
  );
}
