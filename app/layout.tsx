import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import TopNav from "@/components/TopNav"
import { MessageProvider } from '@/contexts/MessageContext'
import { MessageModal } from "@/components/MessageModal"
import { enableMapSet } from 'immer'

const inter = Inter({ subsets: ["latin"] })

enableMapSet()

export const metadata: Metadata = {
  title: "WaveSVG",
  description: "SVG Editor for WeChat Official Account"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} h-screen overflow-hidden`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <MessageProvider>
            <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
              <TopNav />
              <main className="overflow-hidden" style={{ height: 'calc(100% - 57px)' }}>
                {children}
              </main>
              <MessageModal />
            </div>
          </MessageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}