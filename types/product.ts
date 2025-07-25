import { z } from "zod"
import type { Json } from "@/types/database"

// Base schema for product data, used for creation
export const productDataSchema = z.object({
  name: z.string().min(1, "El nombre es requerido.").max(255, "El nombre es demasiado largo."),
  description: z.string().nullable().optional(), // Allow null or undefined
  short_description: z.string().nullable().optional(), // Allow null or undefined
  price: z.number().min(0, "El precio no puede ser negativo."),
  original_price: z.number().nullable().optional(), // Allow null or undefined
  sku: z.string().min(1, "El SKU es requerido.").max(50, "El SKU es demasiado largo."),
  slug: z.string().nullable().optional(), // Allow null or undefined
  brand: z.string().nullable().optional(), // Allow null or undefined
  weight: z.number().nullable().optional(), // Allow null or undefined
  dimensions: z.union([z.record(z.any()), z.null()]).optional(), // Allow JSON object or null
  stock_quantity: z.number().int().min(0, "El stock no puede ser negativo."), // Matches DB column name
  category_id: z.string().uuid("ID de categoría inválido."),
  image_url: z.string().url("URL de imagen inválida.").nullable().optional(), // Allow null or undefined
  is_active: z.boolean().default(true).optional(),
  is_featured: z.boolean().default(false).optional(),
  is_new: z.boolean().default(true).optional(),
  track_inventory: z.boolean().default(true).optional(),
  allow_backorder: z.boolean().default(false).optional(),
  view_count: z.number().int().min(0).default(0).optional(),
  sales_count: z.number().int().min(0).default(0).optional(),
  rating: z.number().min(0).max(5).default(0).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  brand_id: z.string().uuid().nullable().optional(),
  specifications: z.union([z.record(z.any()), z.null()]).optional(), // Allow JSON object or null
})

// Schema for product updates, making all fields optional except id
export const productUpdateSchema = productDataSchema
  .partial()
  .extend({
    id: z.string().uuid("ID de producto inválido.").optional(), // ID is optional for the schema, but required for the API route
    // Removed 'stock' field from here. 'stock_quantity' is inherited from productDataSchema.partial()
  })
  .refine((data) => data.id !== undefined, {
    message: "Product ID is required for update.",
    path: ["id"],
  })

// Schema for product deletion
export const productDeleteSchema = z.object({
  id: z.string().uuid("ID de producto inválido."),
})

export type ProductData = z.infer<typeof productDataSchema>
export type ProductUpdateData = z.infer<typeof productUpdateSchema>

// Interface for the Product as used in the frontend application
// Note: 'stock' is used here, which maps to 'stock_quantity' in the database.
export interface Product {
  id: string
  name: string
  description: string | null // Can be null
  short_description: string | null // Can be null
  price: number
  original_price: number | null // Can be null
  sku: string
  slug: string | null // Can be null
  brand: string | null // Can be null
  weight: number | null // Can be null
  dimensions: Json | null // Can be null
  stock: number // Renamed from stock_quantity for frontend use
  category_id: string
  image_url: string | null // Can be null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  track_inventory: boolean
  allow_backorder: boolean
  view_count: number
  sales_count: number
  rating: number
  meta_title: string | null
  meta_description: string | null
  tags: string[] | null
  brand_id: string | null
  specifications: Json | null // Can be null
  created_at: string
  updated_at: string
  category_name: string | null // For displaying category name in product lists
  category: string | null // Alias for category_name, used in some contexts
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface ProductUploadStatus extends ProductData {
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}
