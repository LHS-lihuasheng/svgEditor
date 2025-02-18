"use client"

import { useState } from "react"
import { useAssets } from "@/contexts/AssetContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AssetManager() {
  const { assets, loadAssets } = useAssets()
  const [loading, setLoading] = useState(false)

  const handleSelectFolder = async () => {
    try {
      setLoading(true)
      const directoryHandle = await window.showDirectoryPicker()
      await loadAssets(directoryHandle)
    } catch (error) {
      console.error("Error selecting folder:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Button onClick={handleSelectFolder} disabled={loading}>
        {loading ? "Loading..." : "Select Folder"}
      </Button>
      <ScrollArea className="flex-1 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <Card key={asset.name}>
              <CardContent className="p-2">
                <img src={asset.url || "/placeholder.svg"} alt={asset.name} className="w-full h-40 object-cover" />
                <p className="mt-2 text-sm truncate">{asset.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

