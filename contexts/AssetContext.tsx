"use client"

import type React from "react"
import { createContext, useState, useContext, useCallback, useEffect } from "react"
import { normalizeAssetPath } from '@/utils/pathUtils'
import { getRelativePath } from '@/utils/file-utils'

// 图片资源数据结构
interface ImageAsset {
  name: string
  relativePath: string  // 标准化后的相对路径
  url: string          // 图片Blob URL
  dimensions: {       // 图片尺寸
    width: number
    height: number
  }
  lastModified: number
}

// 资源上下文类型定义
interface AssetContextType {
  imageAssets: Map<string, ImageAsset>      // 所有图片资源（路径为键）
  selectedImagePaths: string[]              // 当前选中的图片路径
  loadAssets: (directoryHandle: FileSystemDirectoryHandle) => Promise<void> // 加载目录资源
  selectImage: (relativePath: string) => void  // 切换图片选中状态
  getOrderedSelectedImages: () => ImageAsset[] // 获取按选择顺序排列的图片
  findImageByPath: (path: string) => ImageAsset | undefined // 通过路径查找图片
  rootDirectory: FileSystemDirectoryHandle | null // 当前根目录句柄
  setRootDirectory: (handle: FileSystemDirectoryHandle | null) => void // 设置根目录
  refreshAssets: () => Promise<void>        // 刷新资源列表
}

const AssetContext = createContext<AssetContextType | null>(null)

export function AssetProvider({ children }: { children: React.ReactNode }) {
  // 状态管理
  const [imageAssets, setImageAssets] = useState<Map<string, ImageAsset>>(new Map())
  const [selectedImagePaths, setSelectedImagePaths] = useState<string[]>([])
  const [selectionHistory, setSelectionHistory] = useState<string[][]>([]) // 选择历史（用于撤销）
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [rootDirectory, setRootDirectory] = useState<FileSystemDirectoryHandle | null>(null)

  // 获取图片尺寸工具方法
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

  // 核心方法：加载目录资源
  const loadAssets = useCallback(async (directoryHandle: FileSystemDirectoryHandle) => {
    setRootDirectory(directoryHandle)
    const newAssets = new Map<string, ImageAsset>()

    // 递归处理文件系统条目
    const processEntry = async (entry: FileSystemHandle, parentPath: string = '') => {
      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle
        const file = await fileHandle.getFile()

        // 只处理图片文件
        if (file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
          // 路径标准化处理
          const relativePath = await getRelativePath(directoryHandle, fileHandle) ||
            (parentPath ? `./${parentPath}/${file.name}` : `./${file.name}`)

          const cleanPath = relativePath
            .replace(/\/+/g, '/')   // 合并连续斜杠
            .replace(/^\.\//, './') // 确保相对路径格式

          const url = URL.createObjectURL(file)
          const dimensions = await getImageDimensions(url)

          // 存储到资源表
          newAssets.set(cleanPath, {
            name: file.name,
            relativePath: cleanPath,
            url,
            dimensions,
            lastModified: file.lastModified
          })
        }
      } else if (entry.kind === 'directory') {
        // 递归处理子目录
        const dirHandle = entry as FileSystemDirectoryHandle
        for await (const [name, childEntry] of dirHandle.entries()) {
          if (childEntry.kind === 'directory') {
            const newParentPath = parentPath ? `${parentPath}/${name}` : name
            await processEntry(childEntry, newParentPath)
          } else {
            await processEntry(childEntry, parentPath)
          }
        }
      }
    }

    try {
      // 遍历根目录条目
      for await (const [name, entry] of directoryHandle.entries()) {
        await processEntry(entry, '')
      }

      setImageAssets(newAssets)
      setSelectedImagePaths([]) // 加载新资源时清空选择
    } catch (error) {
      console.error('资源加载失败:', error)
    }
  }, [])

  // 刷新资源列表
  const refreshAssets = useCallback(async () => {
    if (!rootDirectory) return
    await loadAssets(rootDirectory)
  }, [rootDirectory, loadAssets])

  // 路径查找方法（支持多种路径格式）
  const findImageByPath = useCallback((path: string) => {
    const normalized = normalizeAssetPath(path)
    const searchPaths = [
      normalized,
      normalized.replace(/^\.\//, '')  // 尝试两种路径格式
    ]

    for (const p of searchPaths) {
      const image = imageAssets.get(p)
      if (image) return image
    }
    return undefined
  }, [imageAssets])

  // 图片选择切换逻辑
  const selectImage = useCallback((inputPath: string) => {
    const normalizedPath = normalizeAssetPath(inputPath)
    setSelectedImagePaths(prev => prev.includes(normalizedPath)
      ? prev.filter(p => p !== normalizedPath) // 取消选择
      : [...prev, normalizedPath] // 添加选择
    )
  }, [])

  // 记录选择历史（支持撤销/重做）
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
        getOrderedSelectedImages: () => selectedImagePaths
          .map(path => findImageByPath(path))
          .filter((img): img is ImageAsset => !!img),
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

// 自定义hook用于访问上下文
export const useAssets = () => {
  const context = useContext(AssetContext)
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider')
  }
  return context
}