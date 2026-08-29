import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 0;

async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Company[];
}

export default async function MarketplacePage() {
  const companies = await getCompanies();

  return (
    <div className="min-h-screen bg-ink text-text">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Nexus<span className="text-lamp">HQ</span>
        </Link>
        <a
          href="/start"
          className="rounded-full border border-lamp/40 bg-lamp/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-lamp transition-colors hover:bg-lamp/20"
        >
          Start your company
        </a>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-24 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          The marketplace
        </h1>
        <p className="mt-2 max-w-xl text-sm text-text-dim">
          Every company formed on Nexus HQ — discover who&apos;s hiring,
          who&apos;s selling, and who&apos;s open for business.
        </p>

        {companies.length === 0 ? (
          <p className="mt-10 text-sm text-text-dim">
            No companies yet — be the first to form one.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => {
              const initial =
                company.name.trim().charAt(0).toUpperCase() || "?";
              return (
                <a
                  key={company.id}
                  href={`/c/${company.slug}`}
                  className="flex flex-col rounded-xl border border-line bg-ink-soft p-6 transition-colors hover:border-lamp/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-ink font-display text-sm font-semibold text-lamp">
                      {initial}
                    </div>
                    <h2 className="font-display text-lg font-semibold">
                      {company.name}
                    </h2>
                  </div>
                  {company.mission && (
                    <p className="mt-3 line-clamp-3 text-sm text-text-dim">
                      {company.mission}
                    </p>
                  )}
                  <span className="mt-4 font-mono text-xs text-lamp">
                    Visit company →
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
