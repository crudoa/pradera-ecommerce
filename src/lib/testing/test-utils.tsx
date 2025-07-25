import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import type { ReactElement } from "react"

// Importar los contextos desde las rutas correctas
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { FavoritesProvider } from "@/contexts/favorites-context"

// Wrapper con todos los providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  )
}

// Función de render personalizada
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Re-exportar todo
export * from "@testing-library/react"
export { customRender as render }

// Mocks útiles
export const mockProduct = {
  id: "1",
  name: "Producto Test",
  description: "Descripción del producto test",
  price: 100,
  image_url: "/test-image.jpg",
  category_id: "cat-1",
  category_name: "Categoría Test",
  brand: "Marca Test",
  sku: "TEST-001",
  stock: 10,
  weight: 1,
  is_featured: false,
  is_active: true,
}

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  created_at: "2024-01-01T00:00:00Z",
}

export const mockCartItem = {
  id: "1",
  name: "Producto Test",
  price: 100,
  quantity: 2,
  image: "/test-image.jpg",
  category: "Categoría Test",
}
