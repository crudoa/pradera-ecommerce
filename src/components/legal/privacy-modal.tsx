"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PrivacyModalProps {
  children: React.ReactNode
}

export function PrivacyModal({ children }: PrivacyModalProps) {
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
              <span className="text-blue-600">Política de Privacidad</span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[65vh] overflow-y-auto px-6 py-4">
            <div className="space-y-6 pb-6">
              {/* Fecha de última actualización */}
              <div className="text-sm text-gray-500 text-center bg-blue-50 p-3 rounded-lg">
                Última actualización: {new Date().toLocaleDateString("es-PE")}
              </div>

              {/* Introducción */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  1. Introducción
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  En Pradera, respetamos y protegemos la privacidad de nuestros usuarios. Esta Política de
                  Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos su información personal de
                  acuerdo con la Ley N° 29733 - Ley de Protección de Datos Personales del Perú.
                </p>
              </section>

              {/* Responsable del tratamiento */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  2. Responsable del Tratamiento
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
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
                      <strong>Email de Privacidad:</strong> pradera.sg@gmail.com
                    </p>
                    <p>
                      <strong>Oficial de Protección de Datos:</strong> Juan Pérez García
                    </p>
                  </div>
                </div>
              </section>

              {/* Información que recopilamos */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  3. Información que Recopilamos
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-800">3.1. Información Personal Directa:</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                      <li>Nombre completo y apellidos</li>
                      <li>Documento de identidad (DNI/RUC)</li>
                      <li>Dirección de correo electrónico</li>
                      <li>Número de teléfono</li>
                      <li>Dirección de entrega</li>
                      <li>Información de pago (procesada de forma segura)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">3.2. Información de Navegación:</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                      <li>Dirección IP y ubicación aproximada</li>
                      <li>Tipo de navegador y dispositivo</li>
                      <li>Páginas visitadas y tiempo de permanencia</li>
                      <li>Productos visualizados y búsquedas realizadas</li>
                      <li>Cookies y tecnologías similares</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Finalidad del tratamiento */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  4. Finalidad del Tratamiento
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    4.1. <strong>Procesamiento de pedidos:</strong> Gestionar compras, pagos y entregas.
                  </p>
                  <p>
                    4.2. <strong>Atención al cliente:</strong> Responder consultas y brindar soporte técnico.
                  </p>
                  <p>
                    4.3. <strong>Marketing:</strong> Enviar ofertas, promociones y contenido relevante (con su
                    consentimiento).
                  </p>
                  <p>
                    4.4. <strong>Mejora del servicio:</strong> Analizar patrones de uso para optimizar la plataforma.
                  </p>
                  <p>
                    4.5. <strong>Cumplimiento legal:</strong> Cumplir con obligaciones fiscales y regulatorias.
                  </p>
                  <p>
                    4.6. <strong>Seguridad:</strong> Prevenir fraudes y proteger la integridad de la plataforma.
                  </p>
                </div>
              </section>

              {/* Base legal */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  5. Base Legal del Tratamiento
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    5.1. <strong>Consentimiento:</strong> Para marketing y comunicaciones promocionales.
                  </p>
                  <p>
                    5.2. <strong>Ejecución contractual:</strong> Para procesar pedidos y brindar servicios.
                  </p>
                  <p>
                    5.3. <strong>Interés legítimo:</strong> Para mejorar servicios y prevenir fraudes.
                  </p>
                  <p>
                    5.4. <strong>Obligación legal:</strong> Para cumplir con requerimientos fiscales y regulatorios.
                  </p>
                </div>
              </section>

              {/* Compartir información */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  6. Compartir Información
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    6.1. <strong>Proveedores de servicios:</strong> Empresas de envío, procesadores de pago, servicios
                    de hosting.
                  </p>
                  <p>
                    6.2. <strong>Autoridades competentes:</strong> Cuando sea requerido por ley o orden judicial.
                  </p>
                  <p>
                    6.3. <strong>Terceros autorizados:</strong> Solo con su consentimiento expreso.
                  </p>
                  <p>
                    6.4. <strong>No vendemos</strong> su información personal a terceros con fines comerciales.
                  </p>
                </div>
              </section>

              {/* Seguridad de datos */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  7. Seguridad de los Datos
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>7.1. Implementamos medidas técnicas y organizativas apropiadas:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Cifrado SSL/TLS para transmisión de datos</li>
                    <li>Almacenamiento seguro en servidores protegidos</li>
                    <li>Acceso restringido solo a personal autorizado</li>
                    <li>Monitoreo continuo de seguridad</li>
                    <li>Copias de seguridad regulares</li>
                  </ul>
                  <p>7.2. En caso de violación de datos, notificaremos según lo establecido por ley.</p>
                </div>
              </section>

              {/* Retención de datos */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  8. Retención de Datos
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    8.1. <strong>Datos de cuenta:</strong> Mientras mantenga su cuenta activa.
                  </p>
                  <p>
                    8.2. <strong>Datos de transacciones:</strong> 10 años por obligaciones fiscales.
                  </p>
                  <p>
                    8.3. <strong>Datos de marketing:</strong> Hasta que retire su consentimiento.
                  </p>
                  <p>
                    8.4. <strong>Datos de navegación:</strong> Máximo 24 meses.
                  </p>
                </div>
              </section>

              {/* Derechos del titular */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  9. Sus Derechos
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p className="font-medium">
                    Conforme a la Ley de Protección de Datos Personales, usted tiene derecho a:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      <strong>Acceso:</strong> Conocer qué datos personales tenemos sobre usted
                    </li>
                    <li>
                      <strong>Rectificación:</strong> Corregir datos inexactos o incompletos
                    </li>
                    <li>
                      <strong>Cancelación:</strong> Solicitar la eliminación de sus datos
                    </li>
                    <li>
                      <strong>Oposición:</strong> Oponerse al tratamiento de sus datos
                    </li>
                    <li>
                      <strong>Portabilidad:</strong> Recibir sus datos en formato estructurado
                    </li>
                    <li>
                      <strong>Revocación:</strong> Retirar su consentimiento en cualquier momento
                    </li>
                  </ul>
                  <div className="bg-blue-50 p-3 rounded-lg mt-3">
                    <p className="text-blue-800">
                      Para ejercer estos derechos, contáctenos en: <strong>pradera.sg@gmail.com</strong>
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  10. Cookies y Tecnologías Similares
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>
                    10.1. <strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio.
                  </p>
                  <p>
                    10.2. <strong>Cookies de rendimiento:</strong> Para analizar el uso y mejorar la experiencia.
                  </p>
                  <p>
                    10.3. <strong>Cookies de marketing:</strong> Para mostrar publicidad relevante (con su
                    consentimiento).
                  </p>
                  <p>10.4. Puede gestionar las cookies desde la configuración de su navegador.</p>
                </div>
              </section>

              {/* Transferencias internacionales */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  11. Transferencias Internacionales
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Perú. En estos casos,
                  garantizamos que se mantengan niveles adecuados de protección mediante cláusulas contractuales
                  estándar y certificaciones de seguridad.
                </p>
              </section>

              {/* Menores de edad */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  12. Menores de Edad
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente
                  información de menores de edad sin el consentimiento de sus padres o tutores.
                </p>
              </section>

              {/* Cambios en la política */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  13. Cambios en esta Política
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios
                  significativos por correo electrónico o mediante aviso en nuestro sitio web.
                </p>
              </section>

              {/* Contacto */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  14. Contacto
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-700 leading-relaxed space-y-2">
                    <p className="font-medium">Para consultas sobre privacidad y protección de datos:</p>
                    <p>
                      <strong>Email:</strong> pradera.sg@gmail.com
                    </p>
                    <p>
                      <strong>Oficial de Protección de Datos:</strong> Juan Pérez García
                    </p>
                    <p>
                      <strong>Teléfono:</strong> +51 930 104 083 (ext. 101)
                    </p>
                    <p>
                      <strong>Dirección:</strong> Mza A lote 17 Int. B BQ los licenciados Ayacucho Huamanga - Ayacucho
                    </p>
                    <p>
                      <strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </section>

              {/* Autoridad de control */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-3">
                  15. Autoridad de Control
                </h3>
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-gray-700 leading-relaxed">
                    Si considera que el tratamiento de sus datos personales infringe la normativa vigente, puede
                    presentar una reclamación ante la Autoridad Nacional de Protección de Datos Personales del
                    Ministerio de Justicia y Derechos Humanos del Perú.
                  </p>
                </div>
              </section>
            </div>
          </div>
          <div className="p-1 pt-2 border-t bg-gray-10 flex justify-end">
            <Button onClick={() => setOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
