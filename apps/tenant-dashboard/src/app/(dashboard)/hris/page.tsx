"use client";
import { Can } from "@/components/Can";
import DashboardTemplate from "@/components/DashboardTemplate";
import { useRole } from "@/components/RoleProvider";

export default function HRIS() {
  const { role } = useRole();

  return (
    <DashboardTemplate 
      module="hris" 
      title="Human Resources Information System" 
      description="Track attendance, payroll, and benefits for the LGU workforce."
    >
      <div className="dashboard-card">
        <h3 className="card-title">Attendance</h3>
        <p className="card-content">Monitor daily time records and leave balances for all employees.</p>
      </div>

      <Can module="hris" action="read">
        <div className="dashboard-card">
          <h3 className="card-title">Workforce Analytics</h3>
          <p className="card-content">Review overall staffing costs, turnover rates, and departmental budgets.</p>
        </div>
      </Can>

      {role === "audit" && (
        <div className="dashboard-card">
          <h3 className="card-title">Payroll Verification</h3>
          <p className="card-content">Cross-reference disbursed salaries against approved daily time records.</p>
        </div>
      )}
    </DashboardTemplate>
  );
}
