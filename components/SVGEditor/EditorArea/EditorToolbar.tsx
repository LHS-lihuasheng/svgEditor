/**
 * @description 编辑器顶部工具栏组件
 * 管理编辑器顶部的操作按钮
 */
import React from 'react';
import { Button } from "@/components/ui/button";
import { LucideRefreshCw, LucideEye, Settings, LucideCode, LucideFileCode2 } from "lucide-react";
import { usePanel } from '@/contexts/PanelContext';
import { useEditor } from '@/contexts/EditorContext';

export function EditorToolbar() {
    const { setShowCodePreview } = usePanel();
    const { updateComponents } = useEditor();
    return (
        <div className="h-12 bg-white shadow-sm border-b px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateComponents(draft => {
                        draft.splice(0, draft.length);
                    })}
                >
                    <LucideRefreshCw className="h-4 w-4 mr-2" />
                    重置
                </Button>
                <Button variant="ghost" size="sm">
                    <LucideEye className="h-4 w-4 mr-2" />
                    预览
                </Button>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowCodePreview(true)}
                >
                    <LucideCode className="h-4 w-4 mr-2" />
                    获取代码
                </Button>
            </div>
        </div >
    );
} 