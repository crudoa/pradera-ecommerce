"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"

export function WhatsAppButton() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51930104083"
  const message = "Hola, me interesa conocer más sobre sus productos."
  const encodedMessage = encodeURIComponent(message)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    try {
      window.open(url, "_blank")
      if (!isMobile) {
        setOpen(true)
      }
    } catch (e) {
      console.error("Error opening WhatsApp URL:", e)
      toast({
        title: "Error al abrir WhatsApp",
        description: "Asegúrate de tener WhatsApp instalado y de que tu navegador permita pop-ups.",
        variant: "destructive",
      })
      setOpen(true)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
    setCopied(true)
    toast({
      title: "Mensaje copiado",
      description: "El mensaje ha sido copiado al portapapeles.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-3">
        <Button
          onClick={handleWhatsAppClick}
          className="h-28 w-28 rounded-full bg-green-500 hover:bg-green-600 shadow-xl hover:shadow-2xl transition-all duration-300 animate-bounce"
          size="icon"
          title="Contactar por WhatsApp"
        >
          <svg
            className="h-12 w-12 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
          </svg>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!min-h-fit !h-auto !py-2 sm:!py-2 [&>form]:!min-h-fit [&>form]:!h-auto">
          <DialogHeader>
            <DialogTitle>Mensaje no cargado</DialogTitle>
            <DialogDescription>
              Si el mensaje no apareció automáticamente en WhatsApp Web, puedes copiarlo aquí:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-100 p-3 rounded text-sm text-gray-800 break-words whitespace-pre-wrap">
            {message}
          </div>

          <Button onClick={handleCopy} variant="secondary" className="w-full mt-2 flex items-center gap-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Mensaje copiado" : "Copiar mensaje"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
