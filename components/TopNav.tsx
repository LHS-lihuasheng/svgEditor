"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search, Bell, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const routes = [
  {
    label: "Operations",
    href: "/",
  },
  {
    label: "Drafts",
    href: "/drafts",
  },
  {
    label: "News",
    href: "/news",
  },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center px-6 h-14 border-b bg-white">
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
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <ChevronDown className="h-5 w-5" />
        </Button>
        <Avatar>
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  )
}

