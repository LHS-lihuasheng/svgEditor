"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePanel } from "@/contexts/PanelContext"
import { useEditor } from '@/contexts/EditorContext/index'
import type { BaseComponent } from "@/types/core"

// 导入组件编辑器
import { 
  SVGPicEditor, 
  GroupEditor, 
  RectEditor
} from './ComponentEditors'

interface ParametersProps {
  selectedComponent: BaseComponent | null;
}

export function Parameters({ selectedComponent }: ParametersProps) {
  const { isParametersPanelOpen, toggleParametersPanel } = usePanel();
  const { updateComponent } = useEditor();
  
  // 添加调试日志，观察组件变化
  useEffect(() => {
    console.log("Selected component updated:", selectedComponent);
  }, [selectedComponent]);

  /**
   * 根据组件类型渲染对应的编辑器
   */
  const renderEditor = () => {
    if (!selectedComponent) {
      return (
        <div className="text-sm text-gray-500">
          请选择一个组件来编辑其属性
        </div>
      );
    }

    // 根据组件类型选择合适的编辑器
    switch (selectedComponent.type) {
      case 'svgPic':
        return <SVGPicEditor component={selectedComponent} />;
      case 'g':
        return <GroupEditor component={selectedComponent} />;
      case 'rect':
        return <RectEditor component={selectedComponent} />;
      default:
        return (
          <div className="text-sm text-yellow-600">
            暂不支持编辑此类型组件: {selectedComponent.type}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "fixed top-[57px] right-0 bottom-0 bg-white shadow-lg transition-[width] duration-300 ease-in-out z-10",
        isParametersPanelOpen ? "w-96" : "w-12"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-2 h-8 w-8"
        onClick={toggleParametersPanel}
      >
        {isParametersPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {isParametersPanelOpen && (
        <div className="p-4 pt-12">
          <h3 className="font-medium text-sm mb-2">参数设置</h3>
          <ScrollArea className="h-[calc(100vh-120px)]">
            {selectedComponent && (
              <div className="space-y-4">
                <div className="text-sm">
                  <span className="font-medium">组件ID: </span>
                  <span>{selectedComponent.id}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">组件类型: </span>
                  <span>{selectedComponent.type}</span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3">属性</h4>
                  <div className="space-y-4">
                    {renderEditor()}
                  </div>
                </div>
              </div>
            )}
            {!selectedComponent && (
              <div className="text-sm text-gray-500">
                请选择一个组件来编辑其属性
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
} 