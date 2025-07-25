import type { Metadata } from "next"

interface SEOProps {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
  type?: "website" | "article"
}

export function generateSEO({
  title,
  description,
  keywords,
  image = "/og-image.jpg",
  url = "",
  type = "website",
}: SEOProps): Metadata {
  const siteName = "AgroPeru"
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`

  return {
    title: fullTitle,
    description,
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "es_PE",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

export function generateProductSEO(product: {
  name: string
  description: string
  price: number
  image?: string
  category?: string
}) {
  return generateSEO({
    title: product.name,
    description: `${product.description} - Precio: S/ ${product.price}`,
    keywords: `${product.name}, ${product.category}, agricultura, productos agrícolas, Perú`,
    image: product.image,
    type: "website",
  })
}

export function generateCategorySEO(category: {
  name: string
  description?: string
  productCount?: number
}) {
  return generateSEO({
    title: `${category.name} - Productos Agrícolas`,
    description:
      category.description ||
      `Encuentra los mejores productos de ${category.name} para tu cultivo. ${category.productCount ? `${category.productCount} productos disponibles.` : ""}`,
    keywords: `${category.name}, productos agrícolas, agricultura, Perú`,
    type: "website",
  })
}
