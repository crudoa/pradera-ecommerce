/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.**", // Cubre .co, .in, .io, .com
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.twitter.com",
      },
      {
        protocol: "https",
        hostname: "**.linkedin.com",
      },
      {
        protocol: "https",
        hostname: "**.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "**.youtube.com",
      },
      {
        protocol: "https",
        hostname: "**.vimeo.com",
      },
      {
        protocol: "https",
        hostname: "**.flickr.com",
      },
      {
        protocol: "https",
        hostname: "**.pinterest.com",
      },
      {
        protocol: "https",
        hostname: "**.medium.com",
      },
      {
        protocol: "https",
        hostname: "**.dev.to",
      },
      {
        protocol: "https",
        hostname: "**.hashnode.dev",
      },
      {
        protocol: "https",
        hostname: "**.cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "**.builder.io",
      },
      {
        protocol: "https",
        hostname: "**.shopify.com",
      },
      {
        protocol: "https",
        hostname: "**.bigcommerce.com",
      },
      {
        protocol: "https",
        hostname: "**.woocommerce.com",
      },
      {
        protocol: "https",
        hostname: "**.magento.com",
      },
      {
        protocol: "https",
        hostname: "**.prestashop.com",
      },
      {
        protocol: "https",
        hostname: "**.opencart.com",
      },
      {
        protocol: "https",
        hostname: "**.drupal.org",
      },
      {
        protocol: "https",
        hostname: "**.wordpress.org",
      },
      {
        protocol: "https",
        hostname: "**.joomla.org",
      },
      {
        protocol: "https",
        hostname: "**.squarespace.com",
      },
      {
        protocol: "https",
        hostname: "**.wix.com",
      },
      {
        protocol: "https",
        hostname: "**.webflow.com",
      },
      {
        protocol: "https",
        hostname: "**.framer.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel.**", // Cubre .com, .app
      },
      {
        protocol: "https",
        hostname: "**.netlify.com",
      },
      {
        protocol: "https",
        hostname: "**.aws.amazon.com",
      },
      {
        protocol: "https",
        hostname: "**.azure.com",
      },
      {
        protocol: "https",
        hostname: "**.google.com",
      },
      {
        protocol: "https",
        hostname: "**.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "**.linode.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
      {
        protocol: "https",
        hostname: "**.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "**.unpkg.com",
      },
      {
        protocol: "https",
        hostname: "**.v0.dev",
      },
      {
        protocol: "https",
        hostname: "**.imgix.net", // CDN de imágenes popular
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com", // CDN de imágenes popular
      },
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com", // Patrón común para S3
      },
    ],
    unoptimized: true,
  },
  // Optional: Add a custom webpack configuration
  webpack: (config, { isServer }) => {
    // Example: Add a rule for handling .mjs files if needed
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    return config;
  },
};

export default nextConfig;
