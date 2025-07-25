export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  product_name: string // Added for display purposes
  created_at: string
  updated_at: string
}

export interface OrderDetails {
  customer_name: string | undefined
  buyer_name: string | undefined
  phone: string | undefined
  id: string
  user_id: string
  order_number: string
  total_amount: number
  status: "pending" | "processing" | "completed" | "cancelled"
  payment_method: string
  shipping_address: string
  payment_status: "pending" | "paid" | "refunded" | "failed"
  created_at: string
  updated_at: string
  // Relationships (optional, depending on how data is fetched)
  order_items?: OrderItem[]
  // Add email and buyerName here as they are part of the order details
  email?: string // Add email
  buyerName?: string // Add buyerName
}
