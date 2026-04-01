"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { updateProfile, changePassword } from "./actions";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  if (!session?.user) return null;

  async function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMsg(null);
    setLoading("profile");
    const fd = new FormData(e.currentTarget);
    const result = await updateProfile(fd);
    setLoading(null);
    if (result.error) {
      setProfileMsg({ type: "error", text: result.error });
    } else {
      setProfileMsg({ type: "success", text: "Naam bijgewerkt" });
      update();
    }
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPassMsg(null);
    setLoading("password");
    const fd = new FormData(e.currentTarget);
    const result = await changePassword(fd);
    setLoading(null);
    if (result.error) {
      setPassMsg({ type: "error", text: result.error });
    } else {
      setPassMsg({ type: "success", text: "Wachtwoord gewijzigd" });
      (e.target as HTMLFormElement).reset();
    }
  }

  const role = (session.user as any).role;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--cascade-cream)" }}>
      <header style={{ backgroundColor: "var(--cascade-navy)" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-4">
            <img src="/images/cascade-logo-white.svg" alt="Cascade" className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
            ← Terug naar dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-10">
        <h1 className="mb-8 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
          Mijn account
        </h1>

        {/* Profiel */}
        <div className="mb-6 rounded-2xl bg-white p-8 shadow-sm" style={{ border: "1px solid var(--cascade-border)" }}>
          <h2 className="mb-5 text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
            Profiel
          </h2>
          <form onSubmit={handleProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>Naam</label>
              <input
                name="name"
                defaultValue={session.user.name ?? ""}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream)" }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>E-mailadres</label>
              <input
                value={session.user.email ?? ""}
                disabled
                className="w-full rounded-xl px-4 py-3 text-sm opacity-60"
                style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream-dark)" }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>Rol</label>
              <input
                value={role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                disabled
                className="w-full rounded-xl px-4 py-3 text-sm opacity-60"
                style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream-dark)" }}
              />
            </div>
            {profileMsg && (
              <p className={`rounded-lg px-3 py-2 text-sm ${profileMsg.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {profileMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={loading === "profile"}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: "var(--cascade-gold)" }}
            >
              {loading === "profile" ? "Opslaan..." : "Opslaan"}
            </button>
          </form>
        </div>

        {/* Wachtwoord wijzigen */}
        <div className="rounded-2xl bg-white p-8 shadow-sm" style={{ border: "1px solid var(--cascade-border)" }}>
          <h2 className="mb-5 text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
            Wachtwoord wijzigen
          </h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>Huidig wachtwoord</label>
              <input
                name="currentPassword"
                type="password"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream)" }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>Nieuw wachtwoord</label>
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream)" }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>Bevestig nieuw wachtwoord</label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream)" }}
              />
            </div>
            {passMsg && (
              <p className={`rounded-lg px-3 py-2 text-sm ${passMsg.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {passMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={loading === "password"}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: "var(--cascade-navy)" }}
            >
              {loading === "password" ? "Wijzigen..." : "Wachtwoord wijzigen"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
