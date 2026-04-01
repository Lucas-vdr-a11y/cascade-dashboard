import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

const TOOLS = [
  {
    href: "/api/sso/token?target=cadeaubon",
    label: "Cadeaubon Beheer",
    description: "Cadeaubonnen, arrangementen, bestellingen en instellingen",
    icon: "🎁",
    accent: "#8E7649",
    accentBg: "#E8E1D6",
  },
  {
    href: "/api/sso/token?target=vaarplanner",
    label: "VaarPlanner",
    description: "Tafelindelingen, afvaarten en keukenlijsten beheren",
    icon: "📅",
    accent: "#586C56",
    accentBg: "#DBE4DA",
  },
  {
    href: "/api/sso/token?target=werkenbij",
    label: "Werken bij Cascade",
    description: "Vacatures, sollicitaties en de werkenbij-website",
    icon: "💼",
    accent: "#1D5577",
    accentBg: "#ABC9D4",
  },
  {
    href: "/api/sso/token?target=qrscan",
    label: "QR Scanner",
    description: "Scan QR-codes van reserveringen bij de ingang",
    icon: "📷",
    accent: "#092D61",
    accentBg: "#DAE0E8",
  },
  {
    href: "https://cascade.smarteventmanager.com",
    label: "SEM",
    description: "Smart Event Manager — reserveringen en boekingen",
    icon: "⚓",
    accent: "#49648A",
    accentBg: "#DAE0E8",
    external: true,
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--cascade-cream)" }}>
      {/* Header */}
      <header style={{ backgroundColor: "var(--cascade-navy)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--cascade-gold)" }}>
              <span className="text-xl text-white">⚓</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Cascade Dashboard
              </span>
              <span className="ml-2 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                Intern
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-sm text-white/70" style={{ fontFamily: "var(--font-body)" }}>
              {session.user.name ?? session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Subtle wave divider */}
      <div style={{ backgroundColor: "var(--cascade-navy)" }}>
        <svg viewBox="0 0 1440 60" fill="none" className="w-full block">
          <path d="M0 30C360 60 720 0 1080 30C1260 45 1380 20 1440 30V60H0V30Z" fill="var(--cascade-cream)" />
        </svg>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
        <div className="mb-10">
          <h1 className="mb-1 text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
            Welkom, {session.user.name?.split(" ")[0] ?? "medewerker"}
          </h1>
          <p className="text-base" style={{ fontFamily: "var(--font-body)", color: "var(--cascade-muted)" }}>
            Kies een tool om mee aan de slag te gaan.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              target={tool.external ? "_blank" : undefined}
              rel={tool.external ? "noopener noreferrer" : undefined}
              className="group flex flex-col rounded-2xl bg-white p-7 shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ border: "1px solid var(--cascade-border)" }}
            >
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-200"
                style={{ backgroundColor: tool.accentBg }}
              >
                <span className="text-2xl">{tool.icon}</span>
              </div>
              <h2
                className="text-xl font-bold transition-colors duration-200"
                style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}
              >
                {tool.label}
              </h2>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--cascade-muted)" }}
              >
                {tool.description}
              </p>
              <div className="mt-auto pt-5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 group-hover:shadow-md"
                  style={{ backgroundColor: tool.accent }}
                >
                  Openen →
                </span>
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--cascade-muted)", borderTop: "1px solid var(--cascade-border)" }}>
        Rederij Cascade &copy; 2026 — De vloot vol verrassingen
      </footer>
    </div>
  );
}
