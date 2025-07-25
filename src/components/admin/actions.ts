"use server"

import { AdminAuthService } from "@/lib/auth/admin-auth"
import type { AdminUser } from "@/lib/auth/admin-auth" // Import AdminUser type

/**
 * Server Action to check the current user's admin status.
 * This function runs on the server and can safely use server-only APIs.
 */
export async function checkAdminStatus(): Promise<{ isAdmin: boolean; user: AdminUser | null; error: string | null }> {
  try {
    const { isAdmin, user, error } = await AdminAuthService.isCurrentUserAdmin()
    // Ensure user and error are null if undefined, to match the return type
    return { isAdmin, user: user || null, error: error || null }
  } catch (err: any) {
    console.error("Error in checkAdminStatus server action:", err)
    return { isAdmin: false, user: null, error: err.message || "Error checking admin status" }
  }
}

/**
 * Server Action to log administrative activity.
 * This function runs on the server.
 */
export async function logAdminActivity(
  activityType: string,
  resource: string,
  details: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    await AdminAuthService.logActivity(activityType, resource, details)
    return { success: true, error: null }
  } catch (err: any) {
    console.error("Error logging admin activity in server action:", err)
    return { success: false, error: err.message || "Failed to log activity" }
  }
}
