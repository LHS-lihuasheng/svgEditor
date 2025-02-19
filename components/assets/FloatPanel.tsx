"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GripVertical, Maximize2, Minimize2, Image, FolderOpen, Check, X } from "lucide-react"
import { selectDirectory, loadFiles, clearFiles } from "@/utils/fileSystem"
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

export function FloatPanel() {
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
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [selectionHistory, setSelectionHistory] = useState<Set<string>[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

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

  // 加载已保存的文件
  useEffect(() => {
    loadFiles().then(({ directories, files }) => {
      setDirectories(directories)
      setFiles(files)
      setCurrentDirectory('root')
      setCurrentFiles(files.filter(f => f.directory === ''))
    }).catch(console.error)
  }, [])

  // 选择目录
  const handleSelectDirectory = async () => {
    try {
      setIsLoading(true)
      const { directories, files, currentDirectory } = await selectDirectory()
      setDirectories(directories)
      setFiles(files)
      setCurrentDirectory(currentDirectory)
      setCurrentFiles(files.filter(f => f.directory === currentDirectory))
      setIsExpanded(true)
    } catch (error) {
      console.error('Error selecting directory:', error)
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
      clearFiles().catch(console.error)
    }
  }, [])

  // 处理选择变化
  const handleSelectionChange = useCallback((path: string, checked: boolean) => {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(path)
      } else {
        next.delete(path)
      }
      return next
    })
  }, [])

  // 全选当前目录
  const handleSelectAll = useCallback(() => {
    const newSelection = new Set([...selectedFiles])
    currentFiles.forEach(file => newSelection.add(file.path))

    // 保存历史
    setSelectionHistory(prev => [...prev.slice(0, historyIndex + 1), selectedFiles])
    setHistoryIndex(prev => prev + 1)

    setSelectedFiles(newSelection)
  }, [currentFiles, selectedFiles, historyIndex])

  // 取消当前目录所有选择
  const handleDeselectAll = useCallback(() => {
    const newSelection = new Set([...selectedFiles])
    currentFiles.forEach(file => newSelection.delete(file.path))

    // 保存历史
    setSelectionHistory(prev => [...prev.slice(0, historyIndex + 1), selectedFiles])
    setHistoryIndex(prev => prev + 1)

    setSelectedFiles(newSelection)
  }, [currentFiles, selectedFiles, historyIndex])

  // 撤销/重做选择
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setSelectedFiles(selectionHistory[historyIndex - 1])
    }
  }, [historyIndex, selectionHistory])

  const handleRedo = useCallback(() => {
    if (historyIndex < selectionHistory.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setSelectedFiles(selectionHistory[historyIndex + 1])
    }
  }, [historyIndex, selectionHistory])

  return (
    <div
      ref={panelRef}
      onMouseDown={handleMouseDown}
      className="fixed bg-background shadow-lg rounded-lg border z-50 transition-all"
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
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleUndo}
                          disabled={historyIndex <= 0}
                        >
                          ↶
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleRedo}
                          disabled={historyIndex >= selectionHistory.length - 1}
                        >
                          ↷
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 图片网格 */}
                  <div className="grid grid-cols-5 gap-2">
                    {currentFiles.map((file) => (
                      <div key={file.path} className="relative group">
                        <ImagePreview
                          file={file}
                          onClick={() => handleSelectionChange(
                            file.path,
                            !selectedFiles.has(file.path)
                          )}
                        />
                        <div className="absolute top-1 left-1">
                          <Checkbox
                            checked={selectedFiles.has(file.path)}
                            onCheckedChange={(checked) =>
                              handleSelectionChange(file.path, checked as boolean)
                            }
                          />
                        </div>
                      </div>
                    ))}
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