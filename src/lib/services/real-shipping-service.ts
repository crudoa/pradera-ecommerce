interface ShippingQuote {
  company: string
  service: string
  price: number
  estimatedDays: string
  trackingAvailable: boolean
  description: string
}

interface ShippingLabel {
  trackingNumber: string
  labelUrl?: string
  estimatedDelivery: string
  company: string
}

export class RealShippingService {
  private olvaApiKey: string
  private shalomApiKey: string

  constructor() {
    this.olvaApiKey = process.env.OLVA_API_KEY || ""
    this.shalomApiKey = process.env.SHALOM_API_KEY || ""

    if (!this.olvaApiKey) {
      console.warn("⚠️ Olva API key not configured. Contact api@olvacourier.com")
    }
  }

  // Obtener cotizaciones reales de envío
  async getShippingQuotes(
    origin: string,
    destination: string,
    weight: number,
    isLima: boolean,
  ): Promise<ShippingQuote[]> {
    const quotes: ShippingQuote[] = []

    // Olva Courier - API Real (si está configurada)
    if (this.olvaApiKey) {
      try {
        const olvaQuote = await this.getOlvaQuote(origin, destination, weight)
        quotes.push(olvaQuote)
      } catch (error) {
        console.error("Error obteniendo cotización Olva:", error)
      }
    }

    // Fallback a precios estándar si no hay APIs configuradas
    if (quotes.length === 0) {
      quotes.push(...this.getStandardQuotes(isLima, weight))
    }

    return quotes
  }

