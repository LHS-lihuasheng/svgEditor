import { AssetSidebar } from "@/components/assets/AssetSidebar"

export function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <AssetSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
} 