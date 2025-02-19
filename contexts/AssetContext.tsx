"use client"

import type React from "react"
import { createContext, useState, useContext, useCallback, useEffect } from "react"
import { normalizeAssetPath } from '@/utils/pathUtils'
import { getRelativePath } from '@/utils/fileSystem'


interface ImageAsset {
  name: string
  relativePath: string
  url: string
  dimensions: {
    width: number
    height: number
  }
  lastModified: number
}

interface AssetContextType {
  imageAssets: Map<string, ImageAsset>
  selectedImagePaths: string[]
  loadAssets: (directoryHandle: FileSystemDirectoryHandle) => Promise<void>
  selectImage: (relativePath: string) => void
  getOrderedSelectedImages: () => ImageAsset[]
  findImageByPath: (path: string) => ImageAsset | undefined
  rootDirectory: FileSystemDirectoryHandle | null
  setRootDirectory: (handle: FileSystemDirectoryHandle | null) => void
  refreshAssets: () => Promise<void>
}

const AssetContext = createContext<AssetContextType | null>(null)

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [imageAssets, setImageAssets] = useState<Map<string, ImageAsset>>(new Map())
  const [selectedImagePaths, setSelectedImagePaths] = useState<string[]>([])
  const [selectionHistory, setSelectionHistory] = useState<string[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [rootDirectory, setRootDirectory] = useState<FileSystemDirectoryHandle | null>(null)

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.src = url
    })
  }

  const loadAssets = useCallback(async (directoryHandle: FileSystemDirectoryHandle) => {
    setRootDirectory(directoryHandle)
    const newAssets = new Map<string, ImageAsset>()

    const processEntry = async (entry: FileSystemHandle, parentPath: string = '') => {
      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle
        const file = await fileHandle.getFile()

        if (file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
          const relativePath = await getRelativePath(directoryHandle, fileHandle) ||
            (parentPath ? `./${parentPath}/${file.name}` : `./${file.name}`)

          console.log(relativePath)

          const cleanPath = relativePath
            .replace(/\/+/g, '/')   // 合并连续斜杠
            .replace(/^\.\//, './') // 确保以./开头
          console.log(cleanPath)

          const url = URL.createObjectURL(file)
          const dimensions = await getImageDimensions(url)

          console.log('存储资源:', {
            path: cleanPath,
            name: file.name,
            width: dimensions.width,
            height: dimensions.height
          })

          newAssets.set(cleanPath, {
            name: file.name,
            relativePath: cleanPath,
            url,
            dimensions,
            lastModified: file.lastModified
          })
        }
      } else if (entry.kind === 'directory') {
        const dirHandle = entry as FileSystemDirectoryHandle
        for await (const [name, childEntry] of dirHandle.entries()) {
          if (childEntry.kind === 'directory') {
            const newParentPath = parentPath
              ? `${parentPath}/${name}`
              : name
            await processEntry(childEntry, newParentPath)
          } else {
            await processEntry(childEntry, parentPath)
          }
        }
      }
    }

    try {
      for await (const [name, entry] of directoryHandle.entries()) {
        await processEntry(entry, '')
      }

      console.log('资源加载完成，总数:', newAssets.size)
      for (const [path, asset] of newAssets) {
        console.log('资源路径:', path, '资源:', asset)
      }
      setImageAssets(newAssets)
      setSelectedImagePaths([])
    } catch (error) {
      console.error('资源加载失败:', error)
    }
  }, [])

  const refreshAssets = useCallback(async () => {
    if (!rootDirectory) return
    await loadAssets(rootDirectory)
  }, [rootDirectory, loadAssets])

  const findImageByPath = useCallback((path: string) => {
    const normalized = normalizeAssetPath(path)
    const searchPaths = [
      normalized,
      normalized.replace(/^\.\//, '')  // 同时尝试无./前缀的版本
    ]

    for (const p of searchPaths) {
      const image = imageAssets.get(p)
      if (image) {
        console.log('成功匹配路径:', { 输入路径: path, 匹配路径: p })
        return image
      }
    }

    console.warn('未找到匹配路径:', {
      输入路径: path,
      尝试路径: searchPaths,
      可用路径: Array.from(imageAssets.keys())
    });
    return undefined;
  }, [imageAssets]);

  const selectImage = useCallback((inputPath: string) => {
    const normalizedPath = normalizeAssetPath(inputPath)

    setSelectedImagePaths(prev => {
      const newPaths = prev.includes(normalizedPath)
        ? prev.filter(p => p !== normalizedPath) // 取消选择
        : [...prev, normalizedPath] // 添加选择

      console.log('更新选中路径:', newPaths)
      return newPaths
    })
  }, [])

  useEffect(() => {
    setSelectionHistory(prev => [...prev.slice(0, historyIndex + 1), selectedImagePaths])
    setHistoryIndex(prev => prev + 1)
  }, [selectedImagePaths])

  return (
    <AssetContext.Provider
      value={{
        imageAssets,
        selectedImagePaths,
        loadAssets,
        selectImage,
        getOrderedSelectedImages: () => {
          console.log(selectedImagePaths)
          console.log(imageAssets)
          return selectedImagePaths
            .map(path => findImageByPath(path))
            .filter((img): img is ImageAsset => img !== undefined)
        },
        findImageByPath,
        rootDirectory,
        setRootDirectory,
        refreshAssets
      }}
    >
      {children}
    </AssetContext.Provider>
  )
}

export const useAssets = () => {
  const context = useContext(AssetContext)
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider')
  }
  return context
}