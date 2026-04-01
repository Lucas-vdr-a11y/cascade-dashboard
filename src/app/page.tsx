import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getEffectivePermissions } from "@/lib/permissions";

const ALL_APPS = [
  {
    id: "cadeaubon",
    name: "Cadeaubon",
    description: "Cadeaubonnen beheer",
    href: "/api/sso/token?target=cadeaubon",
    color: "bg-[var(--cascade-gold)]",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13" /><path d="M3 12h18" />
        <path d="M12 8c-2-3-6-3-6 0s4 0 6 0" /><path d="M12 8c2-3 6-3 6 0s-4 0-6 0" />
      </svg>
    ),
  },
  {
    id: "vaarplanner",
    name: "VaarPlanner",
    description: "Stoelen- en tafelplanning",
    href: "/api/sso/token?target=vaarplanner",
    color: "bg-[var(--cascade-navy)]",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6" /><path d="M12 14l4-10 4 10" /><path d="M8 14V4l4 2" />
      </svg>
    ),
  },
  {
    id: "werkenbij",
    name: "Werkenbij Cascade",
    description: "Vacatures en sollicitaties",
    href: "/api/sso/token?target=werkenbij",
    color: "bg-[var(--cascade-gold)]",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: "qrscan",
    name: "QR Scanner",
    description: "Boarding verificatie",
    href: "/api/sso/token?target=qrscan",
    color: "bg-[var(--cascade-blue)]",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" /><path d="M14 14h2v2h-2z" /><path d="M20 14h2v2h-2z" />
        <path d="M14 20h2v2h-2z" /><path d="M20 20h2v2h-2z" /><path d="M17 17h2v2h-2z" />
      </svg>
    ),
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { customRole: true },
  });

  const userApps = user?.apps || [];
  const perms = getEffectivePermissions(user?.customRole?.permissions || [], user?.permissionOverrides || []);
  const canManageUsers = perms.includes("users:manage");
  const roleName = user?.customRole?.name || "Geen rol";
  const firstName = user?.name?.split(" ")[0] || "medewerker";

  // Filter apps based on user's assigned apps (show all if admin or no apps configured)
  const visibleApps = userApps.length > 0
    ? ALL_APPS.filter(app => userApps.includes(app.id))
    : ALL_APPS;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: "var(--cascade-navy)" }}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.07 }}>
        <div className="absolute right-0 bottom-0 w-[800px] h-[800px] bg-white rounded-full blur-[100px]" style={{ transform: "translate(33%, 33%)" }} />
        <div className="absolute left-0 top-0 w-[600px] h-[600px] rounded-full blur-[100px]" style={{ backgroundColor: "var(--cascade-blue)", transform: "translate(-25%, -25%)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full pt-10 pb-4 px-6 flex flex-col items-center">
        <img src="/images/cascade-logo-white.svg" alt="Rederij Cascade" className="h-14 w-auto mb-8" />
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Welkom, {firstName}
        </h1>
        <p className="text-white/60 text-base mt-2">Cascade Tools</p>
      </header>

      {/* App cards */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-6 pt-8 pb-16">
        <div className={`grid gap-5 w-full max-w-3xl ${
          visibleApps.length <= 2 ? "grid-cols-1 md:grid-cols-2 max-w-xl mx-auto" : "grid-cols-1 md:grid-cols-3"
        }`}>
          {visibleApps.map((app) => (
            <a
              key={app.id}
              href={app.href}
              className="group rounded-[32px] p-7 flex flex-col items-start transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] border border-transparent"
              style={{ backgroundColor: "var(--cascade-cream)" }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white ${app.color}`}>
                {app.icon}
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
                {app.name}
              </h2>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--cascade-muted)" }}>
                {app.description}
              </p>
              <div className="flex items-center justify-between w-full mt-auto">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full" style={{ color: "var(--cascade-muted)", backgroundColor: "var(--cascade-cream-dark)" }}>
                  {roleName}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: "var(--cascade-gold)" }}>
                  Openen
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <a href="/account" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-all hover:bg-white/10">
            Mijn account
          </a>
          {canManageUsers && (
            <a href="/admin/users" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-all hover:bg-white/10">
              Gebruikers & Rollen
            </a>
          )}
        </div>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
          <button type="submit" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            Uitloggen
          </button>
        </form>
        <p className="text-white/20 text-xs">&copy; 2026 Rederij Cascade</p>
      </footer>
    </div>
  );
}
