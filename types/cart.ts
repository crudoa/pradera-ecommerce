export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url: string | null // Ensure image_url is defined and nullable
  category: string
  // Add any other properties that might be needed, e.g., slug, sku
}
