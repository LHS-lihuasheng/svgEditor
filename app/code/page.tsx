"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ChevronRight, Folder, File, Plus, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { z } from "zod"

// 定义文件节点类型
const FileNodeSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["file", "folder"]),
    content: z.string().optional(),
    children: z.lazy(() => FileNodeSchema.array()).optional(),
})

type FileNode = z.infer<typeof FileNodeSchema>

export default function CodePage() {
    const [code, setCode] = useState("// 选择或创建新文件")
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)

    // 示例文件树结构
    const [fileTree, setFileTree] = useState<FileNode[]>([
        {
            id: "root",
            name: "项目",
            type: "folder",
            children: [
                {
                    id: "src",
                    name: "src",
                    type: "folder",
                    children: [
                        { id: "main.ts", name: "main.ts", type: "file", content: "console.log('Hello World')" },
                    ],
                },
            ],
        },
    ])

    // 渲染文件树
    const renderTree = (nodes: FileNode[]) => (
        <div className="space-y-1">
            {nodes.map((node) => (
                <div key={node.id}>
                    <div
                        className={cn(
                            "flex items-center px-3 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer",
                            selectedFile === node.id && "bg-blue-50"
                        )}
                        onClick={() => node.type === "file" && handleFileSelect(node)}
                    >
                        {node.type === "folder" ? (
                            <Folder className="h-4 w-4 mr-2 text-blue-500" />
                        ) : (
                            <File className="h-4 w-4 mr-2 text-gray-500" />
                        )}
                        <span className="text-sm">{node.name}</span>
                        {node.type === "folder" && (
                            <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                        )}
                    </div>
                    {node.children && (
                        <div className="ml-4">{renderTree(node.children)}</div>
                    )}
                </div>
            ))}
        </div>
    )

    const handleFileSelect = (file: FileNode) => {
        setSelectedFile(file.id)
        setCode(file.content || "// 新文件")
    }

    return (
        <div className="h-screen bg-slate-50 flex">
            {/* 侧边栏 */}
            <div
                className={cn(
                    "w-64 bg-white border-r border-slate-200 transition-all duration-300",
                    isSidebarOpen ? "block" : "hidden lg:block lg:w-20"
                )}
            >
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h1 className={cn(
                            "font-semibold",
                            !isSidebarOpen && "lg:hidden"
                        )}>
                            {isSidebarOpen ? "文件资源管理器" : <Folder className="h-5 w-5" />}
                        </h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-7 w-7"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <ChevronRight className={cn(
                                "h-4 w-4 transition-transform",
                                isSidebarOpen && "rotate-180"
                            )} />
                        </Button>
                    </div>
                </div>

                <div className="p-2">
                    <div className="mb-4">
                        <Button variant="outline" size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            {isSidebarOpen && "新建文件"}
                        </Button>
                    </div>
                    {renderTree(fileTree)}
                </div>
            </div>

            {/* 主编辑区 */}
            <div className="flex-1 flex flex-col">
                <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            {selectedFile || "未选择文件"}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        全屏
                    </Button>
                </div>

                <div className="flex-1 bg-white">
                    <Editor
                        height="100%"
                        defaultLanguage="typescript"
                        value={code}
                        theme="vs"
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            lineNumbers: "on",
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            lineDecorationsWidth: 5,
                            lineNumbersMinChars: 3,
                            padding: { top: 10 },
                            renderLineHighlight: "all",
                            scrollbar: {
                                verticalScrollbarSize: 8,
                                horizontalScrollbarSize: 8,
                                useShadows: false
                            },
                            colors: {
                                "editor.background": "#f8fafc",
                                "editorLineNumber.foreground": "#94a3b8",
                                "editor.lineHighlightBackground": "#f1f5f9",
                                "editor.selectionBackground": "#e2e8f0",
                            }
                        }}
                        onChange={(value) => setCode(value || '')}
                    />
                </div>
            </div>
        </div>
    )
} 