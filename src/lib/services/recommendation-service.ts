"use client"

import type { Product } from "@/types/product"
import { CacheManager } from "@/lib/utils/performance"

export interface RecommendationOptions {
  userId?: string
  productId?: string
  categoryId?: string
  limit?: number
  type?: "similar" | "frequently-bought" | "recommended-for-you" | "trending"
}

class RecommendationService {
  private baseUrl = "/api/recommendations"

  async getRecommendations(options: RecommendationOptions): Promise<Product[]> {
    const cacheKey = `recommendations_${JSON.stringify(options)}`

    // Verificar caché primero
    const cached = CacheManager.get<Product[]>(cacheKey)
    if (cached) {
      console.log("🎯 Recommendations from cache")
      return cached
    }

    try {
      const params = new URLSearchParams()

      if (options.userId) params.append("userId", options.userId)
      if (options.productId) params.append("productId", options.productId)
      if (options.categoryId) params.append("categoryId", options.categoryId)
      if (options.limit) params.append("limit", options.limit.toString())
      if (options.type) params.append("type", options.type)

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Recommendations failed: ${response.statusText}`)
      }

      const recommendations = await response.json()

      // Guardar en caché por 10 minutos
      CacheManager.set(cacheKey, recommendations, 10)

      return recommendations
    } catch (error) {
      console.error("❌ Recommendations error:", error)
      return []
    }
  }

  async getSimilarProducts(productId: string, limit = 4): Promise<Product[]> {
    return this.getRecommendations({
      productId,
      limit,
      type: "similar",
    })
  }

  async getFrequentlyBoughtTogether(productId: string, limit = 3): Promise<Product[]> {
    return this.getRecommendations({
      productId,
      limit,
      type: "frequently-bought",
    })
  }

  async getPersonalizedRecommendations(userId: string, limit = 8): Promise<Product[]> {
    return this.getRecommendations({
      userId,
      limit,
      type: "recommended-for-you",
    })
  }

  async getTrendingProducts(limit = 6): Promise<Product[]> {
    return this.getRecommendations({
      limit,
      type: "trending",
    })
  }

  // Registrar interacción del usuario para mejorar recomendaciones
  async trackUserInteraction(data: {
    userId?: string
    productId: string
    action: "view" | "add-to-cart" | "purchase" | "like" | "share"
    timestamp?: number
  }): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          timestamp: data.timestamp || Date.now(),
        }),
      })
    } catch (error) {
      console.error("❌ Track interaction error:", error)
    }
  }
}

export default new RecommendationService()
