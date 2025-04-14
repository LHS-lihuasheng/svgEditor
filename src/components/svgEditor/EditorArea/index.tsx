"use client"

import { cn } from "@/lib/utils"
import { EditorToolbar } from "./EditorToolbar"
import { useEditor } from "@/contexts/EditorContext"
import { Image } from "lucide-react"
import { ComponentTree } from "./ComponentTree"

export function EditorArea() {
  const { editorDrop, clearSelection, components } = useEditor();
  return (
    <div className={cn(
      "flex flex-col overflow-hidden bg-white"
    )}>
      <div className="flex-1 flex flex-col">
        <EditorToolbar />

        <div className="flex-1 overflow-auto">
          <div
            ref={editorDrop}
            id="editor-area"
            className="relative h-full"
            onClick={clearSelection}
          >
            <div className="p-6 h-full">
              {components.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Image className="h-12 w-12 mb-4 opacity-50" />
                  <p>点击或拖动左侧组件至此以继续添加</p>
                </div>
              ) : (
                <ComponentTree />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 