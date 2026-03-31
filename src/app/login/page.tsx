"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Ongeldig e-mailadres of wachtwoord.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cascade-cream)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--cascade-navy)]/10 bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--cascade-navy)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.13-.53.13s-.37-.04-.53-.13l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.13.53-.13s.37.04.53.13l7.9 4.44c.32.17.53.5.53.88v9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--cascade-navy)]">
            Cascade Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--cascade-muted)]">
            Intern portaal — Rederij Cascade
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[var(--cascade-navy)]"
            >
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--cascade-navy)]/20 px-3 py-2 text-sm outline-none focus:border-[var(--cascade-navy)] focus:ring-2 focus:ring-[var(--cascade-navy)]/10"
              placeholder="naam@rederijcascade.nl"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[var(--cascade-navy)]"
            >
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--cascade-navy)]/20 px-3 py-2 text-sm outline-none focus:border-[var(--cascade-navy)] focus:ring-2 focus:ring-[var(--cascade-navy)]/10"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--cascade-navy)] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Bezig…" : "Inloggen"}
          </button>
        </form>
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
