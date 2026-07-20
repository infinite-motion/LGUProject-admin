"use client";
import { useRole, Role } from "./RoleProvider";

export default function Topbar() {
  const { role, setRole } = useRole();
  const roles: Role[] = ["sysadmin", "mayor", "audit"];

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h3>Portal Workspace</h3>
      </div>
      <div className="role-switcher">
        <span className="role-label">Simulate Role:</span>
        <div className="role-segments">
          {roles.map((r) => (
            <button
              key={r}
              className={`role-btn ${role === r ? "active" : ""}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
