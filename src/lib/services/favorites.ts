import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type FavoriteRow = Database["public"]["Tables"]["favorites"]["Row"]

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export class FavoritesService {
  static async getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching favorites:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserFavorites:", error)
      return []
    }
  }

  static async addFavorite(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("favorites").insert({
        user_id: userId,
        product_id: productId,
      })

      if (error) {
        console.error("Error adding favorite:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in addFavorite:", error)
      return false
    }
  }

  static async removeFavorite(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId)

      if (error) {
        console.error("Error removing favorite:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in removeFavorite:", error)
      return false
    }
  }

  static async isFavorite(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single()

      if (error) {
        return false
      }

      return !!data
    } catch (error) {
      console.error("Error in isFavorite:", error)
      return false
    }
  }
}
