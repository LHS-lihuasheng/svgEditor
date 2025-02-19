import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import TopNav from "@/components/TopNav"
import { AssetProvider } from "@/contexts/AssetContext"
import { DndWrapper } from "@/components/operator/DndWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WeChat Editor",
  description: "SVG Editor for WeChat Official Account"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <DndWrapper>
            <AssetProvider>
              <div className="flex flex-col h-screen bg-gray-50">
                <TopNav />
                <main className="flex-1 overflow-hidden">{children}</main>
              </div>
            </AssetProvider>
          </DndWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'