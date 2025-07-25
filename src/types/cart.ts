export interface CartItem {
  id: string
  name: string
  price: number
  image_url: string // Changed from 'image' to 'image_url' to match product type
  quantity: number // Added quantity
  category: string
  brand: string
  stock: number // Current stock of the product
}
