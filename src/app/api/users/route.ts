import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { AdminAuthService } from "@/lib/auth/admin-auth"
import  log  from "@/lib/utils/logger"
import { apiRateLimiter, getClientIP, createRateLimitResponse } from "@/lib/security/rate-limiter"
import { AppError, ValidationError } from "@/lib/utils/error-handler" // Corrected import path
import type { Database } from "@/types/database"

// Helper function to create Supabase client for route handlers
const getSupabaseRouteHandlerClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}

// Zod schema for user creation
const userCreateSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  full_name: z.string().min(3, "Full name is required."),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  role: z.enum(["user", "super_admin"]).default("user"),
})

// Zod schema for user update (includes id and makes password optional)
const userUpdateSchema = userCreateSchema.extend({
  id: z.string().uuid("Invalid user ID format."),
  password: z.string().min(6, "Password must be at least 6 characters long.").optional(),
})

export async function GET(req: NextRequest) {
  const identifier = await getClientIP(req.headers) // Added await
  if (apiRateLimiter.isRateLimited(identifier)) {
    return createRateLimitResponse(identifier, apiRateLimiter)
  }

  const supabase = getSupabaseRouteHandlerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isAdmin = await AdminAuthService.checkAdminRole(user.id, supabase)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
  }

  try {
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      log.error("Error fetching users:", error)
      throw new AppError("Error fetching users", 500, "USER_FETCH_ERROR", { originalError: error })
    }

    return NextResponse.json(users, { status: 200 })
  } catch (error: any) {
    log.error("Unhandled error in GET /api/users:", error)
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const identifier = await getClientIP(req.headers) // Added await
  if (apiRateLimiter.isRateLimited(identifier)) {
    return createRateLimitResponse(identifier, apiRateLimiter)
  }

  const supabase = getSupabaseRouteHandlerClient()

  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser()

  // Only super_admin can create new users via this API route
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const isAdmin = await AdminAuthService.checkAdminRole(adminUser.id, supabase)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Only super_admin can create users" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const validatedData = userCreateSchema.parse(body)

    // Create user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.full_name,
          phone: validatedData.phone,
          address: validatedData.address,
          role: validatedData.role,
        },
      },
    })

    if (authError) {
      log.error("Error creating user in auth:", authError)
      throw new AppError(authError.message, 400, "AUTH_USER_CREATION_ERROR", { originalError: authError })
    }

    if (!authData.user) {
      throw new AppError("User creation failed: No user data returned.", 500, "USER_CREATION_FAILED")
    }

    // Insert user profile
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        full_name: validatedData.full_name,
        phone: validatedData.phone,
        address: validatedData.address,
        role: validatedData.role,
      })
      .select()
      .single()

    if (profileError) {
      log.error("Error inserting user profile:", profileError)
      // If profile insertion fails, consider rolling back auth user creation if possible
      throw new AppError("Error creating user profile", 500, "PROFILE_CREATION_ERROR", { originalError: profileError })
    }

    return NextResponse.json(profileData, { status: 201 })
  } catch (error: any) {
    log.error("Unhandled error in POST /api/users:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.errors }, { status: 400 })
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const identifier = await getClientIP(req.headers) // Added await
  if (apiRateLimiter.isRateLimited(identifier)) {
    return createRateLimitResponse(identifier, apiRateLimiter)
  }

  const supabase = getSupabaseRouteHandlerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const isAdmin = await AdminAuthService.checkAdminRole(user.id, supabase)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
  }

  try {
    const body = await req.json()
    // Use the new userUpdateSchema for validation
    const validatedData = userUpdateSchema.parse(body)

    const { id, password, ...rest } = validatedData // Destructure id and password separately

    if (!id) {
      throw new ValidationError("User ID is required for update.")
    }

    // Update user profile in public.user_profiles table
    const { data, error } = await supabase.from("user_profiles").update(rest).eq("id", id).select().single()

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError("Perfil de usuario no encontrado.", 404, "USER_NOT_FOUND", { originalError: error })
      }
      if (error.code === "23505") {
        throw new AppError("Ya existe otro usuario con el mismo email.", 409, "EMAIL_CONFLICT", {
          originalError: error,
        })
      }
      log.error("Error updating user profile:", error)
      throw new AppError("Error al actualizar perfil de usuario", 500, "USER_UPDATE_ERROR", { originalError: error })
    }

    // Optionally update user's password in auth.users table if provided
    if (password) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        password: password,
      })
      if (authUpdateError) {
        log.error("Error updating user password in auth:", authUpdateError)
        // Decide how to handle this: either rollback profile update or just log
        // For now, we'll just log and proceed with profile update success
        throw new AppError("Error updating user password.", 500, "AUTH_PASSWORD_UPDATE_ERROR", {
          originalError: authUpdateError,
        })
      }
    }

    if (!data) {
      throw new AppError("Perfil de usuario no encontrado.", 404, "USER_NOT_FOUND")
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    log.error("Unhandled error in PUT /api/users:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.errors }, { status: 400 })
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const identifier = await getClientIP(req.headers) // Added await
  if (apiRateLimiter.isRateLimited(identifier)) {
    return createRateLimitResponse(identifier, apiRateLimiter)
  }

  const supabase = getSupabaseRouteHandlerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const isAdmin = await AdminAuthService.checkAdminRole(user.id, supabase)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { id } = body // Assuming ID is passed in the body for DELETE

    if (!id) {
      throw new ValidationError("User ID is required for deletion.")
    }

    const { error } = await supabase.from("user_profiles").delete().eq("id", id)

    if (error) {
      log.error("Error deleting user profile:", error)
      throw new AppError("Error al eliminar perfil de usuario", 500, "USER_DELETION_ERROR", { originalError: error })
    }

    return NextResponse.json({ message: "User profile deleted successfully" }, { status: 200 })
  } catch (error: any) {
    log.error("Unhandled error in DELETE /api/users:", error)
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message, issues: error.context?.issues }, { status: error.statusCode })
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
