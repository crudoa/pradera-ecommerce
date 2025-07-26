// This file defines the Category interface, which was previously missing or implicitly defined.
// It's necessary for type checking in components that interact with categories.
export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  created_at: string
  updated_at: string
}
