import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server" // Corrected import path
import { withErrorHandling } from "@/lib/errors/server-error-utils"
import { categorySchema } from "@/lib/validations/category-schemas" // Assuming categorySchema is for name validation

// Define a schema for the DELETE request body
const deleteCategorySchema = z.object({
  id: z.string().uuid("ID de categoría inválido."),
})

export const GET = withErrorHandling(async () => {
  const supabase = await createClient() // Corrected client instantiation
 // Corrected client instantiation
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, is_active, created_at, updated_at")
    .order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Error al cargar categorías.")
  }

  return NextResponse.json(data)
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const supabase = await createClient() // Corrected client instantiation
 // Corrected client instantiation
  const body = await req.json()

  const validationResult = categorySchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { issues: validationResult.error.issues, error: "Datos de categoría inválidos." },
      { status: 400 },
    )
  }

  const { name } = validationResult.data

  // Generate a slug from the name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug, is_active: true }) // Default is_active to true
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    if (error.code === "23505") {
      // Unique violation code
      throw new Error("Ya existe una categoría con este nombre o slug.")
    }
    throw new Error("Error al crear la categoría.")
  }

  return NextResponse.json(data, { status: 201 })
})

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const supabase = await createClient() // Corrected client instantiation
 // Corrected client instantiation
  const body = await req.json()

  const validationResult = deleteCategorySchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { issues: validationResult.error.issues, error: "ID de categoría inválido." },
      { status: 400 },
    )
  }

  const { id } = validationResult.data

  // Check if any products are associated with this category
  const { count: productCount, error: productCountError } = await supabase
    .from("products")
    .select("id", { count: "exact" })
    .eq("category_id", id)

  if (productCountError) {
    console.error("Error checking associated products:", productCountError)
    throw new Error("Error al verificar productos asociados a la categoría.")
  }

  if (productCount && productCount > 0) {
    return NextResponse.json(
      {
        error:
          "No se puede eliminar la categoría porque tiene productos asociados. Por favor, reasigna o elimina los productos primero.",
      },
      { status: 409 }, // Conflict
    )
  }

  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    throw new Error("Error al eliminar la categoría.")
  }

  return NextResponse.json({ message: "Categoría eliminada exitosamente." }, { status: 200 })
})
