"use client"

import type React from "react"
import { createContext, useReducer, useContext, useCallback } from "react"
import { normalizeAssetPath } from '@/utils/pathUtils'
import { getRelativePath } from '@/utils/file-utils'

// 图片资源数据结构
interface ImageAsset {
  name: string
  relativePath: string
  url: string
  dimensions: { width: number, height: number }
  lastModified: number
}

// 资源上下文类型定义
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
  shiftFirstSelectedImage: () => ImageAsset | undefined
}

// 状态类型
interface AssetState {
  imageAssets: Map<string, ImageAsset>;
  selectedImagePaths: string[];
  rootDirectory: FileSystemDirectoryHandle | null;
}

// Action类型
type AssetAction =
  | { type: 'SET_IMAGE_ASSETS'; payload: Map<string, ImageAsset> }
  | { type: 'SET_ROOT_DIRECTORY'; payload: FileSystemDirectoryHandle | null }
  | { type: 'TOGGLE_IMAGE_SELECTION'; payload: string }
  | { type: 'SHIFT_FIRST_SELECTED_IMAGE' }
  | { type: 'CLEAR_SELECTED_IMAGES' };

// Reducer函数
function assetReducer(state: AssetState, action: AssetAction): AssetState {
  switch (action.type) {
    case 'SET_IMAGE_ASSETS':
      return { ...state, imageAssets: action.payload };

    case 'SET_ROOT_DIRECTORY':
      return { ...state, rootDirectory: action.payload };

    case 'TOGGLE_IMAGE_SELECTION': {
      const path = action.payload;
      const isSelected = state.selectedImagePaths.includes(path);

      return {
        ...state,
        selectedImagePaths: isSelected
          ? state.selectedImagePaths.filter(p => p !== path)
          : [...state.selectedImagePaths, path]
      };
    }

    case 'SHIFT_FIRST_SELECTED_IMAGE': {
      if (state.selectedImagePaths.length === 0) return state;
      return {
        ...state,
        selectedImagePaths: state.selectedImagePaths.slice(1)
      };
    }

    case 'CLEAR_SELECTED_IMAGES':
      return { ...state, selectedImagePaths: [] };

    default:
      return state;
  }
}

const AssetContext = createContext<AssetContextType | null>(null)

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(assetReducer, {
    imageAssets: new Map(),
    selectedImagePaths: [],
    rootDirectory: null
  });

  const { imageAssets, selectedImagePaths, rootDirectory } = state;

  // 获取图片尺寸
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      img.src = url
    })
  }

  // 加载目录资源
  const loadAssets = useCallback(async (directoryHandle: FileSystemDirectoryHandle) => {
    dispatch({ type: 'SET_ROOT_DIRECTORY', payload: directoryHandle });
    const newAssets = new Map<string, ImageAsset>()

    // 递归处理文件
    async function processEntry(entry: FileSystemHandle, parentPath: string = '') {
      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle
        const file = await fileHandle.getFile()

        if (file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
          const relativePath = await getRelativePath(directoryHandle, fileHandle) ||
            (parentPath ? `./${parentPath}/${file.name}` : `./${file.name}`)

          const url = URL.createObjectURL(file)
          const dimensions = await getImageDimensions(url)

          newAssets.set(relativePath, {
            name: file.name,
            relativePath,
            url,
            dimensions,
            lastModified: file.lastModified
          })
        }
      } else if (entry.kind === 'directory') {
        const dirHandle = entry as FileSystemDirectoryHandle
        for await (const [name, childEntry] of dirHandle.entries()) {
          if (childEntry.kind === 'directory') {
            await processEntry(childEntry, parentPath ? `${parentPath}/${name}` : name)
          } else {
            await processEntry(childEntry, parentPath)
          }
        }
      }
    }

    try {
      for await (const [_, entry] of directoryHandle.entries()) {
        await processEntry(entry, '')
      }

      dispatch({ type: 'SET_IMAGE_ASSETS', payload: newAssets });
      dispatch({ type: 'CLEAR_SELECTED_IMAGES' });
    } catch (error) {
      console.error('资源加载失败:', error)
    }
  }, [])

  // 提供给Context的值
  const contextValue: AssetContextType = {
    imageAssets,
    selectedImagePaths,
    loadAssets,

    selectImage: (path) => {
      dispatch({ type: 'TOGGLE_IMAGE_SELECTION', payload: path });
    },

    getOrderedSelectedImages: () =>
      selectedImagePaths.map(path => imageAssets.get(path)).filter(Boolean) as ImageAsset[],

    findImageByPath: (path) => path ? imageAssets.get(path) : undefined,

    rootDirectory,

    setRootDirectory: (handle) => {
      dispatch({ type: 'SET_ROOT_DIRECTORY', payload: handle });
    },

    refreshAssets: async () => {
      if (rootDirectory) await loadAssets(rootDirectory);
    },

    shiftFirstSelectedImage: () => {
      if (selectedImagePaths.length === 0) return undefined;
      const firstPath = selectedImagePaths[0];
      dispatch({ type: 'SHIFT_FIRST_SELECTED_IMAGE' });
      return imageAssets.get(firstPath);
    }
  };

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
    </AssetContext.Provider>
  )
}

// 自定义hook
export const useAssets = () => {
  const context = useContext(AssetContext)
  if (!context) throw new Error('useAssets must be used within an AssetProvider')
  return context
}