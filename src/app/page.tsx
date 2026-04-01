import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

const TOOLS = [
  {
    href: "/api/sso/token?target=cadeaubon",
    label: "Cadeaubon Beheer",
    description: "Cadeaubonnen, arrangementen, bestellingen en instellingen",
    icon: "🎁",
    color: "bg-amber-50 text-amber-600 group-hover:bg-amber-600",
  },
  {
    href: "/api/sso/token?target=vaarplanner",
    label: "VaarPlanner",
    description: "Tafelindelingen, afvaarten en keukenlijsten beheren",
    icon: "📅",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
  },
  {
    href: "/api/sso/token?target=werkenbij",
    label: "Werken bij Cascade",
    description: "Vacatures, sollicitaties en de werkenbij-website",
    icon: "💼",
    color: "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
  },
  {
    href: "/api/sso/token?target=qrscan",
    label: "QR Scanner",
    description: "Scan QR-codes van reserveringen bij de ingang",
    icon: "📷",
    color: "bg-purple-50 text-purple-600 group-hover:bg-purple-600",
  },
  {
    href: "https://cascade.smarteventmanager.com",
    label: "SEM",
    description: "Smart Event Manager — reserveringen en boekingen",
    icon: "⚓",
    color: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600",
    external: true,
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--cascade-cream)]">
      {/* Header */}
      <header style={{ backgroundColor: "var(--cascade-navy)" }} className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚓</span>
            <span className="text-lg font-bold text-white">
              Cascade Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">
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
                className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight" style={{ color: "var(--cascade-navy)" }}>
          Welkom, {session.user.name?.split(" ")[0] ?? "medewerker"}
        </h1>
        <p className="mb-10 text-lg" style={{ color: "var(--cascade-muted)" }}>
          Kies een tool om mee aan de slag te gaan.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              target={tool.external ? "_blank" : undefined}
              rel={tool.external ? "noopener noreferrer" : undefined}
              className="group flex flex-col rounded-[24px] bg-white p-7 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ border: "1px solid rgba(9,45,97,0.08)" }}
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${tool.color}`}>
                <span className="text-2xl group-hover:grayscale group-hover:brightness-200">{tool.icon}</span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--cascade-navy)" }}>
                {tool.label}
              </h2>
              <p className="mt-2 text-sm font-medium" style={{ color: "var(--cascade-muted)" }}>
                {tool.description}
              </p>
            </a>
          ))}
        </div>
      </main>

      <footer className="border-t py-4 text-center text-xs" style={{ color: "var(--cascade-muted)", borderColor: "rgba(9,45,97,0.05)" }}>
        Rederij Cascade &copy; 2026
      </footer>
    </div>
  );
}
