import { supabase } from "@/lib/supabase/client"
import type { Product } from "@/types/product"

// Función para transformar datos de la base de datos al tipo Product
const transformProduct = (dbProduct: any): Product => {
  return {
    category: dbProduct.categories?.name || null, // Added to satisfy Product interface
    id: dbProduct.id,
    name: dbProduct.name || "Sin nombre",
    description: dbProduct.description ?? null, // Ensure description is string | null
    short_description: dbProduct.short_description ?? null,
    price: Number(dbProduct.price) || 0,
    image_url: dbProduct.image_url ?? null,
    category_id: dbProduct.category_id,
    category_name: dbProduct.categories?.name || null,
    brand: dbProduct.brand || null,
    stock: Number(dbProduct.stock_quantity) || 0, // Map 'stock_quantity' from DB to 'stock' in Product
    is_active: dbProduct.is_active ?? false, // Ensure is_active is boolean
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    sku: dbProduct.sku,
    weight: dbProduct.weight ?? null,
    dimensions: dbProduct.dimensions ?? null,
    specifications: dbProduct.specifications || null,
    original_price: dbProduct.original_price ? Number(dbProduct.original_price) : null,
    slug: dbProduct.slug,
    is_featured: dbProduct.is_featured ?? false,
    is_new: dbProduct.is_new ?? false,
    track_inventory: dbProduct.track_inventory ?? false,
    allow_backorder: dbProduct.allow_backorder ?? false,
    view_count: dbProduct.view_count ?? 0,
    sales_count: dbProduct.sales_count ?? 0,
    rating: dbProduct.rating ?? 0,
    meta_title: dbProduct.meta_title ?? null,
    meta_description: dbProduct.meta_description ?? null,
    tags: dbProduct.tags ?? null,
    brand_id: dbProduct.brand_id ?? null,
  }
}

