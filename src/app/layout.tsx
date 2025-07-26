import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/contexts/cart-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"
import FloatingElementsBackground from "@/components/floating-elements-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pradera - Servicios Generales E.I.R.L.",
  description:
    "Encuentra los mejores productos agrícolas, semillas, fertilizantes, herramientas y equipos para tu cultivo. Lo buscas, lo encuentras aquí.",
  keywords: "agricultura, productos agrícolas, semillas, fertilizantes, herramientas, equipos, cultivo, Perú",
  authors: [{ name: "Pradera" }],
  creator: "Pradera",
  publisher: "Pradera",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://Pradera.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pradera - Servicios Generales E.I.R.L.",
    description: "Encuentra los mejores productos agrícolas para tu cultivo",
    url: "https://Pradera.com",
    siteName: "Pradera",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pradera - Servicios Generales E.I.R.L.",
    description: "Encuentra los mejores productos agrícolas para tu cultivo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Added viewport meta tag to prevent zooming on input focus */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <FloatingElementsBackground />
                  {children}
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    toastOptions={{
                      duration: 4000,
                    }}
                  />
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
