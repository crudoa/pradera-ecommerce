import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  if (!supabaseClient) {
    console.log("Supabase Client: Initializing new browser client.")
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error(
        "Supabase Client: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
      )
      // You might want to throw an error or handle this more gracefully in a production app
      // For now, we'll proceed, but expect connection issues.
    }
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  } else {
    console.log("Supabase Client: Reusing existing browser client.")
  }
  return supabaseClient
}

export const supabase = createClient() // Export the singleton instance
