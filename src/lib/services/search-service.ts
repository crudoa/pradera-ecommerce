"use client"

import type { Product } from "@/types/product"
import { CacheManager } from "@/lib/utils/performance"

export interface SearchFilters {
  query?: string
  categories?: string[]
  brands?: string[]
  priceRange?: [number, number]
  sortBy?: "relevance" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest"
  inStock?: boolean
  page?: number
  limit?: number
}

export interface SearchResult {
  products: Product[]
  total: number
  page: number
  totalPages: number
  filters: {
    categories: Array<{ id: string; name: string; count: number }>
    brands: Array<{ id: string; name: string; count: number }>
    priceRange: { min: number; max: number }
  }
}

class SearchService {
  private baseUrl = "/api/search"

  async search(filters: SearchFilters): Promise<SearchResult> {
    const cacheKey = `search_${JSON.stringify(filters)}`

    // Verificar caché primero
    const cached = CacheManager.get<SearchResult>(cacheKey)
    if (cached) {
      console.log("🎯 Search result from cache")
      return cached
    }

    try {
      const params = new URLSearchParams()

      if (filters.query) params.append("q", filters.query)
      if (filters.categories?.length) params.append("categories", filters.categories.join(","))
      if (filters.brands?.length) params.append("brands", filters.brands.join(","))
      if (filters.priceRange) {
        params.append("minPrice", filters.priceRange[0].toString())
        params.append("maxPrice", filters.priceRange[1].toString())
      }
      if (filters.sortBy) params.append("sortBy", filters.sortBy)
      if (filters.inStock) params.append("inStock", "true")
      if (filters.page) params.append("page", filters.page.toString())
      if (filters.limit) params.append("limit", filters.limit.toString())

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Guardar en caché por 2 minutos
      CacheManager.set(cacheKey, result, 2)

      return result
    } catch (error) {
      console.error("❌ Search error:", error)
      throw error
    }
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return []

    const cacheKey = `suggestions_${query}`
    const cached = CacheManager.get<string[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseUrl}/suggestions?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`Suggestions failed: ${response.statusText}`)
      }

      const suggestions = await response.json()

      // Guardar en caché por 5 minutos
      CacheManager.set(cacheKey, suggestions, 5)

      return suggestions
    } catch (error) {
      console.error("❌ Suggestions error:", error)
      return []
    }
  }

  async getPopularSearches(): Promise<string[]> {
    const cacheKey = "popular_searches"
    const cached = CacheManager.get<string[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseUrl}/popular`)

      if (!response.ok) {
        throw new Error(`Popular searches failed: ${response.statusText}`)
      }

      const popular = await response.json()

      // Guardar en caché por 30 minutos
      CacheManager.set(cacheKey, popular, 30)

      return popular
    } catch (error) {
      console.error("❌ Popular searches error:", error)
      return []
    }
  }
}

export default new SearchService()
