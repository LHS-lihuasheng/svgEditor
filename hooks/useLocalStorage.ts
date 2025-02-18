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
    try {
      const savedCache = localStorage.getItem(cacheKey)
      if (savedCache) {
        setCache(JSON.parse(savedCache))
      }
    } catch (error) {
      console.error("Error loading cache:", error)
    }
  }, [cacheKey])

  const updateCache = (newData: Partial<DraftCache>) => {
    try {
      const updatedCache = { ...cache, ...newData }
      setCache(updatedCache)
      localStorage.setItem(cacheKey, JSON.stringify(updatedCache))
    } catch (error) {
      console.error("Error updating cache:", error)
    }
  }

  const clearCache = () => {
    try {
      localStorage.removeItem(cacheKey)
      setCache(null)
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
  }

  return { cache, updateCache, clearCache }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 初始化状态，尝试从 localStorage 获取值，如果没有则使用初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return initialValue
    }
  })

  // 将值存储到 localStorage 中
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许值是一个函数，类似于 useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  return {
    value: storedValue,
    setValue,
  }
}

