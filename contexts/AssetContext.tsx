"use client"

import { createContext, useContext } from "react"
import { useImmer } from "use-immer"
import type { ImageAsset } from "@/types/asset"
import { filterAssetsByDirectory, getImageAssetsWithDirectories } from "@/utils/assetUtils"

// 状态类型
interface AssetState {
  imageAssets: Map<string, ImageAsset>
  selectedImagePaths: Set<string>
  rootDirectory: FileSystemDirectoryHandle | null
  directories: string[]
  currentDirectory: string
  isLoading: boolean
}

// 定义上下文类型
interface AssetContextType {
  // 状态
  imageAssets: Map<string, ImageAsset>
  selectedImagePaths: Set<string>
  rootDirectory: FileSystemDirectoryHandle | null
  directories: string[]
  currentDirectory: string
  currentAssets: ImageAsset[]
  isLoading: boolean

  // 操作
  loadAssets: (directoryHandle: FileSystemDirectoryHandle) => Promise<void>
  refreshAssets: () => Promise<void>
  selectImage: (path: string) => void
  findImageByPath: (path: string) => ImageAsset | undefined
  shiftFirstSelectedImage: () => ImageAsset | undefined
  clearSelectedImages: () => void
  changeDirectory: (directory: string) => void
  setLoading: (isLoading: boolean) => void
}

const AssetContext = createContext<AssetContextType | null>(null)

// 提供者组件
export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [state, updateState] = useImmer<AssetState>({
    imageAssets: new Map(),
    selectedImagePaths: new Set<string>(),
    rootDirectory: null,
    directories: [],
    currentDirectory: 'root',
    isLoading: false
  })

  // 获取当前目录的资源
  const currentAssets = filterAssetsByDirectory(state.imageAssets, state.currentDirectory)

  // 上下文值
  const contextValue: AssetContextType = {
    imageAssets: state.imageAssets,
    selectedImagePaths: state.selectedImagePaths,
    rootDirectory: state.rootDirectory,
    directories: state.directories,
    currentDirectory: state.currentDirectory,
    currentAssets,
    isLoading: state.isLoading,

    loadAssets: async (directoryHandle: FileSystemDirectoryHandle) => {
      try {
        updateState(draft => { draft.isLoading = true })

        const { assets: newAssets, directories: newDirectories } =
          await getImageAssetsWithDirectories(directoryHandle, directoryHandle)

        // 使用 Immer 简化状态更新
        updateState(draft => {
          draft.rootDirectory = directoryHandle
          draft.imageAssets = newAssets
          draft.directories = newDirectories
          draft.currentDirectory = 'root'
        })
      } finally {
        updateState(draft => { draft.isLoading = false })
      }
    },

    refreshAssets: async () => {
      if (state.rootDirectory) {
        try {
          updateState(draft => { draft.isLoading = true })

          const { assets: newAssets, directories: newDirectories } =
            await getImageAssetsWithDirectories(state.rootDirectory!, state.rootDirectory!)

          updateState(draft => {
            draft.imageAssets = newAssets
            draft.directories = newDirectories
          })
        } finally {
          updateState(draft => { draft.isLoading = false })
        }
      }
    },

    selectImage: (path: string) => {
      updateState(draft => {
        if (draft.selectedImagePaths.has(path)) {
          draft.selectedImagePaths.delete(path)
        } else {
          draft.selectedImagePaths.add(path)
        }
      })
    },

    clearSelectedImages: () => {
      updateState(draft => {
        draft.selectedImagePaths.clear()
      })
    },

    findImageByPath: (path: string) => path ? state.imageAssets.get(path) : undefined,

    shiftFirstSelectedImage: () => {
      if (state.selectedImagePaths.size === 0) return undefined

      const firstPath = Array.from(state.selectedImagePaths)[0]
      updateState(draft => {
        draft.selectedImagePaths.delete(firstPath)
      })

      return state.imageAssets.get(firstPath)
    },

    changeDirectory: (directory: string) => {
      updateState(draft => {
        draft.currentDirectory = directory
      })
    },

    setLoading: (loading: boolean) => {
      updateState(draft => {
        draft.isLoading = loading
      })
    }
  }

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
    </AssetContext.Provider>
  )
}

// 自定义hook
export const useAssets = () => {
  const context = useContext(AssetContext)
  if (!context) throw new Error('useAssets必须在AssetProvider内部使用')
  return context
}