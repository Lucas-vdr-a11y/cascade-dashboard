"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";

interface Role { id: string; name: string; permissions: string[]; isSystem: boolean }
interface User {
  id: string; email: string; name: string | null; passwordSet: boolean;
  apps: string[]; permissionOverrides: string[]; createdAt: string;
  customRole: { id: string; name: string; permissions: string[] } | null;
}

const APPS = [
  { id: "vaarplanner", label: "VaarPlanner" },
  { id: "werkenbij", label: "Werkenbij" },
  { id: "qrscan", label: "QR Scanner" },
  { id: "cadeaubon", label: "Cadeaubon" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "roles">("users");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function fetchData() {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setRoles(data.roles);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function showMessage(type: "success" | "error", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  // ── User CRUD ──

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const apps = APPS.map(a => a.id).filter(id => fd.get(`app-${id}`) === "on");
    const overrides = ALL_PERMISSIONS.map(p => p.id).filter(id => fd.get(`perm-${id}`) === "on");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        name: fd.get("name"),
        roleId: fd.get("roleId") || null,
        apps,
        overrides,
      }),
    });
    if (res.ok) {
      setShowAddUser(false);
      showMessage("success", "Gebruiker aangemaakt, uitnodiging verstuurd");
      fetchData();
    } else {
      const err = await res.json();
      showMessage("error", err.error);
    }
  }

  async function handleEditUser(e: React.FormEvent<HTMLFormElement>) {
    if (!editUser) return;
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const apps = APPS.map(a => a.id).filter(id => fd.get(`app-${id}`) === "on");
    const overrides = ALL_PERMISSIONS.map(p => p.id).filter(id => fd.get(`perm-${id}`) === "on");
    const pw = fd.get("password") as string;

    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        roleId: fd.get("roleId") || null,
        apps,
        overrides,
        ...(pw ? { password: pw } : {}),
      }),
    });
    if (res.ok) {
      setEditUser(null);
      showMessage("success", "Gebruiker bijgewerkt");
      fetchData();
    } else {
      const err = await res.json();
      showMessage("error", err.error);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`${user.name || user.email} verwijderen?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (res.ok) { showMessage("success", "Verwijderd"); fetchData(); }
    else { const err = await res.json(); showMessage("error", err.error); }
  }

  async function handleResendInvite(user: User) {
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "POST" });
    if (res.ok) showMessage("success", `Uitnodiging verstuurd naar ${user.email}`);
    else { const err = await res.json(); showMessage("error", err.error); }
  }

  // ── Role CRUD ──

  async function handleAddRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const permissions = ALL_PERMISSIONS.map(p => p.id).filter(id => fd.get(`rperm-${id}`) === "on");

    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), permissions }),
    });
    if (res.ok) { setShowAddRole(false); showMessage("success", "Rol aangemaakt"); fetchData(); }
    else { const err = await res.json(); showMessage("error", err.error); }
  }

  async function handleEditRole(e: React.FormEvent<HTMLFormElement>) {
    if (!editRole) return;
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const permissions = ALL_PERMISSIONS.map(p => p.id).filter(id => fd.get(`rperm-${id}`) === "on");

    const res = await fetch(`/api/admin/roles/${editRole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), permissions }),
    });
    if (res.ok) { setEditRole(null); showMessage("success", "Rol bijgewerkt"); fetchData(); }
    else { const err = await res.json(); showMessage("error", err.error); }
  }

  async function handleDeleteRole(role: Role) {
    if (!confirm(`Rol "${role.name}" verwijderen?`)) return;
    const res = await fetch(`/api/admin/roles/${role.id}`, { method: "DELETE" });
    if (res.ok) { showMessage("success", "Rol verwijderd"); fetchData(); }
    else { const err = await res.json(); showMessage("error", err.error); }
  }

  const inputStyle = { border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)", backgroundColor: "var(--cascade-cream)" };

  function UserForm({ onSubmit, user }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; user?: User | null }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--cascade-navy)" }}>Naam</label>
            <input name="name" defaultValue={user?.name ?? ""} required className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--cascade-navy)" }}>Email</label>
            <input name="email" type="email" defaultValue={user?.email ?? ""} required className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        {user && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--cascade-navy)" }}>
              Nieuw wachtwoord <span className="font-normal text-xs" style={{ color: "var(--cascade-muted)" }}>(optioneel)</span>
            </label>
            <input name="password" type="password" minLength={8} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--cascade-navy)" }}>Rol</label>
          <select name="roleId" defaultValue={user?.customRole?.id ?? ""} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            <option value="">Geen rol</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--cascade-navy)" }}>Apps</label>
          <div className="flex flex-wrap gap-3">
            {APPS.map(app => (
              <label key={app.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name={`app-${app.id}`} defaultChecked={user?.apps?.includes(app.id)} className="rounded" />
                {app.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--cascade-navy)" }}>Extra rechten (override)</label>
          <div className="space-y-3">
            {PERMISSION_GROUPS.map(group => (
              <div key={group}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--cascade-muted)" }}>{group}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {ALL_PERMISSIONS.filter(p => p.group === group).map(p => (
                    <label key={p.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" name={`perm-${p.id}`} defaultChecked={user?.permissionOverrides?.includes(p.id)} className="rounded" />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110" style={{ backgroundColor: "var(--cascade-gold)" }}>
            {user ? "Opslaan" : "Uitnodigen"}
          </button>
          <button type="button" onClick={() => { setShowAddUser(false); setEditUser(null); }} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)" }}>
            Annuleren
          </button>
        </div>
      </form>
    );
  }

  function RoleForm({ onSubmit, role }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; role?: Role | null }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--cascade-navy)" }}>Naam</label>
          <input name="name" defaultValue={role?.name ?? ""} required className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--cascade-navy)" }}>Rechten</label>
          <div className="space-y-3">
            {PERMISSION_GROUPS.map(group => (
              <div key={group}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--cascade-muted)" }}>{group}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {ALL_PERMISSIONS.filter(p => p.group === group).map(p => (
                    <label key={p.id} className="flex items-center gap-1.5 text-xs cursor-pointer" title={p.description}>
                      <input type="checkbox" name={`rperm-${p.id}`} defaultChecked={role?.permissions?.includes(p.id)} className="rounded" />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110" style={{ backgroundColor: "var(--cascade-gold)" }}>
            {role ? "Opslaan" : "Aanmaken"}
          </button>
          <button type="button" onClick={() => { setShowAddRole(false); setEditRole(null); }} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ border: "1px solid var(--cascade-border)", color: "var(--cascade-navy)" }}>
            Annuleren
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--cascade-cream)" }}>
      <header style={{ backgroundColor: "var(--cascade-navy)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-4">
            <img src="/images/cascade-logo-white.svg" alt="Cascade" className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-10">
        <h1 className="mb-6 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
          Gebruikersbeheer
        </h1>

        {msg && (
          <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${msg.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {msg.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--cascade-cream-dark)" }}>
          <button onClick={() => setTab("users")} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "users" ? "bg-white shadow-sm" : ""}`} style={{ color: "var(--cascade-navy)" }}>
            Gebruikers ({users.length})
          </button>
          <button onClick={() => setTab("roles")} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "roles" ? "bg-white shadow-sm" : ""}`} style={{ color: "var(--cascade-navy)" }}>
            Rollen ({roles.length})
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--cascade-muted)" }}>Laden...</div>
        ) : tab === "users" ? (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setShowAddUser(true); setEditUser(null); }} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110" style={{ backgroundColor: "var(--cascade-gold)" }}>
                + Nieuwe medewerker
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm" style={{ border: "1px solid var(--cascade-border)" }}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--cascade-border)" }}>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: "var(--cascade-navy)" }}>Naam</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: "var(--cascade-navy)" }}>Email</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: "var(--cascade-navy)" }}>Rol</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: "var(--cascade-navy)" }}>Apps</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: "var(--cascade-navy)" }}>Status</th>
                    <th className="px-5 py-3.5 font-semibold text-right" style={{ color: "var(--cascade-navy)" }}>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--cascade-border)" }} className="hover:bg-[var(--cascade-cream)]/50 transition-colors">
                      <td className="px-5 py-3 font-medium" style={{ color: "var(--cascade-navy)" }}>{u.name || "—"}</td>
                      <td className="px-5 py-3" style={{ color: "var(--cascade-muted)" }}>{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: "var(--cascade-cream-dark)", color: "var(--cascade-navy)" }}>
                          {u.customRole?.name || "Geen"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {u.apps.map(a => (
                            <span key={a} className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "var(--cascade-cream-dark)", color: "var(--cascade-muted)" }}>
                              {APPS.find(app => app.id === a)?.label || a}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {u.passwordSet ? (
                          <span className="text-xs font-medium text-green-600">Actief</span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">Uitgenodigd</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button onClick={() => { setEditUser(u); setShowAddUser(false); }} className="mr-2 text-xs font-medium hover:underline" style={{ color: "var(--cascade-blue)" }}>
                          Bewerken
                        </button>
                        {!u.passwordSet && (
                          <button onClick={() => handleResendInvite(u)} className="mr-2 text-xs font-medium hover:underline" style={{ color: "var(--cascade-gold)" }}>
                            Opnieuw uitnodigen
                          </button>
                        )}
                        <button onClick={() => handleDelete(u)} className="text-xs font-medium text-red-600 hover:underline">
                          Verwijderen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setShowAddRole(true); setEditRole(null); }} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110" style={{ backgroundColor: "var(--cascade-gold)" }}>
                + Nieuwe rol
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map(r => (
                <div key={r.id} className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid var(--cascade-border)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>{r.name}</h3>
                    {r.isSystem && <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700">Systeem</span>}
                  </div>
                  <p className="text-xs mb-3" style={{ color: "var(--cascade-muted)" }}>{r.permissions.length} rechten</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {r.permissions.slice(0, 6).map(p => (
                      <span key={p} className="rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: "var(--cascade-cream-dark)", color: "var(--cascade-muted)" }}>
                        {ALL_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                      </span>
                    ))}
                    {r.permissions.length > 6 && <span className="text-[10px]" style={{ color: "var(--cascade-muted)" }}>+{r.permissions.length - 6}</span>}
                  </div>
                  {!r.isSystem && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditRole(r); setShowAddRole(false); }} className="text-xs font-medium hover:underline" style={{ color: "var(--cascade-blue)" }}>Bewerken</button>
                      <button onClick={() => handleDeleteRole(r)} className="text-xs font-medium text-red-600 hover:underline">Verwijderen</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modals */}
        {(showAddUser || editUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowAddUser(false); setEditUser(null); }}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl" onClick={e => e.stopPropagation()} style={{ border: "1px solid var(--cascade-border)" }}>
              <h2 className="mb-5 text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
                {editUser ? "Gebruiker bewerken" : "Nieuwe medewerker uitnodigen"}
              </h2>
              <UserForm onSubmit={editUser ? handleEditUser : handleAddUser} user={editUser} />
            </div>
          </div>
        )}
        {(showAddRole || editRole) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowAddRole(false); setEditRole(null); }}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl" onClick={e => e.stopPropagation()} style={{ border: "1px solid var(--cascade-border)" }}>
              <h2 className="mb-5 text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--cascade-navy)" }}>
                {editRole ? "Rol bewerken" : "Nieuwe rol"}
              </h2>
              <RoleForm onSubmit={editRole ? handleEditRole : handleAddRole} role={editRole} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
