import { supabase } from "@/lib/supabase";
import type { Company, Position } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PaymentsPanel from "@/components/PaymentsPanel";

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

async function getPositions(companyId: string): Promise<Position[]> {
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Position[];
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

  const positions = await getPositions(company.id);
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

        {/* Open positions */}
        <div className="mt-8 rounded-xl border border-line bg-ink-soft p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-text-dim">
              Open positions {positions.length > 0 && `(${positions.length})`}
            </h2>
            <a
              href={`/c/${company.slug}/positions/new`}
              className="rounded-full border border-lamp/40 bg-lamp/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-lamp transition-colors hover:bg-lamp/20"
            >
              + Post a position
            </a>
          </div>

          {positions.length === 0 ? (
            <p className="mt-4 text-sm text-text-dim">
              No open positions yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {positions.map((position) => (
                <a
                  key={position.id}
                  href={`/c/${company.slug}/positions/${position.id}`}
                  className="block rounded-lg border border-line bg-ink px-5 py-4 transition-colors hover:border-lamp/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-base font-semibold">
                        {position.title}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-text-dim">
                        {position.position_type}
                        {position.location ? ` · ${position.location}` : ""}
                        {position.pay ? ` · ${position.pay}` : ""}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-lamp">
                      View →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <Suspense fallback={null}>
          <PaymentsPanel
            companyId={company.id}
            companySlug={company.slug}
            companyName={company.name}
          />
        </Suspense>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={`/c/${company.slug}/office`}
            className="rounded-lg border border-line bg-ink-soft px-4 py-6 text-center transition-colors hover:border-lamp/50"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-lamp">
              Team office →
            </p>
            <p className="mt-2 text-sm text-text-dim">
              See who&apos;s checked in and the team feed
            </p>
          </a>
          <div className="rounded-lg border border-dashed border-line px-4 py-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-text-dim">
              Storefront
            </p>
            <p className="mt-2 text-sm text-text-dim">Coming next</p>
          </div>
        </div>

        <p className="mt-10 text-center font-mono text-[11px] text-text-dim">
          This page was created just now and saved for good — refresh, close
          your browser, come back tomorrow: it&apos;ll still be here.
        </p>
      </section>
    </div>
  );
}
