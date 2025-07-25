"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TermsModalProps {
  children: React.ReactNode
}

export function TermsModal({ children }: TermsModalProps) {
  const [open, setOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <span onClick={handleClick} className="cursor-pointer">
        {children}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-0 border-b">
            <DialogTitle className="text-2xl font-bold text-center">
              <span className="text-green-600">Términos de Servicio</span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[65vh] overflow-y-auto px-6 py-4">
            <div className="space-y-6 pb-6">
              {/* Fecha de última actualización */}
              <div className="text-sm text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
                Última actualización: {new Date().toLocaleDateString("es-PE")}
              </div>

              {/* Introducción */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  1. Introducción
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Bienvenido a Pradera. Estos Términos de Servicio ("Términos") rigen el uso de nuestro sitio web y
                  servicios de comercio electrónico especializados en productos agrícolas y veterinarios. Al acceder o
                  utilizar nuestros servicios, usted acepta estar sujeto a estos Términos.
                </p>
              </section>

              {/* Información de la empresa */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  2. Información de la Empresa
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-gray-700 leading-relaxed space-y-2">
                    <p>
                      <strong>Razón Social:</strong> Pradera.
                    </p>
                    <p>
                      <strong>RUC:</strong> 20600198816
                    </p>
                    <p>
                      <strong>Dirección:</strong> Mza A lote 17 Int. B BQ los licenciados Ayacucho Huamanga - Ayacucho
                    </p>
                    <p>
                      <strong>Teléfono:</strong> 930 104 083
                    </p>
                    <p>
                      <strong>Email:</strong> pradera.sg@gmail.com
                    </p>
                  </div>
                </div>
              </section>

              {/* Definiciones */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  3. Definiciones
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    <strong>"Plataforma":</strong> Se refiere al sitio web Pradera y sus servicios asociados.
                  </p>
                  <p>
                    <strong>"Usuario":</strong> Cualquier persona que acceda o utilice la Plataforma.
                  </p>
                  <p>
                    <strong>"Productos":</strong> Productos agrícolas, veterinarios y relacionados ofrecidos en la
                    Plataforma.
                  </p>
                  <p>
                    <strong>"Vendedor":</strong> Pradera. como distribuidor autorizado de productos.
                  </p>
                </div>
              </section>

              {/* Registro y cuenta */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  4. Registro y Cuenta de Usuario
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    4.1. Para realizar compras, debe crear una cuenta proporcionando información veraz y actualizada.
                  </p>
                  <p>4.2. Es responsable de mantener la confidencialidad de sus credenciales de acceso.</p>
                  <p>4.3. Debe notificar inmediatamente cualquier uso no autorizado de su cuenta.</p>
                  <p>4.4. Nos reservamos el derecho de suspender cuentas que violen estos Términos.</p>
                </div>
              </section>

              {/* Productos y servicios */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  5. Productos y Servicios
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    5.1. Ofrecemos productos agrícolas, semillas, fertilizantes, productos veterinarios y equipos
                    relacionados.
                  </p>
                  <p>5.2. Todos los productos están sujetos a disponibilidad de stock.</p>
                  <p>5.3. Las imágenes y descripciones son referenciales y pueden variar del producto real.</p>
                  <p>5.4. Los precios están expresados en Soles Peruanos (PEN) e incluyen IGV cuando corresponda.</p>
                  <p>5.5. Nos reservamos el derecho de modificar precios sin previo aviso.</p>
                </div>
              </section>

              {/* Pedidos y pagos */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  6. Pedidos y Pagos
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>6.1. Los pedidos están sujetos a confirmación de disponibilidad y aprobación de pago.</p>
                  <p>
                    6.2. Aceptamos pagos mediante tarjetas de crédito/débito, Yape, PagoEfectivo y transferencias
                    bancarias.
                  </p>
                  <p>6.3. El procesamiento de pagos se realiza a través de proveedores seguros como Culqi.</p>
                  <p>6.4. En caso de productos no disponibles, se realizará el reembolso correspondiente.</p>
                  <p>6.5. Los precios finales incluyen impuestos aplicables según la legislación peruana.</p>
                </div>
              </section>

              {/* Envíos y entregas */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  7. Envíos y Entregas
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>7.1. Realizamos envíos a nivel nacional dentro del territorio peruano.</p>
                  <p>7.2. Los tiempos de entrega varían según la ubicación y disponibilidad del producto.</p>
                  <p>7.3. Los costos de envío se calculan según peso, dimensiones y destino.</p>
                  <p>7.4. El riesgo de pérdida se transfiere al momento de la entrega al transportista.</p>
                  <p>7.5. Para productos veterinarios, se requiere presentar licencia profesional cuando aplique.</p>
                </div>
              </section>

              {/* Devoluciones y garantías */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  8. Devoluciones y Garantías
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    8.1. Aceptamos devoluciones dentro de 7 días para productos no perecederos en condiciones
                    originales.
                  </p>
                  <p>
                    8.2. Productos perecederos, semillas y medicamentos veterinarios no son retornables por razones
                    sanitarias.
                  </p>
                  <p>8.3. Los gastos de devolución corren por cuenta del cliente, salvo defectos de fábrica.</p>
                  <p>8.4. Las garantías de productos se rigen por las condiciones del fabricante.</p>
                  <p>8.5. Productos con fecha de vencimiento no pueden devolverse una vez entregados.</p>
                </div>
              </section>

              {/* Uso responsable */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  9. Uso Responsable
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>9.1. Los productos agrícolas y veterinarios deben usarse según las indicaciones del fabricante.</p>
                  <p>9.2. El usuario es responsable del uso adecuado y seguro de los productos adquiridos.</p>
                  <p>9.3. Recomendamos consultar con profesionales antes de usar productos especializados.</p>
                  <p>9.4. No nos hacemos responsables por el mal uso de los productos.</p>
                </div>
              </section>

              {/* Limitación de responsabilidad */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  10. Limitación de Responsabilidad
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>10.1. Nuestra responsabilidad se limita al valor del producto adquirido.</p>
                  <p>10.2. No somos responsables por daños indirectos, lucro cesante o pérdidas de cosecha.</p>
                  <p>10.3. La información técnica es referencial y debe verificarse con especialistas.</p>
                  <p>10.4. No garantizamos resultados específicos en el uso de productos agrícolas.</p>
                </div>
              </section>

              {/* Propiedad intelectual */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  11. Propiedad Intelectual
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>11.1. Todo el contenido de la Plataforma está protegido por derechos de autor.</p>
                  <p>11.2. Las marcas comerciales pertenecen a sus respectivos propietarios.</p>
                  <p>11.3. Está prohibida la reproducción no autorizada del contenido.</p>
                </div>
              </section>

              {/* Modificaciones */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  12. Modificaciones
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones
                  entrarán en vigor al ser publicadas en la Plataforma.
                </p>
              </section>

              {/* Ley aplicable */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  13. Ley Aplicable y Jurisdicción
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>13.1. Estos Términos se rigen por las leyes de la República del Perú.</p>
                  <p>13.2. Cualquier disputa será resuelta en los tribunales de Lima, Perú.</p>
                  <p>13.3. Se aplicará el Código de Protección y Defensa del Consumidor peruano.</p>
                </div>
              </section>

              {/* Contacto */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  14. Contacto
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-700 leading-relaxed space-y-2">
                    <p className="font-medium">Para consultas sobre estos Términos, contáctanos:</p>
                    <p>
                      <strong>Email:</strong> legal@pradera.com
                    </p>
                    <p>
                      <strong>Teléfono:</strong> +51 930 104 083
                    </p>
                    <p>
                      <strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <div className="p-1 pt-2 border-t bg-gray-10 flex justify-end">
            <Button onClick={() => setOpen(false)} className="bg-green-600 hover:bg-green-700">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
