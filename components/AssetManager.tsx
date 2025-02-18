"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideCode, LucideFolder, LucideImage, Maximize2, Minimize2, X, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Resizable } from "re-resizable"

interface Asset {
  name: string
  path: string
  type: 'image' | 'folder'
  handle?: FileSystemHandle
  url?: string
}

// 添加类型定义
interface FileSystemDirectoryHandle extends FileSystemHandle {
  values(): AsyncIterableIterator<FileSystemHandle>
  getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>
}

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>
  }
}

export function AssetManager() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [size, setSize] = useState({
    width: isExpanded ? 600 : 280,
    height: isExpanded ? 600 : 40
  })
  const [position, setPosition] = useState(() => ({
    right: 20,
    top: 80
  }))
  const dragRef = useRef<{
    isDragging: boolean
    startX: number
    startY: number
    startPosX: number
    startPosY: number
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0
  })
  const [assets, setAssets] = useState<Asset[]>([])
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [activeTab, setActiveTab] = useState<'assets' | 'code'>('assets')

  // 选择文件夹
  const handleSelectFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      })
      setRootHandle(handle)
      await loadDirectory(handle)
    } catch (error) {
      console.error('Error selecting folder:', error)
    }
  }

  // 加载目录内容
  const loadDirectory = async (dirHandle: FileSystemDirectoryHandle, path: string[] = []) => {
    const entries: Asset[] = []

    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'directory') {
        entries.push({
          name: entry.name,
          path: [...path, entry.name].join('/'),
          type: 'folder',
          handle: entry
        })
      } else if (entry.kind === 'file') {
        const file = await entry.getFile()
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          entries.push({
            name: entry.name,
            path: [...path, entry.name].join('/'),
            type: 'image',
            handle: entry,
            url
          })
        }
      }
    }

    setAssets(entries.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'folder' ? -1 : 1
    }))
    setCurrentPath(path)
  }

  // 清理 URL
  useEffect(() => {
    return () => {
      assets.forEach(asset => {
        if (asset.url) {
          URL.revokeObjectURL(asset.url)
        }
      })
    }
  }, [assets])

  // 处理文件夹点击
  const handleFolderClick = async (asset: Asset) => {
    if (asset.handle && asset.handle.kind === 'directory') {
      await loadDirectory(asset.handle, [...currentPath, asset.handle.name])
    }
  }

  // 处理返回上级
  const handleBack = async () => {
    if (!rootHandle || currentPath.length === 0) return

    let handle = rootHandle
    const newPath = currentPath.slice(0, -1)

    for (const segment of newPath) {
      handle = await handle.getDirectoryHandle(segment)
    }

    await loadDirectory(handle, newPath)
  }

  // 拖拽处理逻辑
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.currentTarget.closest('.grip-icon')) return
    e.preventDefault()
    e.stopPropagation()

    const container = document.querySelector('.asset-manager')?.getBoundingClientRect()
    if (!container) return

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: container.right,
      startPosY: container.top
    }
  }

  // 拖动计算逻辑
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return
      e.preventDefault()

      const deltaX = dragRef.current.startX - e.clientX
      const deltaY = e.clientY - dragRef.current.startY

      const newRight = dragRef.current.startPosX + deltaX
      const newTop = dragRef.current.startPosY + deltaY

      setPosition({
        right: Math.max(20, Math.min(newRight, window.innerWidth - size.width - 20)),
        top: Math.max(20, Math.min(newTop, window.innerHeight - size.height - 20))
      })
    }

    const handleMouseUp = () => {
      dragRef.current.isDragging = false
    }

    if (dragRef.current.isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [size])

  // 展开/收起处理
  const handleToggleExpand = () => {
    setIsExpanded(prev => {
      const newIsExpanded = !prev
      setPosition(p => ({
        right: window.innerWidth - (newIsExpanded ? 600 : 280) - 20,
        top: p.top
      }))
      return newIsExpanded
    })

    setSize(prev => ({
      width: !isExpanded ? 600 : 280,
      height: !isExpanded ? 600 : 40
    }))
  }

  return (
    <div
      className="fixed z-[100] asset-manager"
      style={{
        right: position.right,
        top: position.top,
        width: size.width,
        height: size.height
      }}
    >
      <Resizable
        size={size}
        onResizeStop={(e, direction, ref, d) => {
          setSize({
            width: Math.max(280, (size.width as number) + d.width),
            height: Math.max(40, (size.height as number) + d.height)
          })
        }}
        minWidth={280}
        maxWidth={1200}
        minHeight={40}
        maxHeight={800}
        enable={{
          top: isExpanded,
          right: isExpanded,
          bottom: isExpanded,
          left: isExpanded,
          topRight: isExpanded,
          bottomRight: isExpanded,
          bottomLeft: isExpanded,
          topLeft: isExpanded
        }}
        className={cn(
          "bg-white shadow-lg rounded-lg overflow-hidden relative",
          "transition-all duration-200",
          !isExpanded && "hover:shadow-xl"
        )}
      >
        <div className="h-full flex flex-col select-none">
          {isExpanded ? (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'assets' | 'code')} className="h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <div
                  className="drag-handle p-1 hover:bg-gray-100 rounded absolute left-2 top-1/2 -translate-y-1/2"
                >
                  <GripVertical
                    className="grip-icon h-4 w-4 text-gray-400 cursor-move"
                    onMouseDown={handleDragStart}
                  />
                </div>
                <TabsList className="w-full ml-8">
                  <TabsTrigger value="assets" className="flex-1">
                    <LucideImage className="h-4 w-4 mr-2" />
                    素材库
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex-1">
                    <LucideCode className="h-4 w-4 mr-2" />
                    代码
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 relative z-10"
                    onClick={handleToggleExpand}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 ml-1"
                    onClick={() => setIsExpanded(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="assets" className="flex-1 flex flex-col">
                {!rootHandle ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Button onClick={handleSelectFolder}>
                      <LucideFolder className="h-4 w-4 mr-2" />
                      选择素材文件夹
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 路径导航 */}
                    <div className="px-4 py-2 border-b text-sm text-gray-500 flex items-center">
                      <button
                        className="hover:text-gray-900 disabled:opacity-50"
                        onClick={handleBack}
                        disabled={currentPath.length === 0}
                      >
                        返回上级
                      </button>
                      <span className="mx-2">|</span>
                      <span>{currentPath.join('/')}</span>
                    </div>

                    {/* 素材列表 */}
                    <ScrollArea className="flex-1">
                      <div className="p-4 grid grid-cols-2 gap-2">
                        {assets.map((asset) => (
                          <div
                            key={asset.path}
                            className={cn(
                              "group relative aspect-square rounded-lg border overflow-hidden",
                              "hover:border-blue-500 transition-colors duration-200",
                              asset.type === 'folder' && "cursor-pointer"
                            )}
                            onClick={() => asset.type === 'folder' && handleFolderClick(asset)}
                          >
                            {asset.type === 'folder' ? (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <LucideFolder className="h-8 w-8 text-gray-400" />
                              </div>
                            ) : (
                              <img
                                src={asset.url}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white truncate">
                              {asset.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </TabsContent>

              <TabsContent value="code" className="flex-1">
                {/* 代码预览区域保持不变 */}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="drag-handle p-1 hover:bg-gray-100 rounded">
                  <GripVertical
                    className="grip-icon h-4 w-4 text-gray-400 cursor-move"
                    onMouseDown={handleDragStart}
                  />
                </div>
                <LucideImage className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">素材库</span>
                {!rootHandle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={handleSelectFolder}
                  >
                    <LucideFolder className="h-4 w-4 mr-2" />
                    选择文件夹
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative z-10"
                onClick={handleToggleExpand}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Resizable>
    </div>
  )
}

