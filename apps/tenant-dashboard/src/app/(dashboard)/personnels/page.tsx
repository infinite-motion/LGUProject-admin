"use client";
import { Can } from "@/components/Can";
import DashboardTemplate from "@/components/DashboardTemplate";

export default function Personnels() {
  return (
    <DashboardTemplate 
      module="personnels" 
      title="Personnels Management" 
      description="Manage staff accounts, departments, and jurisdictional assignments."
    >
      <div className="dashboard-card">
        <h3 className="card-title">Staff Roster</h3>
        <p className="card-content">View the list of all registered personnel in the LGU.</p>
      </div>
      
      <Can module="personnels" action="update">
        <div className="dashboard-card" style={{ border: '2px solid var(--primary-color)' }}>
          <h3 className="card-title">Pending Approvals</h3>
          <p className="card-content">You have 4 new staff accounts pending initialization.</p>
          <button className="primary-button" style={{ marginTop: '1rem' }}>Review Approvals</button>
        </div>
      </Can>

      <Can module="personnels" action="update">
        <div className="dashboard-card">
          <h3 className="card-title">Access Roles</h3>
          <p className="card-content">Assign granular permissions (e.g., manage_hr, review_ordinance) to departments.</p>
          <button className="primary-button" style={{ marginTop: '1rem', background: 'var(--text-muted)' }}>Manage Roles</button>
        </div>
      </Can>
    </DashboardTemplate>
  );
}
