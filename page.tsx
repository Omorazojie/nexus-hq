import OfficeTower from "@/components/OfficeTower";

const STEPS = [
  {
    n: "01",
    title: "Form your company",
    body: "Pick a name, a mission, and a look. Get a public company page that doubles as your storefront — live in minutes, not weeks.",
  },
  {
    n: "02",
    title: "Open your positions",
    body: "Define real roles — not gigs. Post them to a global talent pool with pay, contracts, and expectations built in.",
  },
  {
    n: "03",
    title: "Hire, worldwide",
    body: "Review candidates, run trial tasks, and sign compliant contracts automatically, wherever your hire lives.",
  },
  {
    n: "04",
    title: "Open the office",
    body: "Your team shows up to a real shared workspace — desks, departments, presence — not just another chat channel.",
  },
  {
    n: "05",
    title: "Sell & get paid",
    body: "Customers discover and message you through your company page. Revenue, payroll, and payouts run through the platform.",
  },
];

const PILLARS = [
  {
    title: "Company Identity",
    body: "A public profile that acts as your storefront, your portfolio, and your front door — the first thing customers and candidates see.",
  },
  {
    title: "Global Hiring",
    body: "Post real positions, match with talent anywhere, and generate compliant contracts automatically by country.",
  },
  {
    title: "The Online Office",
    body: "A persistent workspace with live presence, departments, and culture — built so a team that never meets in person still feels like one.",
  },
  {
    title: "Payments & Payroll",
    body: "Multi-currency wallets, automated payroll runs, and revenue splits — money moves as natively as messages do.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ink text-text">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="font-display text-lg font-semibold tracking-tight">
          Nexus<span className="text-lamp">HQ</span>
        </div>
        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-wider text-text-dim sm:flex">
          <a href="#how" className="transition-colors hover:text-text">
            How it works
          </a>
          <a href="#pillars" className="transition-colors hover:text-text">
            Platform
          </a>
        </nav>
        <a
          href="/start"
          className="rounded-full border border-lamp/40 bg-lamp/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-lamp transition-colors hover:bg-lamp/20"
        >
          Start your company
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-live">
              A company that never sleeps
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Start a real company.
              <br />
              Hire a real team.
              <br />
              <span className="text-lamp">Never open an office.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-text-dim sm:text-lg">
              Nexus HQ is where you form your company, hire every position,
              give your team a place to belong, market to customers, and get
              paid — entirely online, from anywhere in the world.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/start"
                className="rounded-full bg-lamp px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03]"
              >
                Start your company
              </a>
              <a
                href="#how"
                className="font-mono text-sm uppercase tracking-wider text-text-dim transition-colors hover:text-text"
              >
                See how it works →
              </a>
            </div>
          </div>

          <div>
            <OfficeTower />
            <p className="mt-3 text-center font-mono text-[11px] text-text-dim">
              Every lit window is a person, working, right now — in a
              timezone you'll never have to think about.
            </p>
          </div>
        </div>
      </section>

      {/* Problem strip */}
      <section className="border-y border-line bg-ink-soft">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
          <p className="max-w-3xl font-display text-xl leading-snug text-text sm:text-2xl">
            Right now, running a company across borders means duct-taping
            together a hiring site, a payroll tool, a chat app, and a website
            builder — and your team still doesn't feel like a team.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Five steps. One platform.
        </h2>
        <div className="mt-10 grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`border-line px-0 py-6 sm:px-6 sm:py-0 ${
                i === 0 ? "sm:pl-0" : "sm:border-l"
              }`}
            >
              <div className="font-mono text-xs text-lamp">{step.n}</div>
              <h3 className="mt-3 font-display text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-dim">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section id="pillars" className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything a borderless company needs
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-lg border border-line bg-surface p-6"
              >
                <h3 className="font-display text-lg font-semibold text-lamp">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="join" className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
        <div className="rounded-2xl border border-line bg-ink-soft px-8 py-14 text-center sm:px-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Your company's next hire could be anywhere.
            <br />
            Give them somewhere to show up.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-text-dim sm:text-base">
            Be among the first companies to form, hire, and operate on
            Nexus HQ — it takes about a minute.
          </p>
          <a
            href="/start"
            className="mt-8 inline-block rounded-full bg-lamp px-8 py-3 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:scale-[1.03]"
          >
            Start your company
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 font-mono text-xs text-text-dim sm:flex-row sm:px-8">
          <span>Nexus HQ — building the company, online.</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