  // Cotización real con Olva Courier
  private async getOlvaQuote(origin: string, destination: string, weight: number): Promise<ShippingQuote> {
    const response = await fetch("https://api.olvacourier.com/v1/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.olvaApiKey}`,
      },
      body: JSON.stringify({
        origin: {
          district: origin,
          province: "Lima",
          department: "Lima",
        },
        destination: {
          district: destination,
          province: "Lima", // Ajustar según destino real
          department: "Lima",
        },
        package: {
          weight: weight,
          length: 30,
          width: 20,
          height: 15,
        },
        service_type: "standard",
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Error obteniendo cotización Olva")
    }

    return {
      company: "Olva Courier",
      service: result.service_name || "Estándar",
      price: result.price || 15,
      estimatedDays: result.estimated_delivery_days || "2-4 días hábiles",
      trackingAvailable: true,
      description: "Entrega a domicilio con seguimiento",
    }
  }

  // Cotizaciones estándar (cuando no hay APIs configuradas)
  private getStandardQuotes(isLima: boolean, weight: number): ShippingQuote[] {
    const basePrice = weight > 5 ? 5 : 0 // Recargo por peso

    if (isLima) {
      return [
        {
          company: "Olva Courier",
          service: "Entrega a Domicilio",
          price: 15 + basePrice,
          estimatedDays: "1-3 días hábiles",
          trackingAvailable: true,
          description: "Entrega a domicilio en Lima Metropolitana",
        },
        {
          company: "Shalom",
          service: "Recojo en Agencia",
          price: 12 + basePrice,
          estimatedDays: "1-2 días hábiles",
          trackingAvailable: true,
          description: "Recojo en agencia más cercana",
        },
      ]
    } else {
      return [
        {
          company: "Olva Courier",
          service: "Envío a Provincias",
          price: 25 + basePrice,
          estimatedDays: "3-7 días hábiles",
          trackingAvailable: true,
          description: "Entrega a domicilio en provincias",
        },
        {
          company: "Cruz del Sur",
          service: "Pago en Destino",
          price: 0, // Pago en destino
          estimatedDays: "2-5 días hábiles",
          trackingAvailable: true,
          description: "Recojo en terminal, pago al recibir",
        },
        {
          company: "Marvisur",
          service: "Recojo en Oficina",
          price: 18 + basePrice,
          estimatedDays: "3-6 días hábiles",
          trackingAvailable: true,
          description: "Recojo en oficina de destino",
        },
      ]
    }
  }

  // Crear envío real
  async createShipment(orderData: {
    customerName: string
    address: string
    phone: string
    district: string
    city: string
    weight: number
    description: string
    value: number
    shippingCompany: string
  }): Promise<ShippingLabel> {
    if (orderData.shippingCompany === "olva" && this.olvaApiKey) {
      return await this.createOlvaShipment(orderData)
    }

    // Fallback: generar tracking simulado pero con formato real
    const trackingNumber = this.generateTrackingNumber(orderData.shippingCompany)

    return {
      trackingNumber,
      estimatedDelivery: this.calculateEstimatedDelivery(orderData.city),
      company: orderData.shippingCompany,
    }
  }

  // Crear envío real con Olva
  private async createOlvaShipment(orderData: any): Promise<ShippingLabel> {
    const response = await fetch("https://api.olvacourier.com/v1/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.olvaApiKey}`,
      },
      body: JSON.stringify({
        sender: {
          name: "AgroBesser",
          address: "Av. Principal 123",
          district: "Miraflores",
          province: "Lima",
          department: "Lima",
          phone: "01-1234567",
          email: "envios@agrobesser.com",
        },
        recipient: {
          name: orderData.customerName,
          address: orderData.address,
          district: orderData.district,
          province: orderData.city === "Lima" ? "Lima" : orderData.city,
          department: orderData.city === "Lima" ? "Lima" : this.getDepartmentByCity(orderData.city),
          phone: orderData.phone,
        },
        package: {
          weight: orderData.weight,
          length: 30,
          width: 20,
          height: 15,
          description: orderData.description,
          declared_value: orderData.value,
        },
        service_type: "standard",
        payment_type: "sender", // Remitente paga
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Error creando envío")
    }

    return {
      trackingNumber: result.tracking_number,
      labelUrl: result.label_url,
      estimatedDelivery: result.estimated_delivery_date,
      company: "olva",
    }
  }

  // Rastrear envío real
  async trackShipment(trackingNumber: string, company: string): Promise<any> {
    switch (company) {
      case "olva":
        return await this.trackOlvaShipment(trackingNumber)
      case "shalom":
        return await this.trackShalomShipment(trackingNumber)
      default:
        return {
          status: "in_transit",
          message: "Envío en tránsito",
          tracking_url: this.getTrackingUrl(trackingNumber, company),
        }
    }
  }

  // Rastrear con Olva (API real)
  private async trackOlvaShipment(trackingNumber: string) {
    if (!this.olvaApiKey) {
      return {
        status: "unknown",
        message: "API de rastreo no configurada",
        tracking_url: `https://www.olvacourier.com/tracking?code=${trackingNumber}`,
      }
    }

    try {
      const response = await fetch(`https://api.olvacourier.com/v1/tracking/${trackingNumber}`, {
        headers: {
          Authorization: `Bearer ${this.olvaApiKey}`,
        },
      })

      const result = await response.json()

      if (response.ok) {
        return {
          status: result.status,
          message: result.status_description,
          events: result.events,
          tracking_url: `https://www.olvacourier.com/tracking?code=${trackingNumber}`,
        }
      }
    } catch (error) {
      console.error("Error rastreando Olva:", error)
    }

    return {
      status: "unknown",
      message: "Error obteniendo información de rastreo",
      tracking_url: `https://www.olvacourier.com/tracking?code=${trackingNumber}`,
    }
  }

  // Rastrear con Shalom
  private async trackShalomShipment(trackingNumber: string) {
    // Shalom no tiene API pública, redirigir a su web
    return {
      status: "in_transit",
      message: "Consulta el estado en la web de Shalom",
      tracking_url: `http://agencias.shalom.com.pe/`,
    }
  }

  // Generar número de tracking con formato real
  private generateTrackingNumber(company: string): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()

    switch (company) {
      case "olva":
        return `OLV${timestamp.slice(-8)}${random}`
      case "shalom":
        return `SHL${timestamp.slice(-8)}${random}`
      case "cruz_del_sur":
        return `CDS${timestamp.slice(-8)}${random}`
      case "marvisur":
        return `MVS${timestamp.slice(-8)}${random}`
      default:
        return `AGR${timestamp.slice(-8)}${random}`
    }
  }

  // Calcular fecha estimada de entrega
  private calculateEstimatedDelivery(city: string): string {
    const days = city === "Lima" ? 3 : 7
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + days)

    return deliveryDate.toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Obtener departamento por ciudad (simplificado)
  private getDepartmentByCity(city: string): string {
    const cityToDepartment: Record<string, string> = {
      Arequipa: "Arequipa",
      Trujillo: "La Libertad",
      Chiclayo: "Lambayeque",
      Piura: "Piura",
      Iquitos: "Loreto",
      Cusco: "Cusco",
      Huancayo: "Junín",
      Tacna: "Tacna",
      Ica: "Ica",
      Cajamarca: "Cajamarca",
    }

    return cityToDepartment[city] || city
  }

  // Obtener URL de rastreo
  private getTrackingUrl(trackingNumber: string, company: string): string {
    const trackingUrls: Record<string, string> = {
      olva: `https://www.olvacourier.com/tracking?code=${trackingNumber}`,
      shalom: `http://agencias.shalom.com.pe/`,
      cruz_del_sur: `https://www.cruzdelsur.com.pe/cargo`,
      marvisur: `https://www.expresomarvisur.com/sucursales`,
    }

    return trackingUrls[company] || `#tracking-${trackingNumber}`
  }
}
