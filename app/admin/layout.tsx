"use client";
import { Guard } from "@/components/layout/Guard";
import { AdminShell } from "@/components/layout/AdminShell";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard role="ADMIN">
      <AdminShell>{children}</AdminShell>
    </Guard>
  );
}
