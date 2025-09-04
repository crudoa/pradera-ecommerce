"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Leaf,
  Shield,
  Truck,
  Users,
  MapPin,
  Star,
  Award,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  TrendingUp,
  Zap,
} from "lucide-react"
import Link from "next/link"

export function WelcomeHero() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [currentProductImage, setCurrentProductImage] = useState(0)
  const [animatedStats, setAnimatedStats] = useState({ clients: 0, products: 0, experience: 0 })
  const [sectionsInView, setSectionsInView] = useState<{ [key: string]: boolean }>({})
  const heroRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  const features = [
    {
      icon: Leaf,
      title: "Productos Agrícolas Premium",
      description:
        "Semillas certificadas INIA, fertilizantes orgánicos importados y herramientas de última generación para maximizar tu productividad agrícola",
      stats: "500+ productos",
      gradient: "from-green-500/20 to-emerald-500/10",
      hoverGradient: "hover:from-green-500/30 hover:to-emerald-500/20",
    },
    {
      icon: Shield,
      title: "Veterinaria Especializada",
      description:
        "Medicamentos registrados SENASA, vacunas importadas y suplementos nutricionales especializados para ganado de alta producción",
      stats: "200+ medicamentos",
      gradient: "from-blue-500/20 to-cyan-500/10",
      hoverGradient: "hover:from-blue-500/30 hover:to-cyan-500/20",
    },
    {
      icon: Truck,
      title: "Logística Especializada",
      description:
        "Red de distribución propia con vehículos refrigerados, entrega gratuita en Ayacucho y envíos express certificados a Lima",
      stats: "24-48 horas",
      gradient: "from-orange-500/20 to-yellow-500/10",
      hoverGradient: "hover:from-orange-500/30 hover:to-yellow-500/20",
    },
    {
      icon: Users,
      title: "Asesoría Técnica Especializada",
      description:
        "Equipo de ingenieros agrónomos y veterinarios con especialización en cultivos andinos y sistemas ganaderos intensivos",
      stats: "15+ años exp.",
      gradient: "from-purple-500/20 to-pink-500/10",
      hoverGradient: "hover:from-purple-500/30 hover:to-pink-500/20",
    },
  ]

  const testimonials = [
    {
      name: "Carlos Mendoza Quispe",
      role: "Agricultor Certificado - Huanta",
      company: "Asociación de Productores de Papa",
      text: "Gracias a los fertilizantes orgánicos de Pradera, mi producción de papa nativa aumentó 40% y ahora exporto a mercados internacionales. Su asesoría técnica fue clave.",
      rating: 5,
      image: "/agricultor-trabajando-en-chacra-ayacucho.jpg",
    },
    {
      name: "María Quispe Huamán",
      role: "Ganadera Especializada - San José de Ticllas",
      company: "Cooperativa Ganadera Los Andes",
      text: "Los medicamentos veterinarios llegaron en tiempo récord y salvaron mi ganado Holstein de una epidemia. La calidad y efectividad son excepcionales.",
      rating: 5,
      image: "/ganado-pastando-en-praderas-andinas.jpg",
    },
    {
      name: "José Huamán Ccahuana",
      role: "Presidente - Vinchos",
      company: "Cooperativa Agrícola Quinua Real",
      text: "La asesoría técnica de Pradera transformó nuestros cultivos de quinua. Ahora exportamos quinua orgánica certificada a Europa y Estados Unidos.",
      rating: 5,
      image: "/campos-de-cultivo-en-ayacucho-monta-as.jpg",
    },
  ]

  const coverageAreas = [
    { city: "Ayacucho Centro", delivery: "Entrega gratuita", time: "2-4 horas", icon: "🏛️" },
    { city: "Huanta", delivery: "Entrega gratuita", time: "6-12 horas", icon: "🌾" },
    { city: "San José de Ticllas", delivery: "Entrega gratuita", time: "12-24 horas", icon: "🐄" },
    { city: "Lima Metropolitana", delivery: "Envío express", time: "24-48 horas", icon: "🏙️" },
  ]

  const productImages = [
    {
      url: "/semillas-de-papa-andina-certificadas.jpg",
      alt: "Semillas Certificadas INIA",
      category: "Semillas Premium",
    },
    {
      url: "/fertilizantes-org-nicos-para-cultivos.jpg",
      alt: "Fertilizantes Orgánicos Importados",
      category: "Nutrición Vegetal",
    },
    {
      url: "/medicamentos-veterinarios-para-ganado.jpg",
      alt: "Medicamentos Veterinarios SENASA",
      category: "Salud Animal",
    },
    { url: "/herramientas-agr-colas-modernas.jpg", alt: "Herramientas de Precisión", category: "Tecnología Agrícola" },
  ]

  const landscapeImages = [
    { url: "/campos-de-cultivo-en-ayacucho-monta-as.jpg", alt: "Campos Ayacucho" },
    { url: "/ganado-pastando-en-praderas-andinas.jpg", alt: "Ganadería andina" },
    { url: "/agricultor-trabajando-en-chacra-ayacucho.jpg", alt: "Agricultura local" },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionsInView((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 },
    )

    const sections = [statsRef.current, featuresRef.current, testimonialsRef.current]
    sections.forEach((section) => {
      if (section) {
        section.id = section.className.includes("stats")
          ? "stats"
          : section.className.includes("features")
            ? "features"
            : "testimonials"
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (sectionsInView.stats) {
      const animateStats = () => {
        const duration = 2000
        const steps = 60
        const stepDuration = duration / steps

        let currentStep = 0
        const interval = setInterval(() => {
          const progress = currentStep / steps
          const easeOut = 1 - Math.pow(1 - progress, 3)

          setAnimatedStats({
            clients: Math.floor(easeOut * 1000),
            products: Math.floor(easeOut * 500),
            experience: Math.floor(easeOut * 15),
          })

          currentStep++
          if (currentStep > steps) clearInterval(interval)
        }, stepDuration)
      }

      setTimeout(animateStats, 300)
    }
  }, [sectionsInView.stats])

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    const productInterval = setInterval(() => {
      setCurrentProductImage((prev) => (prev + 1) % productImages.length)
    }, 4000)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearInterval(testimonialInterval)
      clearInterval(productInterval)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 overflow-hidden relative min-h-screen"
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
          style={{
            backgroundImage: `url('/ayacucho-landscape-agriculture-mountains.jpg')`,
            transform: `translateY(${scrollY * 0.2}px) scale(${1 + scrollY * 0.0001})`,
          }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 opacity-40"
          style={{
            backgroundImage: `url('/campos-verdes-ayacucho-agricultura.jpg')`,
            transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0002})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-slate-900/70 to-green-800/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${
              i % 4 === 0
                ? "w-4 h-4 bg-green-400/30 animate-pulse-slow"
                : i % 4 === 1
                  ? "w-3 h-3 bg-yellow-400/25 animate-bounce-slow"
                  : i % 4 === 2
                    ? "w-2 h-2 bg-blue-400/20 animate-spin-slow"
                    : "w-1 h-1 bg-white/15 animate-twinkle"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {landscapeImages.map((img, index) => (
          <div
            key={index}
            className="absolute opacity-8 animate-float-complex"
            style={{
              left: `${15 + index * 30}%`,
              top: `${25 + index * 25}%`,
              animationDelay: `${index * 3}s`,
              animationDuration: `${8 + index * 2}s`,
            }}
          >
            <div className="relative group">
              <img
                src={img.url || "/placeholder.svg"}
                alt={img.alt}
                className="w-56 h-36 object-cover rounded-xl shadow-2xl transform rotate-6 group-hover:rotate-0 transition-all duration-1000 border-2 border-white/10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent rounded-xl" />
            </div>
          </div>
        ))}
      </div>


      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div
            className={`mb-12 text-center transition-all duration-1500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-bounce-gentle border border-green-400/30">
              <MapPin className="h-4 w-4 text-green-400 animate-pulse" />
              <span className="text-green-400 text-sm md:text-base font-semibold tracking-wide">
                Desde Ayacucho para todo el Perú
              </span>
            </div>

            <div className="relative mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter mb-2 animate-title-glow">
                PRADERA
              </h1>
              <div className="absolute inset-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-green-400/20 leading-none tracking-tighter animate-title-shadow">
                PRADERA
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent leading-none tracking-wider mb-6 animate-gradient">
              AYACUCHO
            </h2>

            <p className="text-lg md:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed mb-8 animate-fade-in-up">
              <span className="text-green-400 font-bold text-xl md:text-2xl">15 años</span> impulsando la agricultura y
              ganadería ayacuchana con{" "}
              <span className="text-white font-semibold">productos de calidad internacional</span>
            </p>

            <div
              ref={statsRef}
              className="stats flex flex-wrap justify-center gap-4 text-sm md:text-base text-gray-300 mb-6"
            >
              <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-400/20">
                <Award className="h-4 w-4 text-green-400 animate-pulse" />
                <span className="font-semibold">Certificación SENASA</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-400/20">
                <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="font-semibold">4.9/5 en satisfacción</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-400/20">
                <CheckCircle className="h-4 w-4 text-blue-400 animate-pulse" />
                <span className="font-semibold">{animatedStats.clients}+ clientes satisfechos</span>
              </div>
            </div>
          </div>

          <div className="mb-16 text-center">
            <div
              className={`transition-all duration-1000 ${sectionsInView.stats ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Nuestros Productos Destacados</h3>
              <p className="text-base md:text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
                Descubre nuestra selección premium de productos agrícolas y veterinarios, cuidadosamente seleccionados
                para el clima y suelo ayacuchano
              </p>

              <div className="relative h-64 md:h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 border-2 border-green-500/30 shadow-2xl">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1500 ${
                      index === currentProductImage ? "opacity-100 scale-100" : "opacity-0 scale-110"
                    }`}
                  >
                    <img src={img.url || "/placeholder.svg"} alt={img.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                    <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8">
                      <div className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block mb-2 border border-green-400/30">
                        <span className="text-green-400 text-xs md:text-sm font-semibold">{img.category}</span>
                      </div>
                      <h4 className="text-white text-lg md:text-2xl font-bold mb-2">{img.alt}</h4>
                      <p className="text-green-400 text-sm md:text-base">
                        Calidad garantizada • Certificación internacional • Desde Ayacucho
                      </p>
                    </div>
                  </div>
                ))}

                <div className="absolute bottom-3 right-3 flex gap-2">
                  {productImages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentProductImage ? "bg-green-400 scale-125" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div ref={featuresRef} className="features grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 md:p-8 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border-2 border-green-500/20 rounded-xl ${feature.hoverGradient} hover:border-green-400/50 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-700 hover:scale-105 transform-gpu ${
                  sectionsInView.features ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                }`}
                style={{
                  animationDelay: `${0.3 + index * 0.2}s`,
                  transitionDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-transparent rounded-xl border border-green-400/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <feature.icon className="h-8 w-8 md:h-10 md:w-10 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm md:text-base font-bold bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-green-400/30">
                      {feature.stats}
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg md:text-xl mb-3 group-hover:text-green-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">Producto destacado</span>
                </div>
              </div>
            ))}
          </div>

          <div
            ref={testimonialsRef}
            className="testimonials mb-16 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 rounded-2xl p-6 md:p-10 border-2 border-green-500/20 backdrop-blur-sm"
          >
            <div
              className={`transition-all duration-1000 ${sectionsInView.testimonials ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
                Lo que dicen nuestros clientes
              </h3>
              <p className="text-base md:text-lg text-gray-300 text-center mb-8 max-w-3xl mx-auto">
                Testimonios reales de agricultores y ganaderos que han transformado sus negocios con nuestros productos
              </p>

              <div className="relative h-64 md:h-72 overflow-hidden">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ${
                      index === currentTestimonial ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    <div className="grid md:grid-cols-3 gap-6 items-center h-full">
                      <div className="md:col-span-2">
                        <div className="flex justify-start mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 fill-current animate-pulse"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                        <blockquote className="text-gray-200 text-base md:text-lg italic leading-relaxed mb-6 font-light">
                          "{testimonial.text}"
                        </blockquote>
                        <div className="border-l-4 border-green-400 pl-4">
                          <p className="text-white font-bold text-base md:text-lg">{testimonial.name}</p>
                          <p className="text-green-400 text-sm md:text-base font-semibold">{testimonial.role}</p>
                          <p className="text-gray-400 text-sm">{testimonial.company}</p>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-full h-48 object-cover rounded-xl shadow-2xl border-2 border-green-400/30"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? "bg-green-400 scale-125" : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">Cobertura de Entrega</h3>
            <p className="text-base md:text-lg text-gray-300 text-center mb-8 max-w-3xl mx-auto">
              Red logística especializada para garantizar la frescura y calidad de nuestros productos
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {coverageAreas.map((area, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-green-500/20 to-transparent backdrop-blur-sm p-4 md:p-6 rounded-xl border-2 border-green-500/30 text-center hover:scale-105 hover:border-green-400/50 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-500"
                >
                  <div className="text-2xl md:text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {area.icon}
                  </div>
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-green-400 mx-auto mb-2 group-hover:animate-bounce" />
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">{area.city}</h4>
                  <p className="text-green-400 font-semibold text-xs md:text-sm mb-1">{area.delivery}</p>
                  <p className="text-gray-300 text-xs">{area.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div
              className={`transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
            >
              <div className="bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 rounded-2xl p-6 md:p-10 border-2 border-green-500/30 backdrop-blur-sm mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">¿Listo para transformar tu negocio?</h3>
                <p className="text-base md:text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
                  Únete a más de 1,000 agricultores y ganaderos que ya confían en Pradera para hacer crecer sus negocios
                </p>

                <Link href="/">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold rounded-full group transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/50 mb-6 border-2 border-green-400/30"
                  >
                    <Zap className="mr-3 h-5 w-5 md:h-6 md:w-6 group-hover:animate-pulse" />
                    COMPRAR AHORA
                    <ChevronRight className="ml-3 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-3 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-gray-300">
                <div className="flex flex-col items-center gap-2 p-4 bg-green-500/10 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-colors duration-300">
                  <Phone className="h-6 w-6 text-green-400 animate-pulse" />
                  <span className="font-semibold text-sm md:text-base">WhatsApp</span>
                  <span className="text-white text-sm">+51 966 123 456</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors duration-300">
                  <Mail className="h-6 w-6 text-blue-400 animate-pulse" />
                  <span className="font-semibold text-sm md:text-base">Email</span>
                  <span className="text-white text-sm">ventas@pradera.pe</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 hover:bg-orange-500/20 transition-colors duration-300">
                  <Clock className="h-6 w-6 text-orange-400 animate-pulse" />
                  <span className="font-semibold text-sm md:text-base">Horarios</span>
                  <span className="text-white text-sm">Lun-Sáb: 7:00 AM - 7:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-complex {
          0%, 100% { transform: translateY(0px) rotate(6deg) scale(1); }
          25% { transform: translateY(-20px) rotate(8deg) scale(1.05); }
          50% { transform: translateY(-15px) rotate(4deg) scale(1.02); }
          75% { transform: translateY(-25px) rotate(10deg) scale(1.08); }
        }
        
        @keyframes title-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { text-shadow: 0 0 40px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.3); }
        }
        
        @keyframes title-shadow {
          0%, 100% { transform: translate(2px, 2px); }
          50% { transform: translate(-2px, -2px); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float-complex { animation: float-complex 8s ease-in-out infinite; }
        .animate-title-glow { animation: title-glow 3s ease-in-out infinite; }
        .animate-title-shadow { animation: title-shadow 4s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%; 
          animation: gradient 4s ease infinite; 
        }
        .animate-bounce-gentle { animation: bounce-gentle 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
      `}</style>
    </section>
  )
}
