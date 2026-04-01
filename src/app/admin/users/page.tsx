"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        name: fd.get("name"),
        password: fd.get("password"),
        role: fd.get("role"),
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      setMsg({ type: "success", text: "Gebruiker aangemaakt" });
      fetchUsers();
    } else {
      const err = await res.json();
      setMsg({ type: "error", text: err.error });
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editUser) return;
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      role: fd.get("role") as string,
    };
    const pw = fd.get("password") as string;
    if (pw) body.password = pw;

    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setEditUser(null);
      setMsg({ type: "success", text: "Gebruiker bijgewerkt" });
      fetchUsers();
    } else {
      const err = await res.json();
      setMsg({ type: "error", text: err.error });
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`${user.name || user.email} verwijderen?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg({ type: "success", text: "Gebruiker verwijderd" });
      fetchUsers();
    } else {
      const err = await res.json();
      setMsg({ type: "error", text: err.error });
    }
  }

  const inputStyle = { border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream)" };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--cascade-cream)" }}>
      <header style={{ backgroundColor: "var(--cascade-navy)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-4">
            <img src="/images/cascade-logo-white.svg" alt="Cascade" className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
            ← Terug naar dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
            Gebruikersbeheer
          </h1>
          <button
            onClick={() => { setShowAdd(true); setEditUser(null); }}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
            style={{ backgroundColor: "var(--cascade-gold)" }}
          >
            + Nieuwe gebruiker
          </button>
        </div>

        {msg && (
          <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${msg.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {msg.text}
          </div>
        )}

        {/* Users tabel */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm" style={{ border: "1px solid var(--cascade-border)" }}>
          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--cascade-muted)" }}>Laden...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cascade-border)" }}>
                  <th className="px-6 py-4 font-semibold" style={{ color: "var(--cascade-navy)" }}>Naam</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: "var(--cascade-navy)" }}>Email</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: "var(--cascade-navy)" }}>Rol</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: "var(--cascade-navy)" }}>Aangemaakt</th>
                  <th className="px-6 py-4 font-semibold text-right" style={{ color: "var(--cascade-navy)" }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--cascade-border)" }} className="hover:bg-[var(--cascade-cream)] transition-colors">
                    <td className="px-6 py-4 font-medium" style={{ color: "var(--cascade-navy)" }}>{u.name || "—"}</td>
                    <td className="px-6 py-4" style={{ color: "var(--cascade-muted)" }}>{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--cascade-muted)" }}>
                      {new Date(u.createdAt).toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEditUser(u); setShowAdd(false); }} className="mr-3 text-sm font-medium hover:underline" style={{ color: "var(--cascade-blue)" }}>
                        Bewerken
                      </button>
                      <button onClick={() => handleDelete(u)} className="text-sm font-medium text-red-600 hover:underline">
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add / Edit Modal */}
        {(showAdd || editUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowAdd(false); setEditUser(null); }}>
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()} style={{ border: "1px solid var(--cascade-border)" }}>
              <h2 className="mb-6 text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
                {editUser ? "Gebruiker bewerken" : "Nieuwe gebruiker"}
              </h2>
              <form onSubmit={editUser ? handleEdit : handleAdd} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>Naam</label>
                  <input name="name" defaultValue={editUser?.name ?? ""} required className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>Email</label>
                  <input name="email" type="email" defaultValue={editUser?.email ?? ""} required className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>
                    Wachtwoord {editUser && <span className="font-normal text-xs" style={{ color: "var(--cascade-muted)" }}>(laat leeg om niet te wijzigen)</span>}
                  </label>
                  <input name="password" type="password" minLength={8} required={!editUser} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--cascade-navy)" }}>Rol</label>
                  <select name="role" defaultValue={editUser?.role ?? "ADMIN"} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle}>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110" style={{ backgroundColor: "var(--cascade-gold)" }}>
                    {editUser ? "Opslaan" : "Aanmaken"}
                  </button>
                  <button type="button" onClick={() => { setShowAdd(false); setEditUser(null); }} className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all" style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)" }}>
                    Annuleren
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
