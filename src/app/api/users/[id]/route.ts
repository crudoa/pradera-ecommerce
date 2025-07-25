import { NextResponse } from "next/server"
import { createClient, getUser, getUserProfile } from "@/lib/supabase/server" // Corrected import
import { z } from "zod"

// Zod schema for user update
const updateUserSchema = z.object({
  full_name: z.string().min(1, "Full name is required").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["user", "super_admin"]).optional(),
  email: z.string().email().optional(), // Added email field
})

export async function GET(request: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const requestingUser = await getUser()

    if (!requestingUser) {
      throw new Error("Unauthorized")
    }

    const requestingUserProfile = await getUserProfile(requestingUser.id)

    // Only super_admins can view any user's profile, or a user can view their own
    if (requestingUserProfile?.role !== "super_admin" && requestingUser.id !== params.id) {
      throw new Error("Forbidden")
    }

    const supabase = await createClient() // Use createClient here
 // Use createClient here
    const { data: userProfile, error } = await supabase.from("user_profiles").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Supabase error fetching user profile:", error)
      throw new Error("Internal Server Error")
    }

    if (!userProfile) {
      throw new Error("User not found")
    }

    return NextResponse.json(userProfile, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error instanceof Error ? 401 : 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const requestingUser = await getUser()

    if (!requestingUser) {
      throw new Error("Unauthorized")
    }

    const requestingUserProfile = await getUserProfile(requestingUser.id)

    // Only super_admins can update any user's profile, or a user can update their own
    if (requestingUserProfile?.role !== "super_admin" && requestingUser.id !== params.id) {
      throw new Error("Forbidden")
    }

    const body = await request.json()
    const validation = updateUserSchema.safeParse(body)

    if (!validation.success) {
      throw new Error("Validation Error")
    }

    const updates = validation.data

    const supabase = await createClient() // Use createClient here
 // Use createClient here

    const { data: updatedProfile, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single()

    if (error) {
      console.error("Supabase error updating user profile:", error)
      throw new Error("Internal Server Error")
    }

    if (!updatedProfile) {
      throw new Error("User not found or update failed")
    }

    return NextResponse.json(updatedProfile, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error instanceof Error ? 400 : 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const requestingUser = await getUser()

    if (!requestingUser) {
      throw new Error("Unauthorized")
    }

    const requestingUserProfile = await getUserProfile(requestingUser.id)

    // Only super_admins can delete users
    if (requestingUserProfile?.role !== "super_admin") {
      throw new Error("Forbidden")
    }

    // Prevent a super_admin from deleting themselves
    if (requestingUser.id === params.id) {
      throw new Error("Cannot delete your own admin account")
    }

    const supabase = await createClient() // Use createClient here
 // Use createClient here

    // First, delete the user from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(params.id)

    if (authDeleteError) {
      console.error("Supabase auth delete error:", authDeleteError)
      throw new Error("Internal Server Error")
    }

    // The user_profiles table should have a foreign key with ON DELETE CASCADE
    // to automatically delete the profile when the auth user is deleted.
    // If not, you would need to explicitly delete from user_profiles here as well.
    // For now, assuming CASCADE is set up.

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Unexpected error in DELETE /api/users/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
