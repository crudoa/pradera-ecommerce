"use client"

import { useState, useEffect, useRef } from "react"

export const useLazyLoading = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.unobserve(element)
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
        ...options,
      },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasLoaded, options])

  return { elementRef, isVisible, hasLoaded }
}

export const useImageLazyLoading = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string>("/placeholder.svg?height=200&width=200")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const { elementRef, isVisible } = useLazyLoading()

  useEffect(() => {
    if (isVisible && src && !isLoaded) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
      img.onerror = () => {
        setIsError(true)
        setIsLoaded(true)
      }
      img.src = src
    }
  }, [isVisible, src, isLoaded])

  return { elementRef, imageSrc, isLoaded, isError }
}
