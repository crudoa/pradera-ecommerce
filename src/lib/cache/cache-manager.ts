// Consolidated all in-memory cache logic here, removing src/lib/cache/redis-cache.ts and src/lib/cache/redis.ts
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  tags?: string[]
}

interface CacheConfig {
  defaultTTL: number
  maxSize: number
  cleanupInterval: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  size: number
  memoryUsage: number
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    memoryUsage: 0,
  }

  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutos por defecto
    maxSize: 1000, // máximo 1000 items
    cleanupInterval: 60 * 1000, // limpieza cada minuto
  }

  private cleanupTimer?: NodeJS.Timeout

  constructor() {
    // Iniciar limpieza automática solo en el cliente
    if (typeof window !== "undefined") {
      this.startCleanup()
    }
  }

  // Configuración de TTL por tipo de dato
  private getTTL(key: string): number {
    if (key.includes("stock")) return 60 * 1000 // 1 minuto
    if (key.includes("price")) return 3 * 60 * 1000 // 3 minutos
    if (key.includes("product:details")) return 15 * 60 * 1000 // 15 minutos
    if (key.includes("product:list")) return 5 * 60 * 1000 // 5 minutos
    if (key.includes("categories")) return 60 * 60 * 1000 // 1 hora
    return this.config.defaultTTL
  }

  async get<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      if (process.env.NODE_ENV === "development") {
        console.log(`❌ CACHE MISS: ${key}`)
      }
      return { data: null, isStale: false }
    }

    const now = Date.now()
    const age = now - item.timestamp
    const isExpired = age > item.ttl
    const isStale = age > item.ttl * 0.8 // Stale si está al 80% del TTL

    if (isExpired) {
      this.cache.delete(key)
      this.stats.misses++
      if (process.env.NODE_ENV === "development") {
        console.log(`⏰ CACHE EXPIRED: ${key}`)
      }
      return { data: null, isStale: false }
    }

    this.stats.hits++
    if (process.env.NODE_ENV === "development") {
      const status = isStale ? "STALE" : "HIT"
      console.log(`✅ CACHE ${status}: ${key} (age: ${Math.round(age / 1000)}s)`)
    }

    return { data: item.data, isStale }
  }

  async set<T>(key: string, data: T, customTTL?: number, tags?: string[]): Promise<void> {
    const ttl = customTTL || this.getTTL(key)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    }

    // Verificar límite de tamaño
    if (this.cache.size >= this.config.maxSize) {
      await this.evictOldest()
    }

    this.cache.set(key, item)
    this.stats.sets++
    this.updateStats()

    if (process.env.NODE_ENV === "development") {
      console.log(`💾 CACHE SET: ${key} (TTL: ${Math.round(ttl / 1000)}s)`)
    }
  }

  async delete(key: string): Promise<void> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      this.updateStats()
      if (process.env.NODE_ENV === "development") {
        console.log(`🗑️ CACHE DELETE: ${key}`)
      }
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    let deletedCount = 0

    this.cache.forEach((item, key) => {
      if (item.tags && item.tags.includes(tag)) {
        this.cache.delete(key)
        deletedCount++
      }
    })

    if (deletedCount > 0) {
      this.stats.deletes += deletedCount
      this.updateStats()
      if (process.env.NODE_ENV === "development") {
        console.log(`🏷️ CACHE INVALIDATE TAG: ${tag} (${deletedCount} items deleted)`)
      }
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"))
    let deletedCount = 0

    this.cache.forEach((item, key) => {
      if (regex.test(key)) {
        this.cache.delete(key)
        deletedCount++
      }
    })

    if (deletedCount > 0) {
      this.stats.deletes += deletedCount
      this.updateStats()
      if (process.env.NODE_ENV === "development") {
        console.log(`🔍 CACHE INVALIDATE PATTERN: ${pattern} (${deletedCount} items deleted)`)
      }
    }
  }

  async clear(): Promise<void> {
    const size = this.cache.size
    this.cache.clear()
    this.stats.deletes += size
    this.updateStats()
    if (process.env.NODE_ENV === "development") {
      console.log(`🧹 CACHE CLEAR: ${size} items deleted`)
    }
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private async evictOldest(): Promise<void> {
    let oldestKey = ""
    let oldestTime = Date.now()

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    })

    if (oldestKey) {
      await this.delete(oldestKey)
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    this.cache.forEach((item, key) => {
      const age = now - item.timestamp
      if (age > item.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    })

    if (cleanedCount > 0) {
      this.stats.deletes += cleanedCount
      this.updateStats()
      if (process.env.NODE_ENV === "development") {
        console.log(`🧽 CACHE CLEANUP: ${cleanedCount} expired items removed`)
      }
    }
  }

  private updateStats(): void {
    this.stats.size = this.cache.size
    this.stats.memoryUsage = this.estimateMemoryUsage()
  }

  private estimateMemoryUsage(): number {
    let size = 0
    this.cache.forEach((item, key) => {
      size += key.length * 2 // string chars = 2 bytes each
      size += JSON.stringify(item).length * 2
    })
    return size
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.cache.clear()
  }
}

// Crear instancia singleton
export const cacheManager = new CacheManager()

// Limpiar al cerrar la aplicación
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    cacheManager.destroy()
  })
}
