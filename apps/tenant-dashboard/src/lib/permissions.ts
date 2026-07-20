export type Role = "sysadmin" | "mayor" | "audit";

export type Module = "dashboard" | "personnels" | "hris";

export type Action = "create" | "read" | "update" | "delete";

export type RoleConfig = {
  [K in Module]?: Action[];
};

export const ROLE_ACCESS: Record<Role, RoleConfig> = {
  mayor: {
    dashboard: ["read"],
    personnels: ["read"],
    hris: ["read"],
  },
  sysadmin: {
    personnels: ["create", "read", "update", "delete"],
  },
  audit: {
    dashboard: ["read"],
    hris: ["read"],
  }
};

export const APP_TABS: { id: Module; label: string; href: string }[] = [
  { id: "dashboard", label: "Dashboard", href: "/" },
  { id: "personnels", label: "Personnels", href: "/personnels" },
  { id: "hris", label: "HRIS", href: "/hris" }
];

export function hasAccess(role: Role, module: Module, action: Action = "read"): boolean {
  const moduleConfig = ROLE_ACCESS[role][module];
  if (!moduleConfig) return false;
  return moduleConfig.includes(action);
}
