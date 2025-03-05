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

export interface DirectoryNode {
    name: string
    path: string
    children: DirectoryNode[]
}

interface DirectoryTreeProps {
    directories: string[]
    currentDirectory: string
    onSelect: (path: string) => void
}

const buildDirectoryTree = (directories: string[]): DirectoryNode[] => {
    const root: DirectoryNode[] = []
    const map: { [key: string]: DirectoryNode } = {}

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
            const parent = map[parentPath]
            parent?.children.push(node)
        } else {
            root.push(node)
        }
    })

    return root
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
