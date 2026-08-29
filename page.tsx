"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 py-16 text-text">
      <div className="w-full max-w-sm">
        <a
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text"
        >
          ← KoinaHQ
        </a>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
          Log in
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-text placeholder:text-text-dim focus:border-lamp"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-lamp px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-text-dim">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-lamp hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
