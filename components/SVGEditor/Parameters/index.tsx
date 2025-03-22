"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePanel } from "@/contexts/PanelContext"
import { useEditor } from '@/contexts/EditorContext'
import { ComponentEditor } from './editors/ComponentEditor'
import { PropertyProvider } from "./providers/PropertyContext"

export function Parameters() {
  const { isParametersPanelOpen, toggleParametersPanel } = usePanel();
  const { selectedComponent } = useEditor();

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
          <ScrollArea className="h-[calc(100vh-120px)] pr-3">
            {selectedComponent && (
              <PropertyProvider>
                <div className="space-y-4">
                  <div className="text-sm">
                    <span className="font-medium">组件ID: </span>
                    <span>{selectedComponent.id}</span>
                  </div>

                  <div className="border-t pt-4 pb-8 px-1 mt-4">
                    <h4 className="font-medium text-sm mb-3">属性</h4>
                    <div className="space-y-4">
                      <ComponentEditor />
                    </div>
                  </div>
                </div>
              </PropertyProvider>
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