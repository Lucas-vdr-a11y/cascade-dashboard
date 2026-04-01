"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Wachtwoord moet minimaal 8 tekens zijn"); return; }
    if (password !== confirm) { setError("Wachtwoorden komen niet overeen"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Er ging iets mis");
      else setDone(true);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>Ongeldige link</h2>
        <p className="text-sm" style={{ color: "var(--cascade-muted)" }}>Vraag een nieuwe uitnodiging aan bij de beheerder.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(166,203,166,0.2)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#586C56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>Wachtwoord ingesteld</h2>
        <p className="text-sm mb-6" style={{ color: "var(--cascade-muted)" }}>Je kunt nu inloggen.</p>
        <button onClick={() => router.push("/login")} className="px-6 py-3 text-white font-semibold rounded-xl transition-all hover:brightness-110" style={{ backgroundColor: "var(--cascade-gold)" }}>
          Naar inloggen
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
          Wachtwoord instellen
        </h2>
        <p className="text-sm mt-2" style={{ color: "var(--cascade-muted)" }}>
          Welkom! Stel een wachtwoord in om je account te activeren.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--cascade-navy)" }}>Wachtwoord</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
            style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream)" }}
            placeholder="Minimaal 8 tekens" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--cascade-navy)" }}>Bevestig wachtwoord</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
            style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream)" }}
            placeholder="Herhaal wachtwoord" />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 text-white font-semibold rounded-xl shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
          style={{ backgroundColor: "var(--cascade-gold)" }}>
          {loading ? "Instellen..." : "Wachtwoord instellen"}
        </button>
      </form>
    </>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-8" style={{ backgroundColor: "var(--cascade-navy)" }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60rem] h-[60rem] rounded-full blur-[100px]" style={{ backgroundColor: "rgba(29,85,119,0.2)" }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full blur-[100px]" style={{ backgroundColor: "rgba(180,146,83,0.1)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <img src="/images/cascade-logo-white.svg" alt="Cascade" className="h-14 w-auto" />
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <Suspense>
            <InviteContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
