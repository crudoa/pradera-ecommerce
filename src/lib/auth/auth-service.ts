import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"
import  log  from "@/lib/utils/logger"
import { AppError, AuthenticationError, UnauthorizedError } from "@/lib/errors/app-error"

/**
 * Client-side authentication service for user login, logout, and session management.
 * Uses Supabase client component client.
 */
class AuthService {
  private supabase: ReturnType<typeof createClientComponentClient<Database>>

  constructor() {
    this.supabase = createClientComponentClient<Database>()
  }

  /**
   * Logs in a user with email and password.
   * @param email - User's email.
   * @param password - User's password.
   * @returns The user session data.
   * @throws AuthenticationError if login fails.
   * @throws AppError for other unexpected errors.
   */
  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        log.warn("Login failed:", { email, error: error.message })
        throw new AuthenticationError(error.message)
      }

      if (!data.session) {
        throw new UnauthorizedError("No session returned after login.")
      }

      log.info("User logged in successfully:", { userId: data.user?.id, email })
      return data.session
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      log.error("Unexpected error during login:", error)
      throw new AppError("An unexpected error occurred during login.", 500)
    }
  }

  /**
   * Logs out the current user.
   * @throws AppError if logout fails.
   */
  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        log.error("Logout failed:", error)
        throw new AppError(error.message, 500)
      }
      log.info("User logged out successfully.")
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      log.error("Unexpected error during logout:", error)
      throw new AppError("An unexpected error occurred during logout.", 500)
    }
  }

  /**
   * Retrieves the current user session.
   * @returns The current session or null if no session exists.
   * @throws AppError for unexpected errors.
   */
  async getSession() {
    try {
      const { data, error } = await this.supabase.auth.getSession()
      if (error) {
        log.error("Error getting session:", error)
        throw new AppError(error.message, 500)
      }
      return data.session
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      log.error("Unexpected error during getSession:", error)
      throw new AppError("An unexpected error occurred while fetching session.", 500)
    }
  }

  /**
   * Retrieves the current authenticated user.
   * @returns The current user or null if no user is authenticated.
   * @throws AppError for unexpected errors.
   */
  async getUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser()
      if (error) {
        log.error("Error getting user:", error)
        throw new AppError(error.message, 500)
      }
      return data.user
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      log.error("Unexpected error during getUser:", error)
      throw new AppError("An unexpected error occurred while fetching user.", 500)
    }
  }
}

// Export a singleton instance of the AuthService
const authService = new AuthService()
export default authService
