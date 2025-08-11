"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Footer } from "@/components/layout/footer"
import { CheckoutFormProfessional } from "@/components/checkout/checkout-form-professional"
import Header from "@/components/layout/header"

export default function CheckoutPage() {
  const { items } = useCart()
  const router = useRouter()

  // Redirect if no items in cart
  useEffect(() => {
    if (items.length === 0) {
      router.push("/carrito")
    }
  }, [items, router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header hideSearchBar hideFavorites hideCart />

      <main className="container mx-auto py-8 flex-grow">
        <CheckoutFormProfessional />
      </main>
      <Footer />
    </div>
  )
}
