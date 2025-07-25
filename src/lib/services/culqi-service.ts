// Servicio de integración con Culqi para pagos reales en Perú
export class CulqiService {
  private static readonly PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!
  private static readonly SECRET_KEY = process.env.CULQI_SECRET_KEY!
  private static readonly API_URL = "https://api.culqi.com/v2"

  // Crear token de tarjeta (frontend)
  static async createCardToken(cardData: {
    card_number: string
    cvv: string
    expiration_month: string
    expiration_year: string
    email: string
  }) {
    try {
      const response = await fetch(`${this.API_URL}/tokens`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.PUBLIC_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      })

      if (!response.ok) {
        throw new Error("Error creating card token")
      }

      return await response.json()
    } catch (error) {
      console.error("Culqi token error:", error)
      throw error
    }
  }

  // Crear cargo (backend)
  static async createCharge(chargeData: {
    amount: number // en céntimos
    currency_code: string
    email: string
    source_id: string // token de la tarjeta
    description: string
    metadata?: Record<string, any>
  }) {
    try {
      const response = await fetch(`${this.API_URL}/charges`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chargeData),
      })

      if (!response.ok) {
        throw new Error("Error processing payment")
      }

      return await response.json()
    } catch (error) {
      console.error("Culqi charge error:", error)
      throw error
    }
  }

  // Generar QR para Yape/Plin
  static async createYapePayment(paymentData: {
    amount: number
    currency_code: string
    description: string
    order_id: string
  }) {
    try {
      const response = await fetch(`${this.API_URL}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentData,
          payment_methods: {
            yape: true,
            billetera: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Error creating Yape payment")
      }

      return await response.json()
    } catch (error) {
      console.error("Culqi Yape error:", error)
      throw error
    }
  }
}
