import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import TopNav from "@/components/TopNav"
import { AssetProvider } from "@/contexts/AssetContext"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WeChat Editor",
  description: "SVG Editor for WeChat Official Account"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AssetProvider>
            <div className="flex flex-col h-screen bg-gray-50">
              <TopNav />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </AssetProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}