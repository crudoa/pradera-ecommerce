import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CheckoutData } from "@/lib/services/order-checkout-service" // Import CheckoutData type

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = "S/", locale = "es-PE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PEN", // Peruvian Sol
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove all non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with single dash
    .replace(/^-+|-+$/g, "") // Remove dashes from start and end
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function isValidEmail(email: string): boolean {
  // Basic regex for email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): boolean {
  // Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Formats a 9-digit Peruvian phone number (e.g., 987654321 to 987 654 321)
  const cleaned = ("" + phoneNumber).replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`
  }
  return phoneNumber // Return original if not a 9-digit number
}

export function getInitials(name: string): string {
  const parts = name.split(" ")
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + "..."
}

export function calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0 || currentPrice >= originalPrice) {
    return 0
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return "" // Browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // Vercel production URL
  return `http://localhost:${process.env.PORT ?? 3000}` // Dev environment
}

/**
 * Generates a formatted WhatsApp message for an order.
 * @param checkoutData The checkout data.
 * @param orderId The ID of the created order.
 * @returns A string formatted for WhatsApp.
 */
export function getWhatsAppOrderMessage(checkoutData: CheckoutData, orderId: string): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    customerDocumentType,
    customerDocumentNumber,
    shippingAddress,
    shippingCost,
    items,
    subtotal,
    total, // tax is already 0, so we can just use total
    paymentMethod,
    notes,
  } = checkoutData

  // Modificación aquí: Eliminar el precio individual de cada producto para acortar el mensaje
  const productsList = items.map((item) => `- ${item.name} (x${item.quantity})`).join("\n")

  let message = `¡Hola! Me gustaría realizar un pedido con los siguientes detalles:\n\n`
  message += `*Número de Pedido:* ${orderId}\n`
  message += `*Cliente:* ${customerName}\n`
  message += `*Email:* ${customerEmail}\n`
  message += `*Teléfono:* ${customerPhone}\n`
  message += `*Documento:* ${customerDocumentType.toUpperCase()} ${customerDocumentNumber}\n\n`
  message += `*Dirección de Envío:*\n`
  message += `Dirección: ${shippingAddress.address || "No especificada"}\n` // Handle empty address
  message += `Distrito: ${shippingAddress.district || "No especificado"}\n` // Handle empty district
  message += `Provincia: ${shippingAddress.province || "No especificada"}\n` // Handle empty province
  message += `Departamento: ${shippingAddress.department || "No especificado"}\n` // Handle empty department
  if (shippingAddress.reference) {
    message += `Referencia: ${shippingAddress.reference}\n`
  }
  if (shippingAddress.postalCode) {
    message += `Código Postal: ${shippingAddress.postalCode}\n`
  }
  message += `\n*Productos:*\n`
  message += `${productsList}\n\n`
  message += `*Resumen:*\n`
  message += `Subtotal: S/.${subtotal.toFixed(2)}\n`
  message += `Costo de Envío: S/.${shippingCost.toFixed(2)}\n`
  message += `*Total: S/.${total.toFixed(2)}*\n\n`
  message += `*Método de Pago:* ${paymentMethod === "whatsapp" ? "Coordinar por WhatsApp" : paymentMethod}\n`
  if (notes) {
    message += `Notas: ${notes}\n`
  }
  message += `\n¡Gracias!`

  return message
}
