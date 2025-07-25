import { supabase } from "@/lib/supabase/client"

// Interfaces
interface ShippingAddress {
  address: string
  district: string
  province: string
  department: string
  postalCode?: string
  reference?: string
}

interface CheckoutData {
  // Customer info
  customerName: string
  customerEmail: string
  customerPhone: string
  customerDocumentType: "dni" | "ruc" | "passport"
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
    category?: string
  }>

  // Totals
  subtotal: number
  tax: number
  discount: number
  total: number

  // Payment
  paymentMethod: string
  paymentProvider?: string

  // Notes
  notes?: string
}

interface PaymentMethod {
  id: string
  name: string
  type: "card" | "bank" | "digital" | "cash"
  provider: string
  enabled: boolean
  config: Record<string, any>
}

export class PaymentService {
  private static readonly API_BASE_URL = "/api/payments"
  private static supabaseClient = supabase

  /**
   * Genera un número de orden único
   */
  private static generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `ORD-${timestamp}-${random}`.padStart(3, "0")
  }

  /**
   * Valida un documento de identidad peruano
   */
  static validateDocument(type: string, number: string): { isValid: boolean; message: string } {
    switch (type) {
      case "dni":
        if (!/^\d{8}$/.test(number)) {
          return { isValid: false, message: "El DNI debe tener 8 dígitos" }
        }
        return { isValid: true, message: "" }

      case "ruc":
        if (!/^\d{11}$/.test(number)) {
          return { isValid: false, message: "El RUC debe tener 11 dígitos" }
        }
        return { isValid: true, message: "" }

      case "passport":
        if (!/^[A-Z0-9]{6,12}$/.test(number)) {
          return { isValid: false, message: "Formato de pasaporte inválido" }
        }
        return { isValid: true, message: "" }

      default:
        return { isValid: false, message: "Tipo de documento no válido" }
    }
  }

  /**
   * Obtiene los métodos de pago disponibles
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      // Usar métodos por defecto ya que no existe la tabla payment_methods
      const defaultMethods: PaymentMethod[] = [
        {
          id: "card",
          name: "Tarjeta de Crédito/Débito",
          type: "card",
          provider: "culqi",
          enabled: true,
          config: {},
        },
        {
          id: "yape",
          name: "Yape",
          type: "digital",
          provider: "culqi",
          enabled: true,
          config: {},
        },
        {
          id: "plin",
          name: "Plin",
          type: "digital",
          provider: "culqi",
          enabled: true,
          config: {},
        },
        {
          id: "bank_transfer",
          name: "Transferencia Bancaria",
          type: "bank",
          provider: "manual",
          enabled: true,
          config: {},
        },
        {
          id: "cash_on_delivery",
          name: "Pago Contra Entrega",
          type: "cash",
          provider: "manual",
          enabled: true,
          config: {},
        },
      ]

      return defaultMethods.filter((method) => method.enabled)
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      return []
    }
  }

  /**
   * Calcula el costo de envío
   */
  static async calculateShipping(address: ShippingAddress): Promise<number> {
    try {
      // Lógica básica de cálculo de envío
      const { department, district } = address

      // Lima Metropolitana - envío gratis
      if (department.toLowerCase() === "lima" && district.toLowerCase().includes("lima")) {
        return 0
      }

      // Otras ciudades principales
      const mainCities = ["arequipa", "cusco", "trujillo", "chiclayo", "piura"]
      if (mainCities.some((city) => department.toLowerCase().includes(city))) {
        return 15
      }

      // Resto del país
      return 25
    } catch (error) {
      console.error("Error calculating shipping:", error)
      return 15 // Costo por defecto
    }
  }

  /**
   * Procesa un checkout completo
   */
  static async processCheckout(checkoutData: CheckoutData): Promise<{
    success: boolean
    orderId?: string
    paymentUrl?: string
    error?: string
  }> {
    try {
      // Validar datos del cliente
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

      // Generar número de orden
      const orderNumber = this.generateOrderNumber()

      // Crear orden en la base de datos
      const orderData = {
        order_number: orderNumber,
        email: checkoutData.customerEmail,
        phone: checkoutData.customerPhone,
        total_amount: checkoutData.total,
        status: "pending",
        shipping_address: JSON.stringify(checkoutData.shippingAddress),
        subtotal: checkoutData.subtotal,
        user_id: "guest", // For guest orders, we'll use a placeholder
        created_at: new Date().toISOString(),
      }

      const { data, error } = await this.supabaseClient.from("orders").insert(orderData).select("id").single()

      if (error) {
        console.error("Error creating order:", error)
        return {
          success: false,
          error: "Error creando la orden",
        }
      }

      const orderId = data.id

      // Procesar pago según el método seleccionado
      let paymentResult
      switch (checkoutData.paymentMethod) {
        case "card":
          paymentResult = await this.processCardPayment(orderId, checkoutData)
          break
        case "yape":
          paymentResult = await this.processYapePayment(orderId, checkoutData)
          break
        case "bank_transfer":
          paymentResult = await this.processBankTransfer(orderId, checkoutData)
          break
        case "cash_on_delivery":
          paymentResult = await this.processCashOnDelivery(orderId, checkoutData)
          break
        default:
          return {
            success: false,
            error: "Método de pago no válido",
          }
      }

      return {
        success: true,
        orderId,
        paymentUrl: paymentResult.paymentUrl,
      }
    } catch (error) {
      console.error("Error processing checkout:", error)
      return {
        success: false,
        error: "Error interno del servidor",
      }
    }
  }

  /**
   * Procesa pago con tarjeta
   */
  private static async processCardPayment(
    orderId: string,
    checkoutData: CheckoutData,
  ): Promise<{ paymentUrl?: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/culqi/create-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount: Math.round(checkoutData.total * 100), // Convertir a centavos
          currency: "PEN",
          email: checkoutData.customerEmail,
        }),
      })

      const result = await response.json()

      if (result.success) {
        return { paymentUrl: result.paymentUrl }
      }

      throw new Error(result.error || "Error procesando pago con tarjeta")
    } catch (error) {
      console.error("Error processing card payment:", error)
      throw error
    }
  }

  /**
   * Procesa pago con Yape
   */
  private static async processYapePayment(
    orderId: string,
    checkoutData: CheckoutData,
  ): Promise<{ paymentUrl?: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/culqi/yape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount: Math.round(checkoutData.total * 100),
          currency: "PEN",
          phone: checkoutData.customerPhone,
        }),
      })

      const result = await response.json()

      if (result.success) {
        return { paymentUrl: result.qrUrl }
      }

      throw new Error(result.error || "Error procesando pago con Yape")
    } catch (error) {
      console.error("Error processing Yape payment:", error)
      throw error
    }
  }

  /**
   * Procesa transferencia bancaria
   */
  private static async processBankTransfer(
    orderId: string,
    checkoutData: CheckoutData,
  ): Promise<{ paymentUrl?: string }> {
    try {
      // Actualizar estado de la orden
      await this.supabaseClient
        .from("orders")
        .update({
          status: "pending_transfer",
          payment_status: "pending",
        })
        .eq("id", orderId)

      // Retornar URL de instrucciones de transferencia
      return {
        paymentUrl: `/checkout/transfer-instructions?orderId=${orderId}`,
      }
    } catch (error) {
      console.error("Error processing bank transfer:", error)
      throw error
    }
  }

  /**
   * Procesa pago contra entrega
   */
  private static async processCashOnDelivery(
    orderId: string,
    checkoutData: CheckoutData,
  ): Promise<{ paymentUrl?: string }> {
    try {
      // Actualizar estado de la orden
      await this.supabaseClient
        .from("orders")
        .update({
          status: "confirmed",
          payment_status: "pending",
        })
        .eq("id", orderId)

      return {
        paymentUrl: `/checkout/success?orderId=${orderId}`,
      }
    } catch (error) {
      console.error("Error processing cash on delivery:", error)
      throw error
    }
  }

  /**
   * Verifica el estado de un pago
   */
  static async verifyPayment(orderId: string): Promise<{
    success: boolean
    status: string
    error?: string
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error verifying payment:", error)
      return {
        success: false,
        status: "error",
        error: "Error verificando el pago",
      }
    }
  }

  /**
   * Obtiene el estado de una orden
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
          error: "Orden no encontrada",
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
        error: "Error obteniendo estado de la orden",
      }
    }
  }
}

export default PaymentService
