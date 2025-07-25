"use client"

// Performance optimization utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(label: string): void {
    this.metrics.set(label, performance.now())
  }

  endTimer(label: string): number {
    const startTime = this.metrics.get(label)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
    this.metrics.delete(label)
    return duration
  }

  measureAsync<T>(label: string, asyncFn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startTimer(label)
      try {
        const result = await asyncFn()
        this.endTimer(label)
        resolve(result)
      } catch (error) {
        this.endTimer(label)
        reject(error)
      }
    })
  }
}

// Image optimization utilities
export const optimizeImageUrl = (url: string, width?: number, height?: number, quality = 80): string => {
  if (!url) return "/placeholder.svg?height=200&width=200"

  // Si es una URL de Supabase Storage, agregar parámetros de optimización
  if (url.includes("supabase")) {
    const params = new URLSearchParams()
    if (width) params.append("width", width.toString())
    if (height) params.append("height", height.toString())
    params.append("quality", quality.toString())
    params.append("format", "webp")

    return `${url}?${params.toString()}`
  }

  return url
}

// Lazy loading utilities
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Cache utilities
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static set(key: string, data: any, ttlMinutes = 5): void {
    const ttl = ttlMinutes * 60 * 1000 // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  static clear(): void {
    this.cache.clear()
  }

  static has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

// Bundle size optimization
export const loadComponentLazy = <T extends React.ComponentType<any>>(importFn: () => Promise<{ default: T }>) => {
  return React.lazy(importFn)
}

// Performance metrics
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === "production") {
    // Enviar métricas a servicio de analytics
    console.log("📊 Web Vital:", metric)
  }
}

import React from "react"
