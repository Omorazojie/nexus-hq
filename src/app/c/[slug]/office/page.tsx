"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Company, TeamMember, OfficePost } from "@/lib/supabase";

const ONLINE_WINDOW_MS = 90 * 1000; // considered "online" if seen in last 90s
const HEARTBEAT_MS = 30 * 1000;
const REFRESH_MS = 15 * 1000;

function memberStorageKey(companyId: string) {
  return `nexushq_member_${companyId}`;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function OfficePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [posts, setPosts] = useState<OfficePost[]>([]);
  const [loading, setLoading] = useState(true);

  const [me, setMe] = useState<TeamMember | null>(null);

  const [joinName, setJoinName] = useState("");
  const [joinRole, setJoinRole] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);

  const loadTeamAndPosts = useCallback(async (companyId: string) => {
    const [{ data: teamData }, { data: postData }] = await Promise.all([
      supabase
        .from("team_members")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: true }),
      supabase
        .from("office_posts")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setTeam((teamData as TeamMember[]) || []);
    setPosts((postData as OfficePost[]) || []);
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();

      const companyTyped = companyData as Company | null;
      setCompany(companyTyped);

      if (companyTyped) {
        await loadTeamAndPosts(companyTyped.id);

        const storedId = localStorage.getItem(
          memberStorageKey(companyTyped.id)
        );
        if (storedId) {
          const { data: meData } = await supabase
            .from("team_members")
            .select("*")
            .eq("id", storedId)
            .single();
          if (meData) {
            setMe(meData as TeamMember);
            await supabase
              .from("team_members")
              .update({ last_seen_at: new Date().toISOString() })
              .eq("id", storedId);
          }
        }
      }
      setLoading(false);
    }
    init();
  }, [slug, loadTeamAndPosts]);

  // Heartbeat: keep "me" marked online
  useEffect(() => {
    if (!me) return;
    const id = setInterval(async () => {
      await supabase
        .from("team_members")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", me.id);
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [me]);

  // Periodic refresh so you see others come online / new posts
  useEffect(() => {
    if (!company) return;
    const id = setInterval(() => {
      loadTeamAndPosts(company.id);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [company, loadTeamAndPosts]);

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setJoinError("");

    if (!joinName.trim()) {
      setJoinError("Please enter your name.");
      return;
    }
    if (!company) return;

    setJoining(true);
    const { data, error } = await supabase
      .from("team_members")
      .insert({
        company_id: company.id,
        name: joinName.trim(),
        role: joinRole.trim() || "Team member",
        last_seen_at: new Date().toISOString(),
      })
      .select()
      .single();
    setJoining(false);

    if (error || !data) {
      setJoinError("Something went wrong joining. Please try again.");
      return;
    }

    localStorage.setItem(memberStorageKey(company.id), data.id);
    setMe(data as TeamMember);
    setTeam((prev) => [...prev, data as TeamMember]);
  }

  async function handlePost(e: FormEvent) {
    e.preventDefault();
    if (!postText.trim() || !me || !company) return;

    setPosting(true);
    const { data, error } = await supabase
      .from("office_posts")
      .insert({
        company_id: company.id,
        member_id: me.id,
        author_name: me.name,
        message: postText.trim(),
      })
      .select()
      .single();
    setPosting(false);

    if (!error && data) {
      setPosts((prev) => [data as OfficePost, ...prev]);
      setPostText("");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-text-dim">
        <p className="font-mono text-sm">Opening the office…</p>
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

  const onlineCount = team.filter(
    (m) => Date.now() - new Date(m.last_seen_at).getTime() < ONLINE_WINDOW_MS
  ).length;

  return (
    <div className="min-h-screen bg-ink text-text">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6 sm:px-8">
        <a
          href={`/c/${slug}`}
          className="font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text"
        >
          ← {company.name}
        </a>
        <span className="flex items-center gap-2 font-mono text-[11px] text-text-dim">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-live" />
          {onlineCount} online now
        </span>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-24 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {company.name}&apos;s office
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Where the team shows up, whatever timezone they&apos;re in.
        </p>

        {!me && (
          <div className="mt-8 rounded-xl border border-line bg-ink-soft p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">
              Join this office
            </h2>
            <p className="mt-1 text-sm text-text-dim">
              Were you hired into a position at {company.name}? Check in
              here.
            </p>
            <form
              onSubmit={handleJoin}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Your name"
                className="flex-1 rounded-lg border border-line bg-ink px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
              />
              <input
                value={joinRole}
                onChange={(e) => setJoinRole(e.target.value)}
                placeholder="Your role (e.g. Customer Support)"
                className="flex-1 rounded-lg border border-line bg-ink px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
              />
              <button
                type="submit"
                disabled={joining}
                className="shrink-0 rounded-full bg-lamp px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                {joining ? "Joining…" : "Check in"}
              </button>
            </form>
            {joinError && (
              <p className="mt-2 text-sm text-red-400">{joinError}</p>
            )}
          </div>
        )}

        {me && (
          <p className="mt-6 font-mono text-xs text-live">
            ✓ Checked in as {me.name} ({me.role})
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Roster */}
          <div className="rounded-xl border border-line bg-ink-soft p-6">
            <h2 className="font-mono text-xs uppercase tracking-wider text-text-dim">
              Team ({team.length})
            </h2>
            {team.length === 0 ? (
              <p className="mt-4 text-sm text-text-dim">
                No one has checked in yet. Be the first.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {team.map((member) => {
                  const online =
                    Date.now() - new Date(member.last_seen_at).getTime() <
                    ONLINE_WINDOW_MS;
                  return (
                    <li key={member.id} className="flex items-center gap-3">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: online
                            ? "var(--live)"
                            : "var(--line)",
                          boxShadow: online
                            ? "0 0 6px 0 rgba(79,209,165,0.6)"
                            : "none",
                        }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {member.name}
                        </p>
                        <p className="truncate font-mono text-[11px] text-text-dim">
                          {member.role} ·{" "}
                          {online ? "online" : timeAgo(member.last_seen_at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Feed */}
          <div className="rounded-xl border border-line bg-ink-soft p-6">
            <h2 className="font-mono text-xs uppercase tracking-wider text-text-dim">
              Team feed
            </h2>

            {me ? (
              <form onSubmit={handlePost} className="mt-4 flex gap-3">
                <input
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Share an update with the team…"
                  className="flex-1 rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-lamp"
                />
                <button
                  type="submit"
                  disabled={posting || !postText.trim()}
                  className="shrink-0 rounded-full bg-lamp px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
                >
                  Post
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-text-dim">
                Check in above to post an update.
              </p>
            )}

            <div className="mt-5 flex flex-col gap-4">
              {posts.length === 0 ? (
                <p className="text-sm text-text-dim">
                  No updates yet. This is where the team&apos;s day happens.
                </p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border-t border-line pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {post.author_name}
                      </p>
                      <p className="font-mono text-[11px] text-text-dim">
                        {timeAgo(post.created_at)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-text-dim">
                      {post.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
