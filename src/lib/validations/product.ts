import { z } from "zod"

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  image: z.string().optional(),
  category_id: z.string().nullable().optional(),
  category_name: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  stock: z.number().default(0),
  weight: z.number().default(1),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const ProductFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(["name", "price", "created_at", "updated_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type Product = z.infer<typeof ProductSchema>
export type ProductFilter = z.infer<typeof ProductFilterSchema>

export const validateProduct = (data: unknown): Product | null => {
  try {
    return ProductSchema.parse(data)
  } catch (error) {
    console.error("Product validation error:", error)
    return null
  }
}

export const validateProductFilter = (data: unknown): ProductFilter | null => {
  try {
    return ProductFilterSchema.parse(data)
  } catch (error) {
    console.error("Product filter validation error:", error)
    return null
  }
}

// CartItem type for the shopping cart
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  weight: number
  quantity: number
}

// Product with reviews interface
export interface ProductWithReviews extends Product {
  reviews?: Array<{
    user_id: string
    created_at: string
  }>
  averageRating?: number
  reviewCount?: number
}
