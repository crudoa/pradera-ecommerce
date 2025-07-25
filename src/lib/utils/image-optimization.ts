// Utilidades para optimización de imágenes

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "avif" | "jpeg" | "png"
  blur?: boolean
}

export function optimizeImageUrl(src: string, options: ImageOptimizationOptions = {}): string {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
    return src
  }

  const { width, height, quality = 80, format = "webp", blur = false } = options

  // Si es una imagen de Supabase Storage
  if (src.includes("supabase")) {
    const url = new URL(src)
    const params = new URLSearchParams()

    if (width) params.append("width", width.toString())
    if (height) params.append("height", height.toString())
    params.append("quality", quality.toString())
    params.append("format", format)
    if (blur) params.append("blur", "5")

    return `${url.origin}${url.pathname}?${params.toString()}`
  }

  // Para otras imágenes, usar el optimizador de Next.js
  const params = new URLSearchParams()
  params.append("url", encodeURIComponent(src))
  if (width) params.append("w", width.toString())
  if (height) params.append("h", height.toString())
  params.append("q", quality.toString())

  return `/_next/image?${params.toString()}`
}

// Generar srcSet para imágenes responsivas
export function generateSrcSet(src: string, sizes: number[] = [320, 640, 768, 1024, 1280, 1920]): string {
  return sizes
    .map((size) => {
      const optimizedUrl = optimizeImageUrl(src, { width: size })
      return `${optimizedUrl} ${size}w`
    })
    .join(", ")
}

// Generar sizes attribute para imágenes responsivas
export function generateSizes(breakpoints: Record<string, string> = {}): string {
  const defaultBreakpoints = {
    "(max-width: 640px)": "100vw",
    "(max-width: 768px)": "50vw",
    "(max-width: 1024px)": "33vw",
    ...breakpoints,
  }

  const sizeEntries = Object.entries(defaultBreakpoints)
  const mediaQueries = sizeEntries.slice(0, -1).map(([query, size]) => `${query} ${size}`)
  const defaultSize = sizeEntries[sizeEntries.length - 1][1]

  return [...mediaQueries, defaultSize].join(", ")
}

// Placeholder blur data URL
export function generateBlurDataURL(width = 8, height = 8): string {
  const canvas = typeof window !== "undefined" ? document.createElement("canvas") : null
  if (!canvas) {
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
  }

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")

  if (ctx) {
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, width, height)
  }

  return canvas.toDataURL("image/jpeg", 0.1)
}

// Detectar si el navegador soporta WebP
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src =
      "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
  })
}

// Lazy loading con Intersection Observer
export function createImageObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver(callback, defaultOptions)
}
