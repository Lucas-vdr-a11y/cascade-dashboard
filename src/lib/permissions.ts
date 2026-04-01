/**
 * Alle beschikbare permissions in het Cascade ecosysteem.
 */
export const ALL_PERMISSIONS = [
  // Beheer
  { id: 'users:manage', label: 'Gebruikersbeheer', group: 'Beheer', description: 'Gebruikers aanmaken, bewerken en verwijderen' },
  { id: 'roles:manage', label: 'Rollenbeheer', group: 'Beheer', description: 'Rollen aanmaken en bewerken' },
  { id: 'settings:manage', label: 'Instellingen', group: 'Beheer', description: 'App-instellingen wijzigen' },

  // VaarPlanner
  { id: 'planner:edit', label: 'Planner bewerken', group: 'VaarPlanner', description: 'Plattegronden indelen en tafels toewijzen' },
  { id: 'planner:view', label: 'Planner bekijken', group: 'VaarPlanner', description: 'Plattegronden en reserveringen inzien' },
  { id: 'ships:manage', label: 'Schepen beheren', group: 'VaarPlanner', description: 'Schepen, dekken en tafels configureren' },
  { id: 'kitchen:view', label: 'Keukenlijst', group: 'VaarPlanner', description: 'Keukenlijst bekijken en printen' },

  // QR Scanner
  { id: 'scan:use', label: 'Scanner gebruiken', group: 'QR Scanner', description: 'QR codes scannen en gasten inchecken' },
  { id: 'scan:settle', label: 'Afrekenen', group: 'QR Scanner', description: 'Betalingen registreren op de kassa' },
  { id: 'scan:history', label: 'Scangeschiedenis', group: 'QR Scanner', description: 'Scan- en betalingsgeschiedenis bekijken' },

  // Werkenbij
  { id: 'content:manage', label: 'Content beheren', group: 'Werkenbij', description: 'Vacatures, blog en pagina\'s bewerken' },
  { id: 'content:view', label: 'Content bekijken', group: 'Werkenbij', description: 'Dashboard en sollicitaties inzien' },

  // Cadeaubon
  { id: 'cadeaubon:manage', label: 'Cadeaubonnen beheren', group: 'Cadeaubon', description: 'Cadeaubonnen, arrangementen en instellingen' },

  // Personeelsplanner
  { id: 'planning:view', label: 'Planning bekijken', group: 'Personeelsplanner', description: 'Personeelsplanning en roosters inzien' },
  { id: 'planning:edit', label: 'Planning bewerken', group: 'Personeelsplanner', description: 'Planning goedkeuren en naar SEM schrijven' },
  { id: 'planning:manage', label: 'Planning beheren', group: 'Personeelsplanner', description: 'Bezettingsregels en instellingen wijzigen' },
] as const;

export type Permission = typeof ALL_PERMISSIONS[number]['id'];

export const PERMISSION_GROUPS = [...new Set(ALL_PERMISSIONS.map(p => p.group))];

/** Standaard systeem rollen */
export const SYSTEM_ROLES = {
  admin: {
    name: 'Admin',
    description: 'Volledige toegang tot alle tools en instellingen',
    permissions: ALL_PERMISSIONS.map(p => p.id),
  },
  kantoor: {
    name: 'Kantoor',
    description: 'Toegang tot planning, content en beheer',
    permissions: [
      'planner:edit', 'planner:view', 'ships:manage', 'kitchen:view',
      'scan:use', 'scan:settle', 'scan:history',
      'content:manage', 'content:view',
      'cadeaubon:manage',
      'planning:view', 'planning:edit',
      'settings:manage',
    ],
  },
  medewerker: {
    name: 'Medewerker',
    description: 'Basis toegang voor medewerkers op de boot',
    permissions: [
      'planner:view', 'kitchen:view',
      'scan:use', 'scan:settle', 'scan:history',
      'content:view',
    ],
  },
};

export function getEffectivePermissions(
  rolePermissions: string[],
  userOverrides: string[]
): string[] {
  const permissions = new Set([...rolePermissions, ...userOverrides]);
  return [...permissions];
}

export function hasPermission(permissions: string[], required: Permission): boolean {
  return permissions.includes(required);
}
