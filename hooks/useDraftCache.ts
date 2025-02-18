"use client"

import { useState, useEffect } from "react"
import type { NewsItem } from "@/types/draft"

interface DraftCache extends NewsItem {
  originalImage?: string
  crop235?: {
    x: number
    y: number
    width: number
    height: number
  }
  crop11?: {
    x: number
    y: number
    width: number
    height: number
  }
  croppedImages?: {
    crop235: string | null
    crop11: string | null
  }
}

export function useDraftCache(draftId?: string) {
  const cacheKey = `draft_cache_${draftId || "new"}`
  const [cache, setCache] = useState<DraftCache | null>(null)

  useEffect(() => {
    const savedCache = localStorage.getItem(cacheKey)
    if (savedCache) {
      setCache(JSON.parse(savedCache))
    }
  }, [cacheKey])

  const updateCache = (newData: Partial<DraftCache>) => {
    const updatedCache = { ...cache, ...newData }
    setCache(updatedCache)
    localStorage.setItem(cacheKey, JSON.stringify(updatedCache))
  }

  const clearCache = () => {
    localStorage.removeItem(cacheKey)
    setCache(null)
  }

  return { cache, updateCache, clearCache }
}