class ProductService {
  static async getFeaturedProducts(limit = 8): Promise<Product[]> {
    try {
      console.log("🔍 Obteniendo productos destacados...")

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories(name, slug)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("❌ Error obteniendo productos destacados:", error)
        return []
      }

      console.log("✅ Productos destacados obtenidos:", data?.length || 0)

      if (!data || !Array.isArray(data)) {
        console.warn("⚠️ No se obtuvieron datos válidos")
        return []
      }

      return data.map((product) =>
        transformProduct({
          ...product,
          category_name: product.categories?.name || null,
        }),
      )
    } catch (error) {
      console.error("❌ Error en getFeaturedProducts:", error)
      return []
    }
  }

  static async getNewProducts(limit = 4): Promise<Product[]> {
    try {
      console.log("🔍 Obteniendo productos nuevos...")

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories(name, slug)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("❌ Error obteniendo productos nuevos:", error)
        return []
      }

      console.log("✅ Productos nuevos obtenidos:", data?.length || 0)

      if (!data || !Array.isArray(data)) {
        console.warn("⚠️ No se obtuvieron datos válidos")
        return []
      }

      return data.map((product) =>
        transformProduct({
          ...product,
          category_name: product.categories?.name || null,
        }),
      )
    } catch (error) {
      console.error("❌ Error en getNewProducts:", error)
      return []
    }
  }

  static async getCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
    try {
      console.log("🔍 Obteniendo categorías...")

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("❌ Error obteniendo categorías:", error)
        return []
      }

      console.log("✅ Categorías obtenidas:", data?.length || 0)

      return data || []
    } catch (error) {
      console.error("❌ Error en getCategories:", error)
      return []
    }
  }

  static async getProducts(filters: any): Promise<{ data: Product[] }> {
    try {
      console.log("🔍 Obteniendo productos con filtros:", filters)

      let queryBuilder = supabase
        .from("products")
        .select(`
          *,
          categories(name, slug)
        `)
        .eq("is_active", true)

      if (filters.category) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("name", filters.category)
          .single()

        if (categoryData) {
          queryBuilder = queryBuilder.eq("category_id", categoryData.id)
        }
      }

      if (filters.limit) {
        queryBuilder = queryBuilder.limit(filters.limit)
      }

      if (filters.sortBy && filters.sortOrder) {
        queryBuilder = queryBuilder.order(filters.sortBy, { ascending: filters.sortOrder === "asc" })
      }

      const { data, error } = await queryBuilder

      if (error) {
        console.error("❌ Error obteniendo productos:", error)
        return { data: [] }
      }

      console.log("✅ Productos obtenidos:", data?.length || 0)

      if (!data || !Array.isArray(data)) {
        console.warn("⚠️ No se obtuvieron datos válidos")
        return { data: [] }
      }

      const transformedData = data.map((product) =>
        transformProduct({
          ...product,
          category_name: product.categories?.name || null,
        }),
      )

      return { data: transformedData }
    } catch (error) {
      console.error("❌ Error en getProducts:", error)
      return { data: [] }
    }
  }

  static async searchProducts(filters: any): Promise<{ data: Product[] }> {
    try {
      console.log("🔍 Buscando productos con filtros:", filters)

      let queryBuilder = supabase
        .from("products")
        .select(`
          *,
          categories(name, slug)
        `)
        .eq("is_active", true)

      if (filters.query && filters.query.trim()) {
        queryBuilder = queryBuilder.or(`name.ilike.%${filters.query}%, description.ilike.%${filters.query}%`)
      }

      if (filters.category) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("name", filters.category)
          .single()

        if (categoryData) {
          queryBuilder = queryBuilder.eq("category_id", categoryData.id)
        }
      }

      if (filters.minPrice) {
        queryBuilder = queryBuilder.gte("price", filters.minPrice)
      }

      if (filters.maxPrice) {
        queryBuilder = queryBuilder.lte("price", filters.maxPrice)
      }

      if (filters.inStock) {
        queryBuilder = queryBuilder.gt("stock_quantity", 0)
      }

      if (filters.limit) {
        queryBuilder = queryBuilder.limit(filters.limit)
      }

      if (filters.sortBy && filters.sortOrder) {
        queryBuilder = queryBuilder.order(filters.sortBy, { ascending: filters.sortOrder === "asc" })
      }

      const { data, error } = await queryBuilder

      if (error) {
        console.error("❌ Error buscando productos:", error)
        return { data: [] }
      }

      console.log("✅ Productos encontrados:", data?.length || 0)

      if (!data || !Array.isArray(data)) {
        console.warn("⚠️ No se obtuvieron datos válidos en búsqueda")
        return { data: [] }
      }

      const transformedData = data.map((product) =>
        transformProduct({
          ...product,
          category_name: product.categories?.name || null,
        }),
      )

      return { data: transformedData }
    } catch (error) {
      console.error("❌ Error en searchProducts:", error)
      return { data: [] }
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      console.log("🔍 Obteniendo producto por ID:", id)

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories(name, slug)
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("❌ Error obteniendo producto:", error)
        return null
      }

      if (!data) {
        console.warn("⚠️ No se encontró el producto")
        return null
      }

      console.log("✅ Producto obtenido:", data.name)

      return transformProduct({
        ...data,
        category_name: data.categories?.name || null,
      })
    } catch (error) {
      console.error("❌ Error en getProductById:", error)
      return null
    }
  }

  static async getProductsByCategory(categorySlug: string, limit = 20): Promise<Product[]> {
    try {
      console.log("🔍 Obteniendo productos por categoría:", categorySlug)

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories!inner(name, slug)
        `)
        .eq("is_active", true)
        .eq("categories.slug", categorySlug)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("❌ Error obteniendo productos por categoría:", error)
        return []
      }

      console.log("✅ Productos por categoría obtenidos:", data?.length || 0)

      if (!data || !Array.isArray(data)) {
        console.warn("⚠️ No se obtuvieron datos válidos por categoría")
        return []
      }

      return data.map((product) =>
        transformProduct({
          ...product,
          category_name: product.categories?.name || null,
        }),
      )
    } catch (error) {
      console.error("❌ Error en getProductsByCategory:", error)
      return []
    }
  }

  static async getAllProducts(): Promise<Product[]> {
    try {
      console.log("🔍 Obteniendo todos los productos...")

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories(name, slug)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo todos los productos:", error)
        return []
      }

      console.log("✅ Todos los productos obtenidos:", data?.length || 0)

      if (!data || !Array.isArray(data)) {
        console.warn("⚠️ No se obtuvieron datos válidos")
        return []
      }

      return data.map((product) =>
        transformProduct({
          ...product,
          category_name: product.categories?.name || null,
        }),
      )
    } catch (error) {
      console.error("❌ Error en getAllProducts:", error)
      return []
    }
  }
}

export default ProductService

export const getProducts = () => ProductService.getAllProducts()
export const getCategories = () => ProductService.getCategories()
export const getFeaturedProducts = (limit?: number) => ProductService.getFeaturedProducts(limit)
export const getNewProducts = (limit?: number) => ProductService.getNewProducts(limit)
export const searchProducts = (query: string, filters?: any) => ProductService.searchProducts({ query, ...filters })
export const getProductById = (id: string) => ProductService.getProductById(id)
export const getProductsByCategory = (categorySlug: string, limit?: number) =>
  ProductService.getProductsByCategory(categorySlug, limit)
