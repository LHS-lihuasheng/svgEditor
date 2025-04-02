"use client"

import { Button } from "@/components/ui/button"
import { DirectoryTree } from "./DirectoryTree"
import { FolderOpen, RefreshCw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAssets } from "@/contexts/AssetContext"
import { MasonryGallery } from "@/components/svgeditor/SideBarMenu/menuTab/items/AssetsTab/MasonryGallery"

export function AssetsTab() {
  const {
    loadAssets,
    selectImage,
    selectedImagePaths,
    rootDirectory,
    refreshAssets,
    clearSelectedImages,
    directories,
    currentDirectory,
    changeDirectory,
    currentAssets,
    isLoading
  } = useAssets()

  // 修改选择目录的处理函数
  const handleSelectDirectory = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker()
      await loadAssets(directoryHandle as any)
    } catch (error) {
      console.error('目录选择错误:', error)
    }
  }

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
            onClick={refreshAssets}
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
            onSelect={changeDirectory}
          />

          <div className="flex space-x-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={clearSelectedImages}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {rootDirectory ? (
        <div className="mt-4">
          <MasonryGallery
            assets={currentAssets as any}
            selectedImagePaths={Array.from(selectedImagePaths)}
            onSelectImage={selectImage}
            columnsCount={2}
          />
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