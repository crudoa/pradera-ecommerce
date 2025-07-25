"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import AdminNavbar from "@/components/layout/admin-navbar" 

export default function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <>
      <AdminNavbar /> 
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
    </>
  )
}
