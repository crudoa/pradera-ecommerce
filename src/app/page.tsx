import { HomePage } from "@/components/pages/home-page"
import { ErrorBoundary } from "@/components/error-boundary"
import ProductService from "@/lib/services/products" // Import ProductService
import { Product } from "@/types/product"

export default async function Page() {
  let initialFeaturedProducts: Product[] = []
  let initialNewProducts: Product[] = []
  let initialCategories: { id: string; name: string; slug: string }[] = []
  let initialError: string | null = null

  try {
    // Fetch data on the server
    const [featured, newProducts, categories] = await Promise.all([
      ProductService.getFeaturedProducts(),
      ProductService.getNewProducts(),
      ProductService.getCategories(),
    ])

    initialFeaturedProducts = featured
    initialNewProducts = newProducts
    initialCategories = categories
  } catch (error) {
    console.error("Error fetching initial data for home page:", error)
    initialError = "Error al cargar los datos iniciales. Por favor, inténtalo de nuevo más tarde."
  }

  return (
    <ErrorBoundary context="Home Page">
      <HomePage
        initialFeaturedProducts={initialFeaturedProducts}
        initialNewProducts={initialNewProducts}
        initialCategories={initialCategories}
        initialError={initialError}
      />
    </ErrorBoundary>
  )
}
