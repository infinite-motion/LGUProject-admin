"use client";

import { BarChart2 } from "lucide-react";

export default function Dashboard() {

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Overview</h1>
        <p className="text-text-secondary mt-1">Welcome back. Here is what&apos;s happening across your platform.</p>
      </div>

      {/* Placeholder State for Analytics */}
      <div className="flex flex-col items-center justify-center p-16 bg-surface border border-text-secondary/10 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-6">
          <BarChart2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Not enough data available</h3>
        <p className="text-text-secondary max-w-md mx-auto">
          We're currently collecting metrics and user activity. Once your platform gains more traction, this area will unlock advanced analytics, growth charts, and deep organizational insights.
        </p>
      </div>
    </div>
  );
}
