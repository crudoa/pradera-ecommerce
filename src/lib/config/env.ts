import { z } from "zod"

// Define the schema for environment variables
const envSchema = z.object({
  // Supabase Configuration (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"), // For direct database connection (e.g., for migrations, server actions)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),

  // Authentication Configuration
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required for authentication"),

  // Payment Configuration (Optional)
  NEXT_PUBLIC_CULQI_PUBLIC_KEY: z.string().optional(),
  CULQI_SECRET_KEY: z.string().optional(),
  PAGOEFECTIVO_ACCESS_KEY: z.string().optional(),

  // Shipping API Keys (Optional)
  OLVA_API_KEY: z.string().optional(),
  SHALOM_API_KEY: z.string().optional(),

  // External Validation/Data APIs (Optional)
  HUNTER_API_KEY: z.string().optional(), // For email validation
  APIS_PERU_TOKEN: z.string().optional(), // For DNI/RUC validation

  // Other Public Configuration
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),

  // CI/CD and Development specific (Optional)
  CI: z.string().optional(), // Common CI environment variable
  CUSTOM_KEY: z.string().optional(), // Example of a custom optional key
  PORT: z.string().optional(), // For local development port
})

// Parse and validate environment variables
export const env = envSchema.parse(process.env)

// Type for the environment variables
export type Env = z.infer<typeof envSchema>
