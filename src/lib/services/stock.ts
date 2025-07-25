import { supabase } from "@/lib/supabase/client"

export interface StockUpdateResult {
  success: boolean
  newStock: number
  message: string
}

export class StockService {
  /**
   * Actualiza el stock de un producto en la base de datos
   */
  static async updateProductStock(productId: string, quantityToSubtract: number): Promise<StockUpdateResult> {
    try {
      console.log(`📦 Actualizando stock del producto ${productId}, restando ${quantityToSubtract} unidades`)

      // Get current stock
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .single()

      if (fetchError || !product) {
        return {
          success: false,
          newStock: 0,
          message: "Producto no encontrado",
        }
      }

      const currentStock = product.stock_quantity || 0
      const newStock = Math.max(0, currentStock - quantityToSubtract)

      // Update stock
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", productId)

      if (updateError) {
        console.error("❌ Error actualizando stock:", updateError)
        return {
          success: false,
          newStock: currentStock,
          message: `Error: ${updateError.message}`,
        }
      }

      console.log(`✅ Stock actualizado: ${currentStock} -> ${newStock}`)

      return {
        success: true,
        newStock,
        message: "Stock actualizado correctamente",
      }
    } catch (error) {
      console.error("❌ Error en updateProductStock:", error)
      return {
        success: false,
        newStock: 0,
        message: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  /**
   * Obtiene el stock actual de un producto
   */
  static async getCurrentStock(productId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .eq("is_active", true)
        .single()

      if (error || !data) {
        console.error("❌ Error obteniendo stock:", error)
        return 0
      }

      return data.stock_quantity || 0
    } catch (error) {
      console.error("❌ Error en getCurrentStock:", error)
      return 0
    }
  }

  /**
   * Verifica si hay suficiente stock para una cantidad
   */
  static async checkStockAvailability(productId: string, requestedQuantity: number): Promise<boolean> {
    try {
      const currentStock = await this.getCurrentStock(productId)
      return currentStock >= requestedQuantity
    } catch (error) {
      console.error("❌ Error verificando disponibilidad:", error)
      return false
    }
  }
}
