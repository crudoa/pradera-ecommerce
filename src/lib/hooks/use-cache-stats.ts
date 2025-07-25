"use client"

import { useState, useEffect } from "react"
import { cacheManager } from "@/lib/cache/cache-manager"

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  size: number
  memoryUsage: number
  hitRate: number
  memoryUsageMB: number
}

export function useCacheStats() {
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    memoryUsage: 0,
    hitRate: 0,
    memoryUsageMB: 0,
  })

  useEffect(() => {
    const updateStats = () => {
      const rawStats = cacheManager.getStats()
      const hitRate =
        rawStats.hits + rawStats.misses > 0 ? (rawStats.hits / (rawStats.hits + rawStats.misses)) * 100 : 0
      const memoryUsageMB = rawStats.memoryUsage / (1024 * 1024)

      setStats({
        ...rawStats,
        hitRate: Math.round(hitRate * 100) / 100,
        memoryUsageMB: Math.round(memoryUsageMB * 100) / 100,
      })
    }

    // Actualizar inmediatamente
    updateStats()

    // Actualizar cada 5 segundos
    const interval = setInterval(updateStats, 5000)

    return () => clearInterval(interval)
  }, [])

  return stats
}
