"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/ui/product-card"
import { ProductSectionSkeleton } from "@/components/skeletons/product-section-skeleton"
import ProductService from "@/lib/services/products"
import type { Product } from "@/types/product"

interface ProductSectionProps {
  title: string
  category?: string
  limit?: number
  products?: Product[]
}

export default function ProductSection({ title, category, limit = 8, products: initialProducts }: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(!initialProducts)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        const filters = {
          category: category || undefined,
          limit,
          sortBy: "created_at" as const,
          sortOrder: "desc" as const,
        }

        const result = await ProductService.getProducts(filters)
        setProducts(result.data)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Error al cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    if (!initialProducts) {
      fetchProducts()
    }
  }, [category, limit, initialProducts])

  if (loading) {
    return <ProductSectionSkeleton title={title} />
  }

  if (error) {
    return (
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{title}</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{title}</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">No hay productos disponibles en esta categoría.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Solo el título, sin botón "Ver todos" */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
