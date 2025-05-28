"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Activity, BarChart2, FileText } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Activity,
    },
    {
      href: "/logs",
      label: "Event Logs",
      icon: FileText,
    },
    {
      href: "/analyze",
      label: "Analysis",
      icon: BarChart2,
    },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              <span className="font-bold">Ana-Log</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {routes.map((route) => (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 