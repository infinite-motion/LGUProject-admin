"use client";
import { Can } from "@/components/Can";
import DashboardTemplate from "@/components/DashboardTemplate";
import { useRole } from "@/components/RoleProvider";

export default function Dashboard() {
  const { role } = useRole();

  return (
    <DashboardTemplate 
      module="dashboard" 
      title="Dashboard Overview" 
      description="Welcome back! Here is what is happening across the LGU today."
    >
      <div className="dashboard-card">
        <h3 className="card-title">Executive Summary</h3>
        <p className="card-content">85% of citizen service applications processed this week. High satisfaction rating.</p>
      </div>
      <div className="dashboard-card">
        <h3 className="card-title">Active Applications</h3>
        <p className="card-content">245 pending cases across all departments. Average processing time: 2.4 days.</p>
      </div>

      {role === "audit" && (
        <div className="dashboard-card">
          <h3 className="card-title">Audit Logs</h3>
          <p className="card-content">Reviewing recent application approvals. 12 cases flagged for secondary verification.</p>
        </div>
      )}
    </DashboardTemplate>
  );
}
