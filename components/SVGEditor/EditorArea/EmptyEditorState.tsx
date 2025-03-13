/**
 * @description 编辑器空状态提示组件
 */
import React from 'react';
import { Image } from "lucide-react";

export function EmptyEditorState() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Image className="h-12 w-12 mb-4 opacity-50" />
            <p>拖动左侧组件至此以继续添加</p>
        </div>
    );
} 