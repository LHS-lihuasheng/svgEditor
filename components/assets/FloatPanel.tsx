"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GripVertical, Maximize2, Minimize2, Image, FolderOpen, Check, X } from "lucide-react"
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


interface SelectedImage {
  name: string
  relativePath: string
  dimensions: {
    width: number
    height: number
  }
  url: string
}

export function FloatPanel() {
  const {
    loadAssets,
    selectImage,
    selectedImagePaths,
    getOrderedSelectedImages
  } = useAssets()

  // 状态管理
  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 80 })
  const [size, setSize] = useState({
    width: 280,
    height: 40
  })

  // DOM引用和拖拽状态
  const panelRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })

  const [files, setFiles] = useState<FileEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentDirectory, setCurrentDirectory] = useState('root')
  const [directories, setDirectories] = useState<string[]>([])
  const [currentFiles, setCurrentFiles] = useState<FileEntry[]>([])

  // 优化后的拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.drag-handle')) return

    const rect = panelRef.current?.getBoundingClientRect()
    if (!rect) return

    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging || !panelRef.current) return

    // 实时更新DOM位置
    const deltaX = e.clientX - dragState.current.startX
    const deltaY = e.clientY - dragState.current.startY
    panelRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`

    // 使用RAF批量更新状态
    requestAnimationFrame(() => {
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      // 重置transform和起始位置
      if (panelRef.current) {
        panelRef.current.style.transform = 'none'
      }
      dragState.current.startX = e.clientX
      dragState.current.startY = e.clientY
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  // 清理事件监听
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // 切换展开/收起
  const toggleSize = useCallback(() => {
    setIsExpanded(prev => {
      const newWidth = !prev ? 600 : 280
      const newHeight = !prev ? 500 : 40
      setSize({ width: newWidth, height: newHeight })
      return !prev
    })
  }, [])

  // 选择目录
  const handleSelectDirectory = async () => {
    try {
      setIsLoading(true)

      // 只调用一次目录选择
      const directoryHandle = await window.showDirectoryPicker()
      console.log('已选择目录:', directoryHandle.name)

      // 同时执行资源加载和文件列表更新
      const [_, { directories, files }] = await Promise.all([
        loadAssets(directoryHandle),
        selectDirectory(directoryHandle) // 修改selectDirectory以接受已有句柄
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

  // 切换当前目录
  const handleDirectoryChange = async (directory: string) => {
    setCurrentDirectory(directory)
    setCurrentFiles(files.filter(f =>
      directory === 'root' ? f.directory === '' : f.directory === directory
    ))
  }

  // 清理资源
  useEffect(() => {
    return () => {
      clearFiles(files)
    }
  }, [files])

  // 处理图片加载完成
  const handleImageLoad = useCallback((path: string, info: {
    dimensions: { width: number; height: number }
    relativePath: string
    name: string
  }) => {
    setFiles(prev => {
      const next = [...prev]
      const file = next.find(f => f.path === path)
      if (file) {
        file.name = info.name
        file.relativePath = info.relativePath
        file.dimensions = info.dimensions
        file.url = info.url
      }
      return next
    })
  }, [])

  // 处理选择变化
  const handleSelectionChange = useCallback((path: string, checked: boolean) => {
    const normalizedPath = normalizeAssetPath(path)
    selectImage(normalizedPath)
  }, [selectImage])

  // 全选当前目录
  const handleSelectAll = useCallback(() => {
    currentFiles.forEach(file => {
      const path = normalizeAssetPath(file.path)
      if (!selectedImagePaths.includes(path)) {
        selectImage(path)
      }
    })
  }, [currentFiles, selectedImagePaths, selectImage])

  // 取消当前目录所有选择
  const handleDeselectAll = useCallback(() => {
    currentFiles.forEach(file => {
      const path = normalizeAssetPath(file.path)
      if (selectedImagePaths.includes(path)) {
        selectImage(path)
      }
    })
  }, [currentFiles, selectedImagePaths, selectImage])

  const handleImageClick = useCallback((file: FileEntry) => {
    const normalizedPath = normalizeAssetPath(file.relativePath)
    selectImage(normalizedPath)
  }, [selectImage])

  return (
    <div
      ref={panelRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "fixed right-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50",
        isExpanded ? "w-[480px]" : "w-[240px]"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: dragState.current.isDragging ? 'grabbing' : 'auto',
        willChange: 'transform'
      }}
    >
      <div className="h-full flex flex-col">
        {/* 标题栏 */}
        <div className="h-10 border-b flex items-center px-3 gap-2 select-none">
          <GripVertical
            className="drag-handle h-4 w-4 text-muted-foreground cursor-move"
          />
          <Image className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">素材库</span>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 w-8 p-0"
            onClick={handleSelectDirectory}
            disabled={isLoading}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleSize}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-hidden">
          {isExpanded && (
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-sm text-muted-foreground">加载中...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm">点击文件夹图标选择素材目录</span>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* 目录选择器和工具栏 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Select
                        value={currentDirectory}
                        onValueChange={handleDirectoryChange}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="选择目录">
                            {currentDirectory === 'root' ? '根目录' : currentDirectory.split('/').pop()}
                          </SelectValue>
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
                                '--indent': dir.split('/').length
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

                      <span className="text-xs text-muted-foreground">
                        {currentFiles.length} 个文件
                      </span>
                    </div>

                    {/* 选择工具栏 */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={handleSelectAll}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        全选
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={handleDeselectAll}
                      >
                        <X className="h-4 w-4 mr-1" />
                        取消
                      </Button>
                    </div>
                  </div>

                  {/* 图片网格 */}
                  <div className="grid grid-cols-5 gap-2">
                    {currentFiles.map((file) => {
                      const normalizedPath = normalizeAssetPath(file.path)
                      const isSelected = selectedImagePaths.includes(normalizedPath)

                      return (
                        <div
                          key={file.path}
                          className={cn(
                            "relative group transition-all duration-200",
                            isSelected && "ring-2 ring-primary"
                          )}
                          onClick={() => handleSelectionChange(file.path, !isSelected)}
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
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectionChange(file.path, checked as boolean)
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
} 