import { z } from "zod"

// Validación para login
export const loginSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Formato de email inválido"),
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
})

// Validación para registro
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "El nombre es requerido")
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres"),
    lastName: z
      .string()
      .min(1, "El apellido es requerido")
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50, "El apellido no puede exceder 50 caracteres"),
    email: z.string().min(1, "El email es requerido").email("Formato de email inválido"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
      .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
        message: "Formato de teléfono inválido",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

// Validación para perfil de usuario
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, "El nombre completo es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email: z.string().min(1, "El email es requerido").email("Formato de email inválido"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
      message: "Formato de teléfono inválido",
    }),
  address: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "La dirección debe tener al menos 10 caracteres",
    }),
})

// Validación para checkout
export const checkoutSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(1, "El apellido es requerido").min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().min(1, "El email es requerido").email("Formato de email inválido"),
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(/^\+?[1-9]\d{1,14}$/, "Formato de teléfono inválido"),
  address: z.string().min(1, "La dirección es requerida").min(10, "La dirección debe tener al menos 10 caracteres"),
  city: z.string().min(1, "La ciudad es requerida").min(2, "La ciudad debe tener al menos 2 caracteres"),
  postalCode: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{5}$/.test(val), {
      message: "El código postal debe tener 5 dígitos",
    }),
  paymentMethod: z.enum(["card", "yape", "plin", "cash"], {
    required_error: "Selecciona un método de pago",
  }),
})

// Validación para búsqueda
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0, "El precio mínimo debe ser mayor a 0").optional(),
  maxPrice: z.number().min(0, "El precio máximo debe ser mayor a 0").optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(["name", "price", "created_at", "stock"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

// Validación para un item de la orden
export const orderItemSchema = z.object({
  tempId: z.string().uuid(), // Temporary ID for UI management
  productId: z.string().min(1, "Selecciona un producto."),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1."),
  price: z.number().min(0, "El precio no puede ser negativo."),
  productName: z.string().min(1, "El nombre del producto es requerido."),
})

export const orderFormSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido.").optional().or(z.literal("")),
  buyerName: z.string().min(1, "El nombre del comprador es requerido.").optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")), // Added email here
  shippingAddress: z.string().min(5, "La dirección de envío es requerida y debe tener al menos 5 caracteres."),
  totalAmount: z.number().min(0.01, "El monto total debe ser mayor a 0."),
  status: z.enum(["pending", "processing", "completed", "cancelled"], {
    errorMap: () => ({ message: "Estado de pedido inválido." }),
  }),
  paymentMethod: z.string().min(1, "El método de pago es requerido."),
  itemsJson: z.string().min(1, "Debe haber al menos un producto en la orden."), // This will be a JSON string of order items
  phone: z.string().min(1, "El teléfono es requerido."), // Made required based on error
})

// Tipos derivados de los esquemas
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type OrderFormData = z.infer<typeof orderFormSchema>
export type OrderItemData = z.infer<typeof orderItemSchema>

// New schemas for admin panel
export const productFormSchemaAdmin = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  price: z.number().min(0.01, "El precio debe ser mayor a 0."),
  stock: z.number().int().min(0, "El stock no puede ser negativo."),
  categoryId: z.string().uuid("ID de categoría inválido.").optional().or(z.literal("")),
  imageUrl: z.string().url("URL de imagen inválida.").optional().or(z.literal("")),
  sku: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  brand: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const categoryFormSchemaAdmin = z.object({
  name: z.string().min(1, "El nombre de la categoría es requerido."),
  description: z.string().optional(),
  imageUrl: z.string().url("URL de imagen inválida.").optional().or(z.literal("")),
  slug: z.string().min(1, "El slug es requerido."),
})

export const userProfileSchemaAdmin = z.object({
  full_name: z.string().min(1, "El nombre completo es requerido."),
  email: z.string().email("Email inválido."),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
})

export const forgotPasswordFormSchemaAdmin = z.object({
  email: z.string().email("Email inválido."),
})

export const resetPasswordFormSchemaAdmin = z
  .object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

export const twoFactorAuthSchemaAdmin = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos."),
})

export const bulkUploadSchemaAdmin = z.object({
  file: z.any().refine((file) => file?.length > 0, "El archivo es requerido."),
})
