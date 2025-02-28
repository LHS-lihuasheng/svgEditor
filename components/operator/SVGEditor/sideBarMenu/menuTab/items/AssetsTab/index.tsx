"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DirectoryTree } from "./DirectoryTree"
import { selectDirectory } from "@/utils/file-utils"
import { FolderOpen, RefreshCw, Check, X } from "lucide-react"
import { ImagePreview } from "@/components/assets/ImagePreview"
import { Checkbox } from "@/components/ui/checkbox"
import { normalizeAssetPath, formatDisplayPath } from '@/utils/pathUtils'
import type { FileEntry } from "@/utils/file-utils"
import { cn } from "@/lib/utils"
import { useAssets } from "@/contexts/AssetContext"


export function AssetsTab() {
  const {
    loadAssets,
    selectImage,
    selectedImagePaths,
    setRootDirectory,
    rootDirectory,
    refreshAssets
  } = useAssets()

  const [files, setFiles] = useState<FileEntry[]>([])
  const [directories, setDirectories] = useState<string[]>([])
  const [currentFiles, setCurrentFiles] = useState<FileEntry[]>([])
  const [currentDirectory, setCurrentDirectory] = useState('root')
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    if (rootDirectory) {
      selectDirectory(rootDirectory).then(({ directories, files }) => {
        setDirectories(directories)
        setFiles(files)
        setCurrentFiles(filterFilesByDirectory(files, 'root'))
      })
    }
  }, [rootDirectory])

  // 修改选择目录的处理函数
  const handleSelectDirectory = async () => {
    try {
      setIsLoading(true)
      const directoryHandle = await window.showDirectoryPicker()

      setRootDirectory(directoryHandle)

      const [_, { directories, files }] = await Promise.all([
        loadAssets(directoryHandle),
        selectDirectory(directoryHandle)
      ])

      setDirectories(directories)
      setFiles(files)
      setCurrentDirectory('root')
      setCurrentFiles(files.filter(f => f.directory === ''))
    } catch (error) {
      console.error('目录选择错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 为了保持一致性，也修改刷新函数中的相关逻辑
  const handleRefresh = async () => {
    if (!rootDirectory) return

    try {
      setIsLoading(true)
      await refreshAssets()

      const { directories, files } = await selectDirectory(rootDirectory)
      setDirectories(directories)
      setFiles(files)
      setCurrentFiles(files.filter(f =>
        currentDirectory === 'root' ? f.directory === '' : f.directory === currentDirectory
      ))
    } catch (error) {
      console.error('刷新目录错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 可以抽取一个通用的文件过滤函数
  const filterFilesByDirectory = (files: FileEntry[], directory: string) => {
    return files.filter(f =>
      directory === 'root' ? f.directory === '' : f.directory === directory
    )
  }

  // 目录切换函数也使用相同的过滤逻辑
  const handleDirectoryChange = async (directory: string) => {
    setCurrentDirectory(directory)
    setCurrentFiles(filterFilesByDirectory(files, directory))
  }

  // 添加事件委托处理函数
  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 查找最近的可点击元素
    const clickableElement = (e.target as HTMLElement).closest('[data-image-path]')
    if (!clickableElement) return

    const path = clickableElement.getAttribute('data-image-path')
    if (path) {
      selectImage(path)
    }
  }, [selectImage])

  return (
    <div className="p-4 space-y-4 relative">
      {/* 加载遮罩层 */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={handleSelectDirectory}
            disabled={isLoading}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            选择素材目录
          </Button>

          <Button
            variant="outline"
            className="px-2"
            onClick={handleRefresh}
            disabled={!rootDirectory || isLoading}
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isLoading && "animate-spin"
            )} />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <DirectoryTree
            directories={directories}
            currentDirectory={currentDirectory}
            onSelect={handleDirectoryChange}
          />

          <div className="flex space-x-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => currentFiles.forEach(file =>
                selectImage(normalizeAssetPath(file.path))
              )}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => currentFiles.forEach(file => {
                const path = normalizeAssetPath(file.path)
                if (selectedImagePaths.includes(path)) selectImage(path)
              })}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {rootDirectory ? (
        <div className="grid grid-cols-2 gap-2" onClick={handleGridClick}>
          {currentFiles.map((file) => (
            <div
              key={file.path}
              data-image-path={normalizeAssetPath(file.path)}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden cursor-pointer",
                "ring-1 ring-muted/20 hover:ring-2 hover:ring-primary/50",
                selectedImagePaths.includes(normalizeAssetPath(file.path)) && "ring-2 ring-primary"
              )}
            >
              <ImagePreview file={file}>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                  {formatDisplayPath(file.relativePath)}
                </div>
              </ImagePreview>
              <Checkbox
                checked={selectedImagePaths.includes(normalizeAssetPath(file.path))}
                className="absolute top-1 right-1 h-4 w-4 bg-background/95"
                onClick={(e) => {
                  e.stopPropagation()
                  selectImage(normalizeAssetPath(file.path))
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">选择包含素材的目录</p>
        </div>
      )}
    </div>
  )
}