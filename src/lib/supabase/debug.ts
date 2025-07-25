import { supabase } from "@/lib/supabase/client"

export class SupabaseDebug {
  static async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("products").select("count").limit(1)

      if (error) {
        console.error("Supabase connection error:", error)
        return false
      }

      console.log("Supabase connection successful")
      return true
    } catch (error) {
      console.error("Supabase connection failed:", error)
      return false
    }
  }

  static async checkTables(): Promise<boolean> {
    try {
      const { data: products, error: productsError } = await supabase.from("products").select("count").limit(1)

      if (productsError) {
        console.error("Products table error:", productsError)
        return false
      }

      console.log("Supabase connection successful")
      return true
    } catch (error) {
      console.error("Supabase connection failed:", error)
      return false
    }
  }

  static async getTableInfo(): Promise<Record<string, any>> {
    const tables = [
      "products",
      "categories",
      "user_profiles",
      "orders",
      "order_items",
      "cart_items",
      "favorites",
      "product_images",
      "product_reviews",
      "user_addresses",
      "user_payment_methods",
    ]

    const tableInfo: Record<string, any> = {}

    for (const table of tables) {
      try {
        const { count, error } = await (supabase as any).from(table).select("*", { count: "exact", head: true })

        if (error) {
          tableInfo[table] = { error: error.message }
        } else {
          tableInfo[table] = { count }
        }
      } catch (error: any) {
        tableInfo[table] = { error: error.message }
      }
    }

    return tableInfo
  }

  static async testQueries(): Promise<Record<string, any>> {
    const results: Record<string, any> = {}

    try {
      // Test products query
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, price")
        .limit(5)

      results.products = productsError ? { error: productsError.message } : { count: products?.length || 0 }

      // Test categories query
      const { data: categories, error: categoriesError } = await supabase.from("categories").select("id, name").limit(5)

      results.categories = categoriesError ? { error: categoriesError.message } : { count: categories?.length || 0 }

      // Test user_profiles query
      const { data: profiles, error: profilesError } = await supabase.from("user_profiles").select("id, email").limit(5)

      results.user_profiles = profilesError ? { error: profilesError.message } : { count: profiles?.length || 0 }
    } catch (error: any) {
      results.error = error.message
    }

    return results
  }
}

export default SupabaseDebug
