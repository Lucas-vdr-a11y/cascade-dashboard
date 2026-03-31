import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

const TOOLS = [
  {
    href: "https://cadeaukaart.varenbijcascade.com/admin",
    label: "Cadeaubon Beheer",
    description: "Cadeaubonnen, bestellingen en instellingen",
    icon: "🎁",
  },
  {
    href: "https://planner.varenbijcascade.com",
    label: "Personeelsplanner",
    description: "Personeelsinzet per afvaart plannen",
    icon: "📅",
  },
  {
    href: "https://cascade.smarteventmanager.com",
    label: "SEM (Smart Event Manager)",
    description: "Reserveringen en evenementenbeheer",
    icon: "⚓",
    external: true,
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--cascade-cream)]">
      {/* Header */}
      <header className="border-b border-[var(--cascade-navy)]/10 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cascade-navy)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.13-.53.13s-.37-.04-.53-.13l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.13.53-.13s.37.04.53.13l7.9 4.44c.32.17.53.5.53.88v9z" />
              </svg>
            </div>
            <span className="font-bold text-[var(--cascade-navy)]">
              Cascade Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--cascade-muted)]">
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
                className="text-sm text-[var(--cascade-muted)] hover:text-[var(--cascade-navy)]"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-[var(--cascade-navy)]">
          Welkom, {session.user.name?.split(" ")[0] ?? "medewerker"}
        </h1>
        <p className="mb-8 text-[var(--cascade-muted)]">
          Kies een tool om mee aan de slag te gaan.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              target={tool.external ? "_blank" : undefined}
              rel={tool.external ? "noopener noreferrer" : undefined}
              className="group flex flex-col rounded-xl border border-[var(--cascade-navy)]/10 bg-white p-5 shadow-sm transition-all hover:border-[var(--cascade-navy)]/30 hover:shadow-md"
            >
              <span className="mb-3 text-3xl">{tool.icon}</span>
              <h2 className="font-semibold text-[var(--cascade-navy)] group-hover:text-[var(--cascade-blue)]">
                {tool.label}
              </h2>
              <p className="mt-1 text-sm text-[var(--cascade-muted)]">
                {tool.description}
              </p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
