interface DNIValidationResult {
  valid: boolean
  data?: {
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    dni: string
  }
  message: string
}

interface RUCValidationResult {
  valid: boolean
  data?: {
    razonSocial: string
    ruc: string
    estado: string
    condicion: string
    direccion?: string
  }
  message: string
}

export class RealValidationService {
  private apisPeruToken: string

  constructor() {
    this.apisPeruToken = process.env.APIS_PERU_TOKEN || ""

    if (!this.apisPeruToken) {
      console.warn("⚠️ APIs Peru token not configured. Get it from https://apis.net.pe/")
    }
  }

  // Validar DNI REAL con APIs.net.pe
  async validateDNI(dni: string): Promise<DNIValidationResult> {
    // Validación básica de formato
    if (!/^\d{8}$/.test(dni)) {
      return {
        valid: false,
        message: "DNI debe tener 8 dígitos",
      }
    }

    if (!this.apisPeruToken) {
      return {
        valid: false,
        message: "Servicio de validación no configurado. Configura APIS_PERU_TOKEN",
      }
    }

    try {
      const response = await fetch("https://api.apis.net.pe/v2/reniec/dni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apisPeruToken}`,
        },
        body: JSON.stringify({ dni }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          valid: true,
          data: {
            nombres: result.nombres,
            apellidoPaterno: result.apellidoPaterno,
            apellidoMaterno: result.apellidoMaterno,
            dni: result.dni,
          },
          message: "DNI válido ✓",
        }
      } else {
        return {
          valid: false,
          message: result.message || "DNI no encontrado en RENIEC",
        }
      }
    } catch (error) {
      console.error("❌ Error validando DNI:", error)
      return {
        valid: false,
        message: "Error conectando con RENIEC. Intenta nuevamente.",
      }
    }
  }

  // Validar RUC REAL con SUNAT
  async validateRUC(ruc: string): Promise<RUCValidationResult> {
    // Validación básica de formato
    if (!/^\d{11}$/.test(ruc)) {
      return {
        valid: false,
        message: "RUC debe tener 11 dígitos",
      }
    }

    if (!this.apisPeruToken) {
      return {
        valid: false,
        message: "Servicio de validación no configurado",
      }
    }

    try {
      const response = await fetch("https://api.apis.net.pe/v2/sunat/ruc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apisPeruToken}`,
        },
        body: JSON.stringify({ ruc }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          valid: true,
          data: {
            razonSocial: result.razonSocial,
            ruc: result.ruc,
            estado: result.estado,
            condicion: result.condicion,
            direccion: result.direccion,
          },
          message: "RUC válido ✓",
        }
      } else {
        return {
          valid: false,
          message: result.message || "RUC no encontrado en SUNAT",
        }
      }
    } catch (error) {
      console.error("❌ Error validando RUC:", error)
      return {
        valid: false,
        message: "Error conectando con SUNAT. Intenta nuevamente.",
      }
    }
  }

  // Validar email usando servicio real
  async validateEmail(email: string): Promise<{ valid: boolean; message: string }> {
    // Validación básica primero
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        message: "Formato de email inválido",
      }
    }

    // Si tienes Hunter.io API key, usar validación avanzada
    const hunterApiKey = process.env.HUNTER_API_KEY
    if (hunterApiKey) {
      try {
        const response = await fetch(
          `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterApiKey}`,
        )

        const result = await response.json()

        if (response.ok) {
          const isValid = result.data.status === "valid"
          return {
            valid: isValid,
            message: isValid ? "Email válido ✓" : "Email no válido o no existe",
          }
        }
      } catch (error) {
        console.error("Error validando email con Hunter:", error)
      }
    }

    // Fallback a validación básica
    return {
      valid: true,
      message: "Email válido ✓",
    }
  }

  // Validar teléfono peruano
  validatePhone(phone: string): { valid: boolean; message: string } {
    // Formato peruano: 9XXXXXXXX
    const phoneRegex = /^9\d{8}$/
    const isValid = phoneRegex.test(phone)

    return {
      valid: isValid,
      message: isValid ? "Teléfono válido ✓" : "Debe empezar con 9 y tener 9 dígitos",
    }
  }
}
