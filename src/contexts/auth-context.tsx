"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client" // Client-side Supabase client
import type { User, Session } from "@supabase/supabase-js"
import { AuthEnhancedService } from "@/lib/services/auth-enhanced" // Your enhanced auth service
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { RegisterData } from "@/lib/services/auth-enhanced" // Import RegisterData type

// Interfaz para las respuestas de autenticación
interface AuthResult {
  success: boolean
  error?: string | { message: string } // Allow error to be string or object with message
  message?: string
  data?: any
  user?: User // Add user property for successful sign-up/sign-in
  needsEmailConfirmation?: boolean
  profile?: any // Add profile property for successful sign-in
}

// Interfaz del contexto de autenticación
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  mounted: boolean
  isAuthenticated: boolean
  profile: any | null
  isAdmin: boolean // Added isAdmin property
  register: (data: RegisterData) => Promise<AuthResult> // Renamed from signUp to register
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  requestPasswordReset: (email: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
  updateProfile: (userData: any) => Promise<AuthResult>
  refreshSession: () => Promise<AuthResult>
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Initial state is true
  const [mounted, setMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false) // New state for admin status
  const router = useRouter()
  const supabase = createClient() // Client-side Supabase client

  const authService = new AuthEnhancedService(supabase) // Corrected: Pass supabase to constructor

  // Function to check admin role
  const checkAdminRole = useCallback(
    async (userId: string) => {
      console.log("AuthContext: [checkAdminRole] Checking admin role for user ID:", userId)
      try {
        const { data, error } = await supabase.from("user_profiles").select("role").eq("id", userId).single()

        if (error) {
          console.error("AuthContext: [checkAdminRole] Error fetching user role:", error)
          setIsAdmin(false)
          return
        }
        console.log("AuthContext: [checkAdminRole] User role data:", data)
        setIsAdmin(data?.role === "admin" || data?.role === "super_admin") // Check for both admin and super_admin
      } catch (error) {
        console.error("AuthContext: [checkAdminRole] Unexpected error checking admin role:", error)
        setIsAdmin(false)
      }
    },
    [supabase],
  )

  const getInitialSession = useCallback(async () => {
    console.log("AuthContext: [getInitialSession] Calling supabase.auth.getSession()...")
    try {
      const {
        data: { session: initialSession },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("AuthContext: [getInitialSession] Error getting initial session:", error)
        setSession(null)
        setUser(null)
      } else {
        console.log("AuthContext: [getInitialSession] Initial session data received:", initialSession)
        setSession(initialSession)
        setUser(initialSession?.user || null)
        if (initialSession?.user) {
          await checkAdminRole(initialSession.user.id)
        } else {
          setIsAdmin(false)
        }
      }
    } catch (err) {
      console.error("AuthContext: [getInitialSession] Unexpected error:", err)
      setSession(null)
      setUser(null)
      setIsAdmin(false)
    } finally {
      // This is crucial: ensure isLoading is set to false regardless of success or failure
      setIsLoading(false)
      setMounted(true) // Set mounted to true after initial load
      console.log("AuthContext: [getInitialSession] finished, setting isLoading to false.")
    }
  }, [supabase, checkAdminRole])

  useEffect(() => {
    console.log("AuthContext: [useEffect] mounted, starting initial session check.")
    getInitialSession() // Call the memoized function

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("AuthContext: [onAuthStateChange] event:", event, "Session:", currentSession)
      setSession(currentSession)
      setUser(currentSession?.user || null)
      setIsLoading(false) // Ensure loading is false after any auth state change

      if (currentSession?.user) {
        checkAdminRole(currentSession.user.id) // Don't await here, let it run in background
      } else {
        setIsAdmin(false)
      }

      if (event === "SIGNED_OUT") {
        router.push("/login") // Redirect to login on sign out
      }
      // Manejar eventos específicos
      switch (event) {
        case "SIGNED_IN":
          toast.success("Sesión iniciada exitosamente")
          break
        case "SIGNED_OUT":
          toast.success("Sesión cerrada exitosamente")
          break
        case "PASSWORD_RECOVERY":
          toast.info("Revisa tu email para restablecer tu contraseña")
          break
        case "USER_UPDATED":
          toast.success("Perfil actualizado exitosamente")
          break
      }
    })

    return () => {
      console.log("AuthContext: [useEffect] cleanup, unsubscribing from auth state changes.")
      // Corrected: Access unsubscribe on the subscription object
      authListener?.subscription?.unsubscribe()
    }
  }, [getInitialSession, router, supabase, checkAdminRole])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true) // Set loading true when sign-in starts
      const result = await authService.signIn(email, password) // Corrected: authService.signIn
      if (!result.error && result.user) {
        // Check for result.user instead of result.data?.session
        setSession(result.data?.session || null) // Session might be in result.data.session
        setUser(result.user)
        if (result.user) {
          await checkAdminRole(result.user.id)
        }
      }
      setIsLoading(false) // Set loading false when sign-in finishes
      return result
    },
    [authService, checkAdminRole],
  )

  const register = useCallback(
    // Renamed from signUp to register
    async (data: RegisterData) => {
      // Use RegisterData type
      setIsLoading(true) // Set loading true when sign-up starts
      const result = await authService.register(data) // Call register method
      // The register method in AuthEnhancedService returns `user` and `needsEmailConfirmation`, not `session` directly.
      // The `onAuthStateChange` listener will pick up the session if it's immediately available (e.g., no email confirmation needed)
      // or when the user signs in after confirming their email.
      if (!result.error && result.user) {
        setUser(result.user) // Set the user object
        // No need to set session here, onAuthStateChange will handle it if present
        // No need to check admin role immediately after register, as user might not be signed in yet
      }
      setIsLoading(false) // Set loading false when sign-up finishes
      return result
    },
    [authService], // checkAdminRole is not needed here as user might not be signed in yet
  )

  const signOut = useCallback(async () => {
    setIsLoading(true) // Set loading true when sign-out starts
    const result = await authService.signOut() // Corrected: authService.signOut
    if (!result.error) {
      setSession(null)
      setUser(null)
      setIsAdmin(false) // Reset admin status on sign out
    }
    setIsLoading(false) // Set loading false when sign-out finishes
    return result
  }, [authService])

  const requestPasswordReset = useCallback(
    async (email: string) => {
      try {
        setIsLoading(true)
        console.log("AuthContext: Requesting password reset for:", email)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
          console.error("AuthContext: Error requesting password reset:", error)
          return {
            success: false,
            error: error.message || "Error al solicitar reset de contraseña",
          }
        }

        console.log("AuthContext: Password reset email sent.")
        return {
          success: true,
          message: "Se ha enviado un email con las instrucciones para restablecer tu contraseña",
        }
      } catch (error) {
        console.error("AuthContext: Unexpected error requesting password reset:", error)
        return {
          success: false,
          error: "Error inesperado al solicitar reset de contraseña",
        }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        setIsLoading(true)
        console.log("AuthContext: Attempting to update password.")

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (error) {
          console.error("AuthContext: Error updating password:", error)
          return {
            success: false,
            error: error.message || "Error al actualizar contraseña",
          }
        }

        console.log("AuthContext: Password updated successfully.")
        return {
          success: true,
          message: "Contraseña actualizada exitosamente",
        }
      } catch (error) {
        console.error("AuthContext: Unexpected error updating password:", error)
        return {
          success: false,
          error: "Error inesperado al actualizar contraseña",
        }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  const updateProfile = useCallback(
    async (userData: any) => {
      try {
        setIsLoading(true)
        console.log("AuthContext: Attempting to update profile:", userData)

        const { error } = await supabase.auth.updateUser({
          data: userData,
        })

        if (error) {
          console.error("AuthContext: Error updating profile:", error)
          return {
            success: false,
            error: error.message || "Error al actualizar perfil",
          }
        }

        console.log("AuthContext: Profile updated successfully.")
        return {
          success: true,
          message: "Perfil actualizado exitosamente",
        }
      } catch (error) {
        console.error("AuthContext: Unexpected error updating profile:", error)
        return {
          success: false,
          error: "Error inesperado al actualizar perfil",
        }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("AuthContext: Attempting to refresh session.")

      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("AuthContext: Error refreshing session:", error)
        return {
          success: false,
          error: error.message || "Error al refrescar sesión",
        }
      }

      console.log("AuthContext: Session refreshed successfully.")
      return {
        success: true,
        message: "Sesión refrescada exitosamente",
        data: {
          user: data.user,
          session: data.session,
        },
      }
    } catch (error) {
      console.error("AuthContext: Unexpected error refreshing session:", error)
      return {
        success: false,
        error: "Error inesperado al refrescar sesión",
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const isAuthenticated = !!user

  const value = {
    user,
    session,
    isLoading,
    mounted,
    isAuthenticated,
    profile: user?.user_metadata || null,
    isAdmin, // Expose isAdmin
    register, // Expose register instead of signUp
    signIn,
    signOut,
    requestPasswordReset,
    updatePassword,
    updateProfile,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

// Exportar el contexto para casos especiales
export { AuthContext }
