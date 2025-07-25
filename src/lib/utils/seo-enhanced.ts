import type { Metadata } from "next"

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article" | "product"
  author?: string
  publishedTime?: string
  modifiedTime?: string
  category?: string
  price?: number
  currency?: string
  availability?: "in_stock" | "out_of_stock" | "preorder"
}

export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = "/og-image.jpg",
    url = "https://agroperu.com",
    type = "website",
    author = "AgroPeru",
    publishedTime,
    modifiedTime,
    category,
    price,
    currency = "PEN",
    availability = "in_stock",
  } = config

  const fullTitle = `${title} | AgroPeru - Productos Agrícolas de Calidad`
  const fullDescription = `${description} Encuentra los mejores productos agrícolas y veterinarios en AgroPeru. Calidad garantizada y envío a todo el país.`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [...keywords, "agricultura", "veterinaria", "productos agrícolas", "Peru"].join(", "),
    authors: [{ name: author }],
    creator: author,
    publisher: "AgroPeru",

    // Open Graph
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: "AgroPeru",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "es_PE",
      type: type as any,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [image],
      creator: "@AgroPeruOficial",
      site: "@AgroPeruOficial",
    },

    // Robots
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

    // Verificación
    verification: {
      google: "tu-codigo-de-verificacion-google",
      yandex: "tu-codigo-de-verificacion-yandex",
    },

    // Datos estructurados para productos
    ...(type === "product" &&
      price &&
      category && {
        other: {
          "product:price:amount": price.toString(),
          "product:price:currency": currency,
          "product:availability": availability,
          "product:category": category,
        },
      }),
  }
}

// Función para generar JSON-LD
export function generateJSONLD(config: SEOConfig & { rating?: number; reviewCount?: number }) {
  const { title, description, image, url, price, currency, availability, rating, reviewCount, category } = config

  if (config.type === "product") {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: title,
      description,
      image,
      url,
      category,
      offers: {
        "@type": "Offer",
        price: price?.toString(),
        priceCurrency: currency,
        availability: `https://schema.org/${availability === "in_stock" ? "InStock" : "OutOfStock"}`,
        seller: {
          "@type": "Organization",
          name: "AgroPeru",
        },
      },
      ...(rating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount,
        },
      }),
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AgroPeru",
    description: "Productos agrícolas y veterinarios de calidad en Perú",
    url: "https://agroperu.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://agroperu.com/buscar?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }
}
