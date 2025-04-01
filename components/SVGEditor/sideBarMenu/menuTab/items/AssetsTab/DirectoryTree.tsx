"use client"

import { FolderOpen } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { DirectoryNode } from "@/types/asset"
import { buildDirectoryTree } from "@/utils/assetUtils"

interface DirectoryTreeProps {
    directories: string[]
    currentDirectory: string
    onSelect: (path: string) => void
}

export function DirectoryTree({ directories, currentDirectory, onSelect }: DirectoryTreeProps) {
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
                    <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => onSelect(node.path)}
                    >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        <span className="text-muted-foreground">当前目录</span>
                    </DropdownMenuItem>
                    <div className="h-px bg-muted my-1" />
                    {node.children.map(child => renderSubMenu(child))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                    data-testid="directory-trigger"
                >
                    <div className="flex items-center">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        {currentDirectory === 'root'
                            ? '根目录'
                            : currentDirectory.split('/').pop()}
                    </div>
                </button>
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
