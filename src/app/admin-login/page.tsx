"use server"

import { cookies, headers } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { z } from "zod"
import { AuthenticationError, AppError, UnauthorizedError, RateLimitError } from "@/lib/errors/app-error"
import { apiRateLimiter, getClientIP } from "@/lib/security/rate-limiter"
import  log  from "@/lib/utils/logger"
import { loginSchema } from "@/lib/validations/forms" // Corrected import
import type { Database } from "@/types/database"
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Explicitly cast headers() to ReadonlyHeaders to resolve TS2322
  const requestHeaders: ReadonlyHeaders = headers() as unknown as ReadonlyHeaders
  const identifier = `admin_login_${email}_${getClientIP(requestHeaders)}`
  if (apiRateLimiter.isRateLimited(identifier)) {
    throw new RateLimitError("Too many login attempts. Please try again later.")
  }

  try {
    const validatedData = loginSchema.parse({ email, password })

    const supabase = createServerActionClient<Database>({ cookies })

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      log.warn("Admin login failed:", { email, error: error.message })
      apiRateLimiter.incrementAttempts(identifier)
      throw new AuthenticationError(error.message)
    }

    if (!data.user) {
      apiRateLimiter.incrementAttempts(identifier)
      throw new UnauthorizedError("Invalid credentials or user not found.")
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profileError || profile?.role !== "super_admin") {
      await supabase.auth.signOut()
      log.warn("Non-admin user attempted to access admin panel:", { userId: data.user.id, email })
      throw new UnauthorizedError("Access denied. Only administrators can log in here.")
    }

    apiRateLimiter.clearAttempts(identifier)
    redirect("/admin/orders") // Corrected: Redirect to /admin/orders
  } catch (error: any) {
    log.error("Error during admin login:", error)
    if (error instanceof z.ZodError) {
      throw new AppError("Validation failed: " + error.errors[0].message, 400)
    }
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError("An unexpected error occurred during login.", 500)
  }
}

export async function adminLogout() {
  const supabase = createServerActionClient<Database>({ cookies })
  await supabase.auth.signOut()
  redirect("/admin-login")
}
