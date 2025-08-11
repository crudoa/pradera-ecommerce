"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react"

export function HeroBanner() {
  const backgroundImages = [
    "/images/hero-bg-1.webp",
    "/images/hero-bg-2.jpg",
    "/images/hero-bg-4.webp",
    "/images/hero-bg-5.webp",
  ]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 4000) // Cambia la imagen cada 4 segundos
    return () => clearInterval(interval)
  }, [backgroundImages.length])

  return (
    <section className="relative rounded-lg overflow-hidden mb-8 h-[400px] md:h-[500px] lg:h-[600px]">
      {/* Background Images */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <Image
            key={index}
            src={image || "/placeholder.svg"}
            alt={`Imagen de fondo ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            priority={index === 0} // Prioriza la carga de la primera imagen
          />
        ))}
      </div>
      {/* Overlay for gradient and black tint */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/30 to-accent z-10 opacity-60"></div>
      <div className="absolute inset-0 bg-black/10 z-10"></div>
      {/* Content */}
      <div className="relative z-20 px-4 py-8 md:px-8 md:py-12 md:py-16 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
          {/* Text Content */}
          <div className="text-white relative text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight relative z-20">
              ¡TODO LO QUE
              <br />
              NECESITAS
              <br />
              <span className="text-accent">AL ALCANCE DE</span>
              <br />
              <span className="text-accent">UN CLICK!</span>
            </h1>
            {/* Clover Logo behind slogan, positioned relative to its parent div */}
            <Image
              src="/images/clover-logo.png"
              alt="Pradera Clover Logo"
              width={200}
              height={200}
              className="absolute z-0 opacity-30 hidden lg:block" // z-0 to be behind text, hidden on small screens
              style={{
                top: "381px", // Adjust as needed
                right: "-510px", // Adjust as needed, use negative values to move it outside
                width: "clamp(20px, 10vw, 80px)", // Corrected clamp values
                height: "auto",
              }}
            />
            <p className="text-base md:text-lg mb-8 text-white/90 leading-relaxed relative z-20">
              
            </p>
            {/* Single Button */}
            <Link href="/buscar" className="relative z-20 inline-block">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-secondary font-semibold px-6 py-3 text-base md:px-8 md:py-3 md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Search className="h-5 w-5 mr-2" />
                Ver Productos
              </Button>
            </Link>
          </div>
          {/* The old image placeholder div is removed as it's replaced by rotating backgrounds and clover in text area */}
          <div className="hidden lg:block">{/* This div is intentionally left empty or can be reused if needed */}</div>
        </div>
      </div>
    </section>
  )
}
// Redeploy trigger - 2025-07-25
