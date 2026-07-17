"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Overview</h1>
        <p className="text-text-secondary mt-1">Welcome back. Here is what's happening across your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-2xl p-6 border border-text-secondary/10 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-text-secondary text-sm font-medium">Total Tenants</h3>
          <p className="text-3xl font-bold text-foreground mt-2">12</p>
          <div className="mt-2 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full inline-block">+2 this month</div>
        </div>
        
        <div className="bg-surface rounded-2xl p-6 border border-text-secondary/10 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-text-secondary text-sm font-medium">Active Users</h3>
          <p className="text-3xl font-bold text-foreground mt-2">1,248</p>
          <div className="mt-2 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full inline-block">+14% vs last week</div>
        </div>
        
        <div className="bg-surface rounded-2xl p-6 border border-text-secondary/10 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-text-secondary text-sm font-medium">System Health</h3>
          <p className="text-3xl font-bold text-foreground mt-2">99.9%</p>
          <div className="mt-2 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full inline-block">All systems operational</div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-text-secondary/10 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-text-secondary/10">
          <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
        </div>
        <div className="p-6 text-center text-text-secondary">
          No recent activity to display.
        </div>
      </div>
    </div>
  );
}
