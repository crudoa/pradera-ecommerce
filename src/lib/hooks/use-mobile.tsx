"use client"

// src/hooks/use-mobile.tsx
import { useState, useEffect } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent
    const mobile = Boolean(
      userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Windows Phone|Mobi/i),
    )
    setIsMobile(mobile)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // Consider screens smaller than 768px as mobile
    }

    // Initial check
    handleResize()

    // Add event listener for window resize
    window.addEventListener("resize", handleResize)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}
