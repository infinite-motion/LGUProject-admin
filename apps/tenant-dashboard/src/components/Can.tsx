"use client";
import { ReactNode } from "react";
import { useRole } from "./RoleProvider";
import { Module, Action, hasAccess } from "@/lib/permissions";

interface CanProps {
  module: Module;
  action?: Action;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ module, action = "read", children, fallback = null }: CanProps) {
  const { role } = useRole();

  if (hasAccess(role, module, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
