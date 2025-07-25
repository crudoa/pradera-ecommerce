import { AdminAuthService } from "@/lib/auth/admin-auth"
import { AdminGuard } from "@/components/admin/admin-guard"
import type React from "react"

export default async function BulkUploadLayout({ children }: { children: React.ReactNode }) {
  const authStatus = await AdminAuthService.isCurrentUserAdmin()

  // Ensure user and error are explicitly null if undefined to match AdminGuardProps
  const initialAuthStatus = {
    isAdmin: authStatus.isAdmin,
    user: authStatus.user || null,
    error: authStatus.error || null,
  }

  return <AdminGuard initialAuthStatus={initialAuthStatus}>{children}</AdminGuard>
}
