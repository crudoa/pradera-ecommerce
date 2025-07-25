import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface CulqiTokenData {
  card_number: string
  cvv: string
  expiration_month: string
  expiration_year: string
  email: string
}

interface CulqiChargeData {
  amount: number // en céntimos
  currency_code: string
  email: string
  source_id: string
  description: string
  metadata?: Record<string, any>
}

interface PaymentResult {
  success: boolean
  transaction_id?: string
  error?: string
  data?: any
}

export class RealPaymentService {
  private culqiPublicKey: string
  private culqiSecretKey: string
  private pagoEfectivoKey: string

  constructor() {
    this.culqiPublicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || ""
    this.culqiSecretKey = process.env.CULQI_SECRET_KEY || ""
    this.pagoEfectivoKey = process.env.PAGOEFECTIVO_ACCESS_KEY || ""

    if (!this.culqiPublicKey || !this.culqiSecretKey) {
      console.warn("⚠️ Culqi keys not configured. Get them from https://culqi.com/")
    }
  }

  // Crear token con Culqi REAL
  async createCulqiToken(cardData: CulqiTokenData): Promise<PaymentResult> {
    if (!this.culqiPublicKey) {
      return {
        success: false,
        error: "Culqi no configurado. Registrate en https://culqi.com/",
      }
    }

    try {
      const response = await fetch("https://secure.culqi.com/v2/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.culqiPublicKey}`,
        },
        body: JSON.stringify({
          card_number: cardData.card_number,
          cvv: cardData.cvv,
          expiration_month: cardData.expiration_month,
          expiration_year: cardData.expiration_year,
          email: cardData.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.user_message || result.message || "Error creando token")
      }

      return {
        success: true,
        transaction_id: result.id,
        data: result,
      }
    } catch (error) {
      console.error("❌ Error Culqi token:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Procesar cargo con Culqi REAL
  async processCulqiCharge(chargeData: CulqiChargeData): Promise<PaymentResult> {
    if (!this.culqiSecretKey) {
      return {
        success: false,
        error: "Culqi Secret Key no configurado",
      }
    }

    try {
      const response = await fetch("https://api.culqi.com/v2/charges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.culqiSecretKey}`,
        },
        body: JSON.stringify(chargeData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.user_message || result.message || "Error procesando pago")
      }

      // Guardar transacción en base de datos
      await this.saveTransaction({
        transaction_id: result.id,
        amount: chargeData.amount,
        currency: chargeData.currency_code,
        email: chargeData.email,
        status: "completed",
        provider: "culqi",
        raw_data: result,
      })

      return {
        success: true,
        transaction_id: result.id,
        data: result,
      }
    } catch (error) {
      console.error("❌ Error Culqi charge:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error procesando pago",
      }
    }
  }

  // Crear código CIP REAL con PagoEfectivo
  async createPagoEfectivoCIP(orderData: {
    amount: number
    description: string
    email: string
    customerName: string
    documentType: string
    documentNumber: string
    phone: string
  }): Promise<PaymentResult> {
    if (!this.pagoEfectivoKey) {
      return {
        success: false,
        error: "PagoEfectivo no configurado. Registrate en https://www.pagoefectivo.pe/",
      }
    }

    try {
      const response = await fetch("https://api.pagoefectivo.pe/v1/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.pagoEfectivoKey}`,
        },
        body: JSON.stringify({
          currency: "PEN",
          amount: orderData.amount,
          transactionCode: `AGR-${Date.now()}`,
          adminEmail: "admin@agrobesser.com",
          userEmail: orderData.email,
          userName: orderData.customerName,
          userDocumentType: orderData.documentType === "dni" ? "1" : "4",
          userDocumentNumber: orderData.documentNumber,
          userCodeCountry: "051",
          userPhone: orderData.phone,
          paymentConcept: orderData.description,
          dateExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/pagoefectivo`,
          additionalData: JSON.stringify({ source: "agrobesser" }),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Error generando CIP")
      }

      // Guardar CIP en base de datos
      await this.saveTransaction({
        transaction_id: result.cip,
        amount: orderData.amount,
        currency: "PEN",
        email: orderData.email,
        status: "pending",
        provider: "pagoefectivo",
        raw_data: result,
      })

      return {
        success: true,
        transaction_id: result.cip,
        data: {
          cip: result.cip,
          expires_at: result.dateExpiry,
          amount: orderData.amount,
        },
      }
    } catch (error) {
      console.error("❌ Error PagoEfectivo CIP:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error generando código CIP",
      }
    }
  }

  // Verificar estado de pago PagoEfectivo
  async verifyPagoEfectivoPayment(cip: string): Promise<PaymentResult> {
    if (!this.pagoEfectivoKey) {
      return { success: false, error: "PagoEfectivo no configurado" }
    }

    try {
      const response = await fetch(`https://api.pagoefectivo.pe/v1/services/${cip}`, {
        headers: {
          Authorization: `Bearer ${this.pagoEfectivoKey}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Error verificando pago")
      }

      // Actualizar estado en base de datos
      if (result.status === "PAID") {
        await this.updateTransactionStatus(cip, "completed")
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("❌ Error verificando PagoEfectivo:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error verificando pago",
      }
    }
  }

  // Guardar transacción en base de datos
  private async saveTransaction(transactionData: {
    transaction_id: string
    amount: number
    currency: string
    email: string
    status: string
    provider: string
    raw_data: any
  }) {
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          transaction_id: transactionData.transaction_id,
          amount: transactionData.amount,
          currency: transactionData.currency,
          email: transactionData.email,
          status: transactionData.status,
          provider: transactionData.provider,
          raw_data: transactionData.raw_data,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error("Error guardando transacción:", error)
      }
    } catch (error) {
      console.error("Error en base de datos:", error)
    }
  }

  // Actualizar estado de transacción
  private async updateTransactionStatus(transactionId: string, status: string) {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId)

      if (error) {
        console.error("Error actualizando transacción:", error)
      }
    } catch (error) {
      console.error("Error en base de datos:", error)
    }
  }
}
