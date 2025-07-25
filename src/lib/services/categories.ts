import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"
import type { Category } from "@/types/product" // Assuming Category type is defined here or similar

class CategoryService {
  private supabase: ReturnType<typeof createServerComponentClient<Database>>

  constructor() {
    this.supabase = createServerComponentClient<Database>({ cookies })
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("id, name, slug, description, image_url, is_active, created_at, updated_at")
      .eq("is_active", true) // Only fetch active categories for the frontend
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      throw new Error("Failed to fetch categories: " + error.message)
    }

    // Ensure data matches Category type, especially for 'is_active'
    return data.map((c) => ({ ...c, is_active: c.is_active ?? true })) || []
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching category:", error)
      return null
    }

    return data as Category
  }
}

const categoryService = new CategoryService()
export default categoryService
