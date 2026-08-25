import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

async function getCompany(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as Company;
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) {
    notFound();
  }

  const initial = company.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-ink text-text">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Nexus<span className="text-lamp">HQ</span>
        </Link>
        <span className="flex items-center gap-2 font-mono text-[11px] text-text-dim">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-live" />
          Company page — live
        </span>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-line bg-ink-soft font-display text-2xl font-semibold text-lamp">
            {initial}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {company.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-text-dim">
              nexushq.com/c/{company.slug}
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-line bg-ink-soft p-6 sm:p-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-text-dim">
            Mission
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text sm:text-lg">
            {company.mission}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-dashed border-line px-4 py-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-text-dim">
              Open positions
            </p>
            <p className="mt-2 text-sm text-text-dim">Coming next</p>
          </div>
          <div className="rounded-lg border border-dashed border-line px-4 py-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-text-dim">
              Team office
            </p>
            <p className="mt-2 text-sm text-text-dim">Coming next</p>
          </div>
          <div className="rounded-lg border border-dashed border-line px-4 py-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-text-dim">
              Storefront
            </p>
            <p className="mt-2 text-sm text-text-dim">Coming next</p>
          </div>
        </div>

        <p className="mt-10 text-center font-mono text-[11px] text-text-dim">
          This page was created just now and saved for good — refresh, close
          your browser, come back tomorrow: it'll still be here.
        </p>
      </section>
    </div>
  );
}
