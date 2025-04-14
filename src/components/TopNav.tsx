"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: "Operations",
    href: "/",
  },
  {
    label: "Drafts",
    href: "/drafts",
  },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center px-6 h-14 bg-white border-b border-gray-200">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-bold text-xl">
          Logo
        </Link>
        <div className="flex items-center gap-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm transition-colors hover:text-blue-500",
                pathname === route.href ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500",
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

