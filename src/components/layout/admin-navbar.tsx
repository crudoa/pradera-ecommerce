"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, LayoutDashboard, Package, ShoppingCart, ArrowLeft, CircleUser, Menu } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdminNavbar() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin-login")
  }

  const navItems = [
    {
      name: "Panel",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Productos",
      href: "/admin/products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Órdenes",
      href: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-24 items-center gap-4 border-b bg-white px-4 py-6 shadow-md sm:static sm:h-auto sm:border-0 sm:bg-white sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden bg-transparent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Navigation Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/admin"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <LayoutDashboard className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Panel de Administración</span>
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  pathname.startsWith(item.href) && "text-foreground",
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex items-center gap-4">
        
        {pathname === "/admin" ? (
          <h1 className="text-3xl font-extrabold text-gray-900">Panel de Administración</h1>
        ) : (
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xl font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" /> Volver al Panel
          </Link>

        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configuración</DropdownMenuItem>
          <DropdownMenuItem>Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
