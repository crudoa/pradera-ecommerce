import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { productDataSchema, productUpdateSchema } from "@/lib/validations/product-schemas"
import { z } from "zod"
import { AdminAuthService } from "@/lib/auth/admin-auth" // Import AdminAuthService

export async function POST(request: Request) {
  const supabase = await createClient() // Added await
  const { isAdmin, error: authError } = await AdminAuthService.isCurrentUserAdmin() // Use AdminAuthService

  console.log("POST /api/admin/products: Is user admin?", isAdmin)
  if (!isAdmin) {
    console.log("POST /api/admin/products: Unauthorized access attempt.", authError)
    return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const productData = productDataSchema.parse(body)

    const { data, error } = await supabase.from("products").insert([productData]).select()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues)
      return NextResponse.json({ error: "Validation Error", issues: error.issues }, { status: 400 })
    }
    console.error("Unexpected error in POST /api/admin/products:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient() // Added await
  const { isAdmin, error: authError } = await AdminAuthService.isCurrentUserAdmin() // Use AdminAuthService

  console.log("PUT /api/admin/products: Is user admin?", isAdmin)
  if (!isAdmin) {
    console.log("PUT /api/admin/products: Unauthorized access attempt.", authError)
    return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const productUpdateData = productUpdateSchema.parse(body)
    const { id, ...updateFields } = productUpdateData

    console.log("PUT /api/admin/products: Updating product ID:", id, "with fields:", updateFields)

    const { data, error } = await supabase.from("products").update(updateFields).eq("id", id).select()

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.log("PUT /api/admin/products: Product not found for ID:", id)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(data[0], { status: 200 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues)
      return NextResponse.json({ error: "Validation Error", issues: error.issues }, { status: 400 })
    }
    console.error("Unexpected error in PUT /api/admin/products:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient() // Added await
  const { isAdmin, error: authError } = await AdminAuthService.isCurrentUserAdmin() // Use AdminAuthService

  console.log("DELETE /api/admin/products: Is user admin?", isAdmin)
  if (!isAdmin) {
    console.log("DELETE /api/admin/products: Unauthorized access attempt.", authError)
    return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = z.object({ id: z.string().uuid() }).parse(body)

    console.log("DELETE /api/admin/products: Attempting to delete product with ID:", id)

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("DELETE /api/admin/products: Product deleted successfully.")
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues)
      return NextResponse.json({ error: "Invalid product ID", issues: error.issues }, { status: 400 })
    }
    console.error("Unexpected error in DELETE /api/admin/products:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { isAdmin, error: authError } = await AdminAuthService.isCurrentUserAdmin()

  console.log("GET /api/admin/products: Is user admin?", isAdmin)
  if (!isAdmin) {
    console.log("GET /api/admin/products: Unauthorized access attempt.", authError)
    return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 })
  }

  try {
    const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Supabase fetch products error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error("Unexpected error in GET /api/admin/products:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
