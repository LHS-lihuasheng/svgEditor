import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import TopNav from "@/components/TopNav"
import { MessageProvider } from '@/contexts/MessageContext'
import { MessageModal } from "@/components/MessageModal"
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
          <MessageProvider>
            <div className="flex flex-col h-screen bg-gray-50">
              <TopNav />
              <main className="flex-1 overflow-auto">{children}</main>
              {/* 全局消息提示框 */}
              <MessageModal />
            </div>
          </MessageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}