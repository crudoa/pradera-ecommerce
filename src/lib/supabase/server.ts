import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"
import { env } from "@/lib/config/env" // Import the validated environment variables

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have enabled the Next.js Middleware or modified
          // your Server Component / API route to not call `set` directly.
          console.warn("Failed to set cookie:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have enabled the Next.js Middleware or modified
          // your Server Component / API route to not call `delete` directly.
          console.warn("Failed to remove cookie:", error)
        }
      },
    },
  })
}

export async function createServiceRoleClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY, // Use the service role key here
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.warn("Failed to set cookie with service role client:", error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            console.warn("Failed to remove cookie with service role client:", error)
          }
        },
      },
    },
  )
}

// Helper function to get the current user from Supabase session
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper function to get the user profile from the 'user_profiles' table
export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data: userProfile, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()
  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
  return userProfile
}
