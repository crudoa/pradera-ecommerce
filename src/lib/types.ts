// Tipos principales para la aplicación
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  original_price?: number
  image_url?: string
  category_id?: string
  category_name?: string
  brand?: string
  brand_id?: string
  inventory_quantity?: number
  is_featured?: boolean
  is_new?: boolean
  is_on_sale?: boolean
  rating?: number
  sku?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image_url?: string
  parent_id?: string
  is_active: boolean
  sort_order?: number
  created_at: string
  updated_at: string
  count?: number
}

export interface Brand {
  id: string
  name: string
  description?: string
  logo_url?: string
  website_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
}

export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  shipping_address: string
  payment_method: string
  items: CartItem[]
  created_at: string
  updated_at: string
  email?: string
  buyerName?: string
  order_number?: string
  payment_status?: string
}

// Tipos para filtros y búsqueda
export interface ProductFilters {
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  isOnSale?: boolean
  isNew?: boolean
  isFeatured?: boolean
  limit?: number
  offset?: number
}

export interface SearchParams {
  q?: string
  categoria?: string
  marca?: string
  precio_min?: string
  precio_max?: string
  filtro?: string
  orden?: string
  pagina?: string
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Tipos para el contexto del carrito
export interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isLoading: boolean
}

// Tipos para autenticación
export interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}
