"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FolderOpen, Check, X, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { selectDirectory, clearFiles } from "@/utils/fileSystem"
import type { FileEntry } from "@/utils/fileSystem"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImagePreview } from "./ImagePreview"
import { cn } from "@/lib/utils"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAssets } from "@/contexts/AssetContext"
import { normalizeAssetPath, formatDisplayPath } from '@/utils/pathUtils'

export function AssetSidebar() {
  const {
    loadAssets,
    selectImage,
    selectedImagePaths,
    getOrderedSelectedImages
  } = useAssets()

  const [isExpanded, setIsExpanded] = useState(true)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentDirectory, setCurrentDirectory] = useState('root')
  const [directories, setDirectories] = useState<string[]>([])
  const [currentFiles, setCurrentFiles] = useState<FileEntry[]>([])

  // 选择目录
  const handleSelectDirectory = async () => {
    try {
      setIsLoading(true)
      const directoryHandle = await window.showDirectoryPicker()
      
      const [_, { directories, files }] = await Promise.all([
        loadAssets(directoryHandle),
        selectDirectory(directoryHandle)
      ])

      setDirectories(directories)
      setFiles(files)
      setCurrentDirectory('root')
      setCurrentFiles(files)
      setIsExpanded(true)
    } catch (error) {
      console.error('目录选择错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理图片加载完成（添加url类型声明）
  const handleImageLoad = useCallback((path: string, info: {
    dimensions: { width: number; height: number }
    relativePath: string
    name: string
    url: string // 添加url属性
  }) => {
    setFiles(prev => {
      const next = [...prev]
      const file = next.find(f => f.path === path)
      if (file) {
        file.name = info.name
        file.relativePath = info.relativePath
        file.dimensions = info.dimensions
        file.url = info.url // 现在类型匹配
      }
      return next
    })
  }, [])

  // 在现有状态后添加目录切换处理
  const handleDirectoryChange = async (directory: string) => {
    setCurrentDirectory(directory)
    setCurrentFiles(files.filter(f => 
      directory === 'root' ? f.directory === '' : f.directory === directory
    ))
  }

  return (
    <div className={cn(
      "asset-sidebar fixed left-0 top-0 h-full bg-background shadow-lg transition-transform duration-300",
      isExpanded ? "w-96" : "w-12"
    )}>
      <div className="h-full flex flex-col border-r">
        {/* 折叠按钮 */}
        <Button 
          variant="ghost"
          className="h-10 w-10 p-0 ml-auto rounded-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>

        {isExpanded && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 操作栏 */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleSelectDirectory}
                    disabled={isLoading}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    选择素材目录
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      currentFiles.forEach(file => {
                        const path = normalizeAssetPath(file.path)
                        selectImage(path)
                      })
                    }}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    全选
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      currentFiles.forEach(file => {
                        const path = normalizeAssetPath(file.path)
                        if (selectedImagePaths.includes(path)) {
                          selectImage(path)
                        }
                      })
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    取消
                  </Button>
                </div>
              </div>
            </div>

            {/* 内容区 */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* 目录选择器 */}
                <Select
                  value={currentDirectory}
                  onValueChange={handleDirectoryChange}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="选择目录" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">
                      <span className="flex items-center">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        根目录
                      </span>
                    </SelectItem>
                    {directories.map(dir => (
                      <SelectItem
                        key={dir}
                        value={dir}
                        className="pl-[calc(var(--indent)*12px)]"
                        style={{
                          '--indent': dir.split('/').length - 1
                        } as React.CSSProperties}
                      >
                        <span className="flex items-center">
                          <FolderOpen className="h-4 w-4 mr-2" />
                          {dir.split('/').pop()}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 图片网格布局调整 */}
                <div className="grid grid-cols-3 gap-3">
                  {currentFiles.map((file) => (
                    <div 
                      key={file.path}
                      className={cn(
                        "group relative aspect-square rounded-md overflow-hidden cursor-pointer",
                        "transition-all duration-200 hover:ring-2 hover:ring-primary/50",
                        selectedImagePaths.includes(normalizeAssetPath(file.path)) 
                          ? "ring-2 ring-primary" 
                          : "ring-1 ring-muted/20"
                      )}
                    >
                      <ImagePreview
                        file={file}
                        onLoad={(info) => handleImageLoad(file.path, info)}
                      >
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                          {formatDisplayPath(file.relativePath)}
                        </div>
                      </ImagePreview>
                      
                      <Checkbox
                        checked={selectedImagePaths.includes(normalizeAssetPath(file.path))}
                        className="absolute top-1 right-1 h-4 w-4 bg-background/95"
                      />
                    </div>
                  ))}
                </div>

                {/* 在内容区添加加载状态处理 */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-full p-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary/50 rounded-full border-t-transparent" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">选择包含素材的目录</p>
                    <p className="text-xs mt-1 text-muted-foreground/70">支持PNG/JPG/SVG等格式</p>
                  </div>
                ) : (
                  // 正常内容显示
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
} 