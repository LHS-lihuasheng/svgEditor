/**
 * @description 编辑器内容区域组件
 * 封装了编辑区域的内容显示逻辑
 */
import React from 'react';
import { ComponentTree } from "./ComponentTree";
import { useEditor } from '@/contexts/EditorContext';
import { Image } from "lucide-react";
export function EditorContent() {
    const { components, clearSelection, editorDrop } = useEditor();

    return (
        <div
            ref={editorDrop}
            id="editor-area"
            className="flex-1 p-6 relative overflow-auto"
            onClick={clearSelection}
            style={{
                height: 'calc(100vh - 64px)',
                minHeight: '80vh'
            }}
        >
            {components.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Image className="h-12 w-12 mb-4 opacity-50" />
                <p>点击或拖动左侧组件至此以继续添加</p>
            </div>
            ) : (
                <ComponentTree />
            )}
        </div>
    );
} 