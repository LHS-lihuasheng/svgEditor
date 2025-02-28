"use client"

import { useState, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    ChevronLeft,
    ChevronRight,
    Boxes,
    ImageIcon,
    FolderOpen,
    Check,
    X,
    RefreshCw,
    Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Toolbar } from "../../Toolbar"
import type { Component } from "@/types/atomicComponent"
import { Button } from "@/components/ui/button"
import { selectDirectory } from "@/utils/fileSystem"
import type { FileEntry } from "@/utils/fileSystem"
import { ImagePreview } from "@/components/assets/ImagePreview"
import { Checkbox } from "@/components/ui/checkbox"
import { useAssets } from "@/contexts/AssetContext"
import { normalizeAssetPath, formatDisplayPath } from '@/utils/pathUtils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ComponentListProps {
    isOpen: boolean
    onToggle: () => void
    onAddComponent: (type: Component['type'], position: { x: number; y: number }) => void
}

interface DirectoryNode {
    name: string
    path: string
    children: DirectoryNode[]
}

export function ComponentList({ isOpen, onToggle, onAddComponent }: ComponentListProps) {
    const [activeTab, setActiveTab] = useState<'components' | 'assets' | 'parameters'>('components')
    const {
        loadAssets,
        selectImage,
        selectedImagePaths,
        rootDirectory,
        setRootDirectory,
        refreshAssets
    } = useAssets()

    // 素材管理相关状态
    const [files, setFiles] = useState<FileEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [currentDirectory, setCurrentDirectory] = useState('root')
    const [directories, setDirectories] = useState<string[]>([])
    const [currentFiles, setCurrentFiles] = useState<FileEntry[]>([])

    // 修改目录树处理函数
    const buildDirectoryTree = (directories: string[]): DirectoryNode[] => {
        const root: DirectoryNode[] = []
        const map: { [key: string]: DirectoryNode } = {}

        // 按路径长度排序，确保父目录先处理
        directories.sort((a, b) => a.split('/').length - b.split('/').length)

        directories.forEach(path => {
            const parts = path.split('/')
            const name = parts[parts.length - 1]
            const parentPath = parts.slice(0, -1).join('/')

            const node: DirectoryNode = {
                name,
                path,
                children: []
            }

            map[path] = node

            if (parentPath) {
                // 如果有父目录，添加到父目录的children中
                const parent = map[parentPath]
                if (parent) {
                    parent.children.push(node)
                }
            } else {
                // 如果没有父目录，则为根级目录
                root.push(node)
            }
        })

        return root
    }

    // 修改目录选择器组件
    const DirectorySelector = ({
        currentDirectory,
        directories,
        onSelect
    }: {
        currentDirectory: string
        directories: string[]
        onSelect: (dir: string) => void
    }) => {
        const dirTree = buildDirectoryTree(directories)

        const renderSubMenu = (node: DirectoryNode) => {
            if (node.children.length === 0) {
                return (
                    <DropdownMenuItem
                        key={node.path}
                        className="flex items-center"
                        onClick={() => onSelect(node.path)}
                    >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        <span>{node.name}</span>
                    </DropdownMenuItem>
                )
            }

            return (
                <DropdownMenuSub key={node.path}>
                    <DropdownMenuSubTrigger className="flex items-center">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        <span>{node.name}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {/* 先添加当前目录的选项 */}
                        <DropdownMenuItem
                            className="flex items-center"
                            onClick={() => onSelect(node.path)}
                        >
                            <FolderOpen className="h-4 w-4 mr-2" />
                            <span className="text-muted-foreground">当前目录</span>
                        </DropdownMenuItem>
                        {/* 分隔线 */}
                        <div className="h-px bg-muted my-1" />
                        {/* 子目录列表 */}
                        {node.children.map(child => renderSubMenu(child))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            )
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-xs"
                    >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        {currentDirectory === 'root'
                            ? '根目录'
                            : currentDirectory.split('/').pop()
                        }
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                    <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => onSelect('root')}
                    >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        根目录
                    </DropdownMenuItem>
                    {dirTree.length > 0 && (
                        <>
                            <div className="h-px bg-muted my-1" />
                            {dirTree.map(node => renderSubMenu(node))}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // 修改按钮点击处理逻辑
    const handleTabChange = useCallback((tab: 'components' | 'assets' | 'parameters') => {
        // 如果当前是收起状态，先展开侧边栏
        if (!isOpen) {
            onToggle()
        }
        // 稍后切换标签页保证动画效果
        setTimeout(() => setActiveTab(tab), 50)
    }, [isOpen, onToggle])

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
        <div
            className={cn(
                "fixed top-[57px] left-0 bottom-0 bg-white shadow-lg transition-[width] duration-300 ease-in-out z-10",
                isOpen ? "w-72" : "w-12"
            )}
        >
            <div className="h-full flex">
                {/* 导航图标栏 */}
                <div className="w-12 border-r flex flex-col">
                    <button
                        className={cn(
                            "h-12 flex items-center justify-center hover:bg-gray-100 transition-colors",
                            activeTab === 'components' && "bg-gray-100"
                        )}
                        onClick={() => handleTabChange('components')}
                    >
                        <Boxes className={cn(
                            "h-5 w-5 transition-colors",
                            activeTab === 'components' ? "text-primary" : "text-muted-foreground"
                        )} />
                    </button>

                    <button
                        className={cn(
                            "h-12 flex items-center justify-center hover:bg-gray-100 transition-colors",
                            activeTab === 'parameters' && "bg-gray-100"
                        )}
                        onClick={() => handleTabChange('parameters')}
                    >
                        <Settings className={cn(
                            "h-5 w-5 transition-colors",
                            activeTab === 'parameters' ? "text-primary" : "text-muted-foreground"
                        )} />
                    </button>

                    <button
                        className={cn(
                            "h-12 flex items-center justify-center hover:bg-gray-100 transition-colors",
                            activeTab === 'assets' && "bg-gray-100"
                        )}
                        onClick={() => handleTabChange('assets')}
                    >
                        <ImageIcon className={cn(
                            "h-5 w-5 transition-colors",
                            activeTab === 'assets' ? "text-primary" : "text-muted-foreground"
                        )} />
                    </button>

                    {/* 底部收起按钮保持原有功能 */}
                    <button
                        className="mt-auto h-12 flex items-center justify-center hover:bg-gray-100 border-t"
                        onClick={onToggle}
                    >
                        {isOpen ? (
                            <ChevronLeft className="h-5 w-5 text-muted-foreground transition-transform" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                        )}
                    </button>
                </div>

                {/* 内容区 */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1">
                        {activeTab === 'components' ? (
                            <div className="p-4">
                                <Toolbar onAddComponent={onAddComponent} />
                            </div>
                        ) : activeTab === 'parameters' ? (
                            <div className="p-4">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">组件参数设置</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm">宽度</label>
                                            <input
                                                type="number"
                                                className="w-20 px-2 py-1 border rounded"
                                                placeholder="自动"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm">高度</label>
                                            <input
                                                type="number"
                                                className="w-20 px-2 py-1 border rounded"
                                                placeholder="自动"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm">定位方式</label>
                                            <select className="w-32 px-2 py-1 border rounded">
                                                <option>静态</option>
                                                <option>绝对定位</option>
                                                <option>固定定位</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                {/* 素材管理操作栏 */}
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
                                            disabled={isLoading || !rootDirectory}
                                        >
                                            <RefreshCw className={cn(
                                                "h-4 w-4",
                                                isLoading && "animate-spin"
                                            )} />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <DirectorySelector
                                            currentDirectory={currentDirectory}
                                            directories={directories}
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

                                {/* 素材展示区 */}
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="animate-spin h-8 w-8 border-4 border-primary/50 rounded-full border-t-transparent" />
                                    </div>
                                ) : files.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                        <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
                                        <p className="text-sm">选择包含素材的目录</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2" onClick={handleGridClick}>
                                        {currentFiles.map((file) => {
                                            const normalizedPath = normalizeAssetPath(file.path)
                                            const isSelected = selectedImagePaths.includes(normalizedPath)

                                            return (
                                                <div
                                                    key={file.path}
                                                    data-image-path={normalizedPath}
                                                    className={cn(
                                                        "relative aspect-square rounded-md overflow-hidden cursor-pointer",
                                                        "ring-1 ring-muted/20 hover:ring-2 hover:ring-primary/50",
                                                        isSelected && "ring-2 ring-primary"
                                                    )}
                                                >
                                                    <ImagePreview
                                                        file={file}
                                                        onLoad={(info) => {
                                                            if (file.url) {
                                                                info.url = file.url
                                                            }
                                                        }}
                                                    >
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                                            {formatDisplayPath(file.relativePath)}
                                                        </div>
                                                    </ImagePreview>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        className="absolute top-1 right-1 h-4 w-4 bg-background/95"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            selectImage(normalizedPath)
                                                        }}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
} 