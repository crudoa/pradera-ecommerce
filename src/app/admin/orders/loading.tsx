import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
      <Loader2 className="h-10 w-10 animate-spin text-green-500" />
      <p className="ml-3 text-lg text-gray-700">Cargando órdenes...</p>
    </div>
  )
}
