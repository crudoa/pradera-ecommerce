import { z } from "zod"
import type { OrderItem } from "@/types/order" // Assuming OrderItem is defined in this file

// Define the schema for a single OrderItem for internal validation
// This ensures that when the itemsJson string is parsed, each item conforms to the expected structure.
const orderItemSchema = z.object({
  product_id: z.string().uuid("ID de producto inválido."),
  product_name: z.string().min(1, "El nombre del producto es requerido."),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1."),
  unit_price: z.number().min(0, "El precio unitario no puede ser negativo."),
  total_price: z.number().min(0, "El precio total no puede ser negativo."),
  // Add other fields if necessary, e.g., image, sku, etc.
})

export const newOrderSchema = z.object({
  customer_name: z.string().min(1, "El nombre del cliente es requerido."),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  total_amount: z.number().min(0.01, "El monto total debe ser mayor a 0."),
  status: z.enum(["pending", "processing", "completed", "cancelled"], {
    errorMap: () => ({ message: "Estado de pedido inválido." }),
  }),
  payment_method: z.string().min(1, "El método de pago es requerido."),
  notes: z.string().optional(),
  // itemsJson will be a string input in the form, which is then transformed into an array of OrderItem
  itemsJson: z
    .string()
    .transform((str, ctx) => {
      if (!str) return [] // Handle empty string gracefully, transform to an empty array
      try {
        const parsed = JSON.parse(str)
        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Los ítems deben ser un array JSON válido.",
          })
          return z.NEVER // Indicate validation failure
        }
        // Validate each item in the parsed array against the orderItemSchema
        const validatedItems = z.array(orderItemSchema).safeParse(parsed)
        if (!validatedItems.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Error en la estructura de los ítems: ${validatedItems.error.errors.map((e) => e.message).join(", ")}`, // Fixed: closed template literal with backtick
          })
          return z.NEVER // Indicate validation failure
        }
        return validatedItems.data as unknown as OrderItem[]
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Formato JSON inválido para los ítems.",
        })
        return z.NEVER // Indicate validation failure
      }
    })
    .optional()
    .or(z.literal("").transform(() => [])), // Allow empty string to transform to an empty array
})

// NewOrderFormInput represents the shape of the data *before* Zod transformations (i.e., the form input)
export type NewOrderFormInput = z.input<typeof newOrderSchema>

// NewOrderOutput represents the shape of the data *after* successful Zod transformations
export type NewOrderOutput = z.output<typeof newOrderSchema>
