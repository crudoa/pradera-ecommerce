import { supabase } from "@/lib/supabase/client"
import type { Json } from "@/types/database"

// Interfaces
interface ShippingAddress {
  address?: string // Made optional
  district?: string // Made optional
  province?: string // Made optional
  department?: string // Made optional
  postalCode?: string
  reference?: string
}

export interface CheckoutData {
  // Customer info
  customerName: string
  customerEmail: string
  customerPhone: string
  customerDocumentType: "dni" | "ruc" | "passport" // Ensure this matches the union type
  customerDocumentNumber: string

  // Shipping
  shippingAddress: ShippingAddress
  shippingCost: number

  // Items
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    category?: string | null // Allow category to be null
  }>

  // Totals
  subtotal: number
  tax: number
  discount: number
  total: number

  // Payment (now simplified for WhatsApp/Manual)
  paymentMethod: string // e.g., "whatsapp", "bank_transfer", "cash_on_delivery"
  paymentProvider?: string // e.g., "manual"

  // Notes
  notes?: string | null // Allow notes to be null
}

export class OrderCheckoutService {
  static getOrderDetails(orderId: string) {
    throw new Error("Method not implemented.")
  }
  private static supabaseClient = supabase

  /**
   * Generates a unique order number
   */
  private static generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `ORD-${timestamp}-${random}`.padStart(3, "0")
  }

  /**
   * Validates a Peruvian identity document
   */
  static validateDocument(type: string, number: string): { isValid: boolean; message: string } {
    if (!number || number.trim() === "") {
      return { isValid: false, message: "El número de documento es obligatorio." }
    }

    switch (type) {
      case "dni":
        if (!/^\d{8}$/.test(number)) {
          return { isValid: false, message: "El DNI debe tener 8 dígitos." }
        }
        return { isValid: true, message: "" }

      case "ruc":
        if (!/^\d{11}$/.test(number)) {
          return { isValid: false, message: "El RUC debe tener 11 dígitos." }
        }
        return { isValid: true, message: "" }

      case "passport":
        if (!/^[A-Z0-9]{6,12}$/.test(number)) {
          return { isValid: false, message: "Formato de pasaporte inválido." }
        }
        return { isValid: true, message: "" }

      default:
        return { isValid: false, message: "Tipo de documento no válido." }
    }
  }

  /**
   * Calculates shipping cost (simplified logic)
   */
  static async calculateShipping(address: ShippingAddress): Promise<number> {
    try {
      const { department, district } = address

      // If department or district are not provided, return a default cost or 0
      if (!department || !district) {
        return 0 // Or a default like 15 if shipping is always charged
      }

      // Lima Metropolitana - free shipping
      if (department.toLowerCase() === "lima" && district.toLowerCase().includes("lima")) {
        return 0
      }

      // Other main cities
      const mainCities = ["arequipa", "cusco", "trujillo", "chiclayo", "piura"]
      if (mainCities.some((city) => department.toLowerCase().includes(city))) {
        return 15
      }

      // Rest of the country
      return 25
    } catch (error) {
      console.error("Error calculating shipping:", error)
      return 15 // Default cost on error
    }
  }

  /**
   * Processes a complete checkout, creating the order in the database.
   * This version does NOT handle direct payment processing, but prepares for manual payment (e.g., WhatsApp).
   */
  static async processCheckout(checkoutData: CheckoutData): Promise<{
    success: boolean
    orderId?: string
    error?: string
  }> {
    try {
      // Validate customer document
      const documentValidation = this.validateDocument(
        checkoutData.customerDocumentType,
        checkoutData.customerDocumentNumber,
      )

      if (!documentValidation.isValid) {
        return {
          success: false,
          error: documentValidation.message,
        }
      }

      // Generate order number
      const orderNumber = this.generateOrderNumber()

      // Determine user_id: use actual user ID if authenticated, otherwise null
      const {
        data: { user },
      } = await this.supabaseClient.auth.getUser()
      const userId = user ? user.id : null // Changed to null for unauthenticated users

      // Create order in the database
      const orderData = {
        order_number: orderNumber,
        email: checkoutData.customerEmail,
        phone: checkoutData.customerPhone,
        customer_name: checkoutData.customerName,
        total_amount: checkoutData.total,
        status: "pending", // Initial status is pending for manual confirmation
        payment_status: "pending", // Payment is pending manual confirmation
        shipping_address: checkoutData.shippingAddress as unknown as Json, // Cast to Json
        subtotal: checkoutData.subtotal,
        tax_amount: checkoutData.tax,
        shipping_cost: checkoutData.shippingCost,
        discount_amount: checkoutData.discount,
        payment_method: checkoutData.paymentMethod,
        payment_provider: checkoutData.paymentProvider,
        notes: checkoutData.notes,
        user_id: userId, // Use actual user ID or null
        created_at: new Date().toISOString(),
      }

      const { data: order, error: orderError } = await this.supabaseClient
        .from("orders")
        .insert(orderData)
        .select("id")
        .single()

      if (orderError) {
        console.error("Error creating order:", orderError)
        return {
          success: false,
          error: "Error creating the order in the database.",
        }
      }

      const orderId = order.id

      // Insert order items
      const orderItemsData = checkoutData.items.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category || null,
      }))

      const { error: orderItemsError } = await this.supabaseClient.from("order_items").insert(orderItemsData)

      if (orderItemsError) {
        console.error("Error inserting order items:", orderItemsError)
        // Optionally, you might want to roll back the order creation here
        return {
          success: false,
          error: "Error saving order items.",
        }
      }

      return {
        success: true,
        orderId,
      }
    } catch (error) {
      console.error("Error processing checkout:", error)
      return {
        success: false,
        error: "Internal server error during checkout.",
      }
    }
  }

  /**
   * Gets the status of an order
   */
  static async getOrderStatus(orderId: string): Promise<{
    success: boolean
    order?: any
    error?: string
  }> {
    try {
      const { data, error } = await this.supabaseClient.from("orders").select("*").eq("id", orderId).single()

      if (error) {
        return {
          success: false,
          error: "Order not found",
        }
      }

      return {
        success: true,
        order: data,
      }
    } catch (error) {
      console.error("Error getting order status:", error)
      return {
        success: false,
        error: "Error getting order status",
      }
    }
  }
}

export default OrderCheckoutService
