import { z } from "zod"

export const productDataSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  price: z.number().min(0, "El precio debe ser un número positivo"),
  original_price: z.number().nullable().optional(),
  sku: z.string().min(1, "El SKU es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  brand: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  dimensions: z.any().nullable().optional(), // Consider a more specific schema for dimensions
  stock_quantity: z.number().int().min(0, "La cantidad en stock debe ser un número entero no negativo"),
  category_id: z.string().uuid("ID de categoría inválido"),
  image_url: z.string().url("URL de imagen inválida").nullable().optional(),
  is_active: z.boolean().default(true).optional(),
  specifications: z.any().nullable().optional(), // Consider a more specific schema for specifications
  is_featured: z.boolean().default(false).optional(),
  is_new: z.boolean().default(false).optional(),
  track_inventory: z.boolean().default(true).optional(),
  allow_backorder: z.boolean().default(false).optional(),
  view_count: z.number().int().min(0).default(0).optional(),
  sales_count: z.number().int().min(0).default(0).optional(),
  rating: z.number().min(0).max(5).default(0).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  brand_id: z.string().uuid("ID de marca inválido").nullable().optional(),
})

export const productUpdateSchema = productDataSchema
  .partial() // Make all fields optional for updates
  .extend({
    id: z.string().uuid("ID de producto inválido"), // ID is required for update
  })
  .refine((data) => data.id !== undefined, {
    message: "Product ID is required for update.",
    path: ["id"],
  })

export type ProductData = z.infer<typeof productDataSchema>
export type ProductUpdateData = z.infer<typeof productUpdateSchema>
