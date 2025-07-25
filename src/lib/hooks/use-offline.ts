"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online && !wasOffline) {
        setWasOffline(true)
        toast.error("Sin conexión a internet", {
          description: "Algunas funciones pueden no estar disponibles",
          duration: 5000,
        })
      } else if (online && wasOffline) {
        setWasOffline(false)
        toast.success("Conexión restaurada", {
          description: "Ya puedes usar todas las funciones",
        })
      }
    }

    // Verificar estado inicial
    updateOnlineStatus()

    // Escuchar cambios
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}
