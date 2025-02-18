"use client"

import type React from "react"
import { createContext, useState, useContext, useCallback } from "react"

type Asset = {
  name: string
  url: string
  lastModified: number
}

type AssetContextType = {
  assets: Asset[]
  loadAssets: (directoryHandle: FileSystemDirectoryHandle) => Promise<void>
}

const AssetContext = createContext<AssetContextType | undefined>(undefined)

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([])

  const loadAssets = useCallback(async (directoryHandle: FileSystemDirectoryHandle) => {
    const newAssets: Asset[] = []

    for await (const entry of directoryHandle.values()) {
      if (entry.kind === "file" && entry.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        const file = await entry.getFile()
        newAssets.push({
          name: file.name,
          url: URL.createObjectURL(file),
          lastModified: file.lastModified,
        })
      }
    }

    setAssets(newAssets)
  }, [])

  return <AssetContext.Provider value={{ assets, loadAssets }}>{children}</AssetContext.Provider>
}

export function useAssets() {
  const context = useContext(AssetContext)
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetProvider")
  }
  return context
}

