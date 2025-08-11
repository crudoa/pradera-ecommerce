import { z } from "zod"

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre de la categoría debe tener al menos 2 caracteres.")
    .max(50, "El nombre de la categoría no puede exceder los 50 caracteres."),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe ser en minúsculas, sin espacios y con guiones.")
    .optional()
    .nullable(),
  description: z.string().nullable().optional(),
  image_url: z.string().url("URL de imagen inválida").nullable().optional(),
  is_active: z.boolean().optional().default(true),
})

export const categoryUpdateSchema = z.object({
  id: z.string().uuid("ID de categoría inválido."),
  name: z
    .string()
    .min(2, "El nombre de la categoría debe tener al menos 2 caracteres.")
    .max(50, "El nombre de la categoría no puede exceder los 50 caracteres."),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe ser en minúsculas, sin espacios y con guiones.")
    .optional()
    .nullable(),
  is_active: z.boolean(),
})

export type CategorySchema = z.infer<typeof categorySchema>
export type CategoryUpdateSchema = z.infer<typeof categoryUpdateSchema>
