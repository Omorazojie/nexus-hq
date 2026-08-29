"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Company, Product } from "@/lib/supabase";

function InquiryForm({ product }: { product: Product }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSending(true);
    const { error } = await supabase.from("inquiries").insert({
      product_id: product.id,
      name: name.trim(),
      email: email.trim(),
      message: message.trim() || null,
    });
    setSending(false);
    if (!error) setSent(true);
  }

  if (sent) {
    return (
      <p className="mt-3 font-mono text-xs text-live">
        ✓ Inquiry sent. They&apos;ll follow up by email.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="rounded-lg border border-line bg-ink px-3 py-2 text-xs text-text placeholder:text-text-dim focus:border-lamp"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="rounded-lg border border-line bg-ink px-3 py-2 text-xs text-text placeholder:text-text-dim focus:border-lamp"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What do you need?"
        rows={2}
        className="rounded-lg border border-line bg-ink px-3 py-2 text-xs text-text placeholder:text-text-dim focus:border-lamp"
      />
      <button
        type="submit"
        disabled={sending}
        className="rounded-full bg-lamp px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {sending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}

export default function StorefrontPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState("");
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const loadProducts = useCallback(async (companyId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();
      const companyTyped = companyData as Company | null;
      setCompany(companyTyped);
      if (companyTyped) await loadProducts(companyTyped.id);
      setLoading(false);
    }
    init();
  }, [slug, loadProducts]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (paymentStatus === "success" && sessionId && company) {
      fetch(
        `/api/checkout/confirm?session_id=${sessionId}&company_id=${company.id}`
      )
        .then((r) => r.json())
        .then(() => {
          setBanner("✓ Purchase complete — the seller has been paid.");
          router.replace(`/c/${slug}/storefront`);
        });
    } else if (paymentStatus === "cancelled") {
      setBanner("Checkout was cancelled.");
      router.replace(`/c/${slug}/storefront`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  async function handleBuy(product: Product) {
    if (!company) return;
    setBuyingId(product.id);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companySlug: company.slug,
        companyName: company.name,
        amount: product.price,
        itemName: product.name,
        description: `Purchase from ${company.name}`,
        returnPath: `/c/${company.slug}/storefront`,
      }),
    });
    const data = await res.json();
    setBuyingId(null);
    if (data.url) window.location.href = data.url;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-text-dim">
        <p className="font-mono text-sm">Loading storefront…</p>
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
    <div className="min-h-screen bg-ink text-text">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-8">
        <a
          href={`/c/${slug}`}
          className="font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text"
        >
          ← {company.name}
        </a>
        <a
          href={`/c/${slug}/storefront/new`}
          className="rounded-full border border-lamp/40 bg-lamp/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-lamp transition-colors hover:bg-lamp/20"
        >
          + List a product
        </a>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-24 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {company.name}&apos;s storefront
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Everything this company sells, in one place.
        </p>

        {banner && (
          <p className="mt-4 font-mono text-xs text-live">{banner}</p>
        )}

        {products.length === 0 ? (
          <p className="mt-8 text-sm text-text-dim">
            No products listed yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-xl border border-line bg-ink-soft"
              >
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-ink font-mono text-xs text-text-dim">
                    No image
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-base font-semibold">
                    {product.name}
                  </h2>
                  {product.description && (
                    <p className="mt-1 flex-1 text-sm text-text-dim">
                      {product.description}
                    </p>
                  )}

                  {product.listing_type === "buy" ? (
                    <>
                      <p className="mt-3 font-mono text-lg text-lamp">
                        ${Number(product.price).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleBuy(product)}
                        disabled={buyingId === product.id}
                        className="mt-3 rounded-full bg-lamp px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
                      >
                        {buyingId === product.id
                          ? "Redirecting…"
                          : "Buy with test card"}
                      </button>
                    </>
                  ) : (
                    <InquiryForm product={product} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
