"use client"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Footer } from "@/components/layout/footer"
import { CheckoutFormProfessional } from "@/components/checkout/checkout-form-professional"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
      {/* More elaborate "Regresar al inicio" link at the top */}
      <div className="w-full bg-white shadow-md py-4 border-b border-gray-200">
        {/* Adjusted padding and removed container classes */}
        <div className="flex justify-start pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
          <Link href="/" passHref>
            <Button
              variant="outline"
              className="flex items-center space-x-2 py-2 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Regresar al inicio</span>
            </Button>
          </Link>
        </div>
      </div>

      <main className="container mx-auto py-8 flex-grow">
        <CheckoutFormProfessional />
      </main>
      <Footer />
    </div>
  )
}
