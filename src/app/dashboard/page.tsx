"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", currentUser.id)
        .order("created_at", { ascending: false });

      setCompanies((data as Company[]) || []);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-text-dim">
        <p className="font-mono text-sm">Loading…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-text">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6 sm:px-8">
        <a
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Koina<span className="text-lamp">HQ</span>
        </a>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-text-dim">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-line px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:border-lamp/50 hover:text-text"
          >
            Log out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-24 sm:px-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Your companies
          </h1>
          <a
            href="/start"
            className="rounded-full bg-lamp px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03]"
          >
            + New company
          </a>
        </div>

        {companies.length === 0 ? (
          <p className="mt-8 text-sm text-text-dim">
            You haven&apos;t formed a company yet.{" "}
            <a href="/start" className="text-lamp hover:underline">
              Start one now
            </a>
            .
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {companies.map((company) => (
              <a
                key={company.id}
                href={`/c/${company.slug}`}
                className="block rounded-lg border border-line bg-ink-soft px-5 py-4 transition-colors hover:border-lamp/50"
              >
                <p className="font-display text-base font-semibold">
                  {company.name}
                </p>
                <p className="mt-1 font-mono text-[11px] text-text-dim">
                  koinahq.app/c/{company.slug}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
