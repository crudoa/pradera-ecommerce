"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { Toaster } from "sonner"
import Header from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface AppWrapperProps {
  children: React.ReactNode
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const pathname = usePathname()
  const isDashboardRoute = pathname.startsWith("/dashboard")

  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          {!isDashboardRoute && <Header />} {/* Conditionally render Header */}
          <main className={isDashboardRoute ? "" : "flex-grow"}>{children}</main>
          {!isDashboardRoute && <Footer />} {/* Conditionally render Footer */}
          <Toaster position="top-center" richColors />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  )
}
