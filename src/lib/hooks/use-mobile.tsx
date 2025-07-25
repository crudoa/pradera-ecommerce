"use client"

// src/hooks/use-mobile.tsx
import * as React from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // Tailwind's 'md' breakpoint is 768px
    }

    checkMobile() // Check on initial render
    window.addEventListener("resize", checkMobile) // Add event listener for resize

    return () => {
      window.removeEventListener("resize", checkMobile) // Clean up on unmount
    }
  }, [])

  return isMobile
}
