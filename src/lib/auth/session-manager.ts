import { createClient } from "@supabase/supabase-js"

export class SessionManager {
  private static getSupabaseClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  static async getCurrentSession() {
    try {
      const supabase = this.getSupabaseClient()
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        return null
      }

      // Verificar si la sesión está próxima a expirar
      if (session && this.isSessionNearExpiry(session)) {
        await this.refreshSession()
      }

      return session
    } catch (error) {
      console.error("Error in getCurrentSession:", error)
      return null
    }
  }

  static async refreshSession() {
    try {
      const supabase = this.getSupabaseClient()
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)
        return null
      }

      return data.session
    } catch (error) {
      console.error("Error in refreshSession:", error)
      return null
    }
  }

  static isSessionNearExpiry(session: any): boolean {
    if (!session?.expires_at) return false

    const expiryTime = new Date(session.expires_at).getTime()
    const now = Date.now()

    return expiryTime - now < 5 * 60 * 1000 // 5 minutes
  }

  static async invalidateSession() {
    try {
      const supabase = this.getSupabaseClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error invalidating session:", error)
    }
  }

  static async logSecurityEvent(userId: string, event: string, details: Record<string, any>) {
    try {
      const supabase = this.getSupabaseClient()

      await supabase.from("security_logs").insert({
        user_id: userId,
        event_type: event,
        details,
        ip_address: details.ip,
        user_agent: details.userAgent,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error logging security event:", error)
    }
  }
}
