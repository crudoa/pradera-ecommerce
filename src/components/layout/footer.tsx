"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* PRODUCTOS */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold uppercase tracking-wide text-white mb-4">PRODUCTOS</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/buscar?filtro=ofertas"
                  className="text-gray-300 hover:text-white transition-colors text-sm block"
                >
                  Ofertas
                </Link>
              </li>
              <li>
                <Link
                  href="/buscar?filtro=novedades"
                  className="text-gray-300 hover:text-white transition-colors text-sm block"
                >
                  Novedades
                </Link>
              </li>
              <li>
                <Link
                  href="/buscar?filtro=populares"
                  className="text-gray-300 hover:text-white transition-colors text-sm block"
                >
                  Los más vendidos
                </Link>
              </li>
            </ul>
          </div>

          {/* NUESTRA EMPRESA */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold uppercase tracking-wide text-white mb-4">NUESTRA EMPRESA</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm block">
                  Libro de Reclamaciones
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/51930104083?text=Hola,%20me%20gustaría%20obtener%20más%20información%20sobre%20sus%20productos."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm block"
                >
                  Contacta con nosotros
                </a>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm block">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/mi-cuenta" className="text-gray-300 hover:text-white transition-colors text-sm block">
                  Mi cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* SU CUENTA */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold uppercase tracking-wide text-white mb-4">SU CUENTA</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mi-cuenta" className="text-gray-300 hover:text-white transition-colors text-sm block">
                  Información personal
                </Link>
              </li>
              <li>
                <Link
                  href="/mi-cuenta?tab=pedidos"
                  className="text-gray-300 hover:text-white transition-colors text-sm block"
                >
                  Pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/mi-cuenta?tab=direcciones"
                  className="text-gray-300 hover:text-white transition-colors text-sm block"
                >
                  Direcciones
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACTO */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold uppercase tracking-wide text-white mb-4">CONTACTO</h3>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">RUC: 20600198816</p>
              <p className="text-gray-300 text-sm">Dirección: Mza A lote 17 Int. B BQ los licenciados Ayacucho Huamanga - Ayacucho</p>
              <p className="text-gray-300 text-sm">Teléfono: 930 104 083</p>
              <p className="text-gray-300 text-sm">WhatsApp: 930 104 083</p>
              <p className="text-gray-300 text-sm">Email: pradera.sg@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">© Copyright 2025 Pradera. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
