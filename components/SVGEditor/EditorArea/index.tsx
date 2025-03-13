"use client"

import { cn } from "@/lib/utils"
import { EditorToolbar } from "./EditorToolbar"
import { EditorContent } from "./EditorContent"
  
interface EditorAreaProps {
  dropRef: React.RefObject<HTMLDivElement>
}

export function EditorArea({ dropRef}: EditorAreaProps) {
  return (
    <div className={cn(
      "flex-1 transition-all duration-300 ml-96 mr-96",
    )}>
      <div className="h-full flex">
        <div className="flex-1 flex flex-col bg-white shadow-sm rounded-lg">
          {/* 顶部工具栏 */}
          <EditorToolbar />

          {/* 编辑区域 */}
          <EditorContent
            dropRef={dropRef}
          />
        </div>
      </div>
    </div>
  )
} 