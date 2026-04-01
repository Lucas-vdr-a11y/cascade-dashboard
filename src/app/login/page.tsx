"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAction } from "./actions";

function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("callbackUrl", callbackUrl);
    const result = await loginAction(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-8" style={{ backgroundColor: "var(--cascade-navy)" }}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60rem] h-[60rem] rounded-full blur-[100px]" style={{ backgroundColor: "rgba(29,85,119,0.2)" }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full blur-[100px]" style={{ backgroundColor: "rgba(180,146,83,0.1)" }} />
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z" fill="var(--cascade-gold)" fillOpacity="0.08" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <span className="text-5xl">⚓</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: "var(--cascade-navy)" }}>
              Cascade Dashboard
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--cascade-muted)" }}>
              Intern portaal — Rederij Cascade
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--cascade-navy)" }}>
                E-mailadres
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="naam@rederijcascade.nl"
                className="w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{ borderColor: "rgba(9,45,97,0.2)", color: "var(--cascade-navy)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--cascade-navy)" }}>
                Wachtwoord
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{ borderColor: "rgba(9,45,97,0.2)", color: "var(--cascade-navy)" }}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50 mt-1"
              style={{ backgroundColor: "var(--cascade-gold)" }}
            >
              {loading ? "Bezig..." : "Inloggen"}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(9,45,97,0.1)" }} />
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cascade-muted)" }}>
              Rederij Cascade
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(9,45,97,0.1)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
