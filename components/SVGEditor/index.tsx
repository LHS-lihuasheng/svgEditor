"use client"

import React from 'react';
import { SideBarMenu } from "./SideBarMenu";
import { EditorArea } from "./EditorArea";
import { Parameters } from "./Parameters/index";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CodePreviewModal } from "./CodePreviewModal";
import { PanelProvider, usePanel } from '@/contexts/PanelContext';
import { EditorProvider } from '@/contexts/EditorContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CodeProvider } from '@/contexts/CodeContext';
import { AssetProvider } from "@/contexts/AssetContext"
import { cn } from "@/lib/utils"

/**
 * @description SVG编辑器的顶层容器组件，提供所有必要的上下文
 * @returns {JSX.Element} 带有所有必要上下文的SVG编辑器组件
 */
export default function SVGEditorContainer() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AssetProvider>
        <EditorProvider>
          <PanelProvider>
            <CodeProvider>
              <TooltipProvider>
                <EditorLayout />
                <CodePreviewModalWrapper />
              </TooltipProvider>
            </CodeProvider>
          </PanelProvider>
        </EditorProvider>
      </AssetProvider>
    </DndProvider>
  );
}

// 内部组件用于访问 PanelContext 并应用 Grid 布局
function EditorLayout() {
  const { isMenuBarOpen, isParametersPanelOpen } = usePanel();

  const gridTemplateColumns = cn(
    isMenuBarOpen ? "1fr" : "48px",
    "2fr",
    isParametersPanelOpen ? "1fr" : "48px"
  );

  return (
    <div
      className="grid h-full transition-[grid-template-columns] duration-300 ease-in-out bg-gray-50 gap-x-2"
      style={{ gridTemplateColumns }}
    >
      <SideBarMenu />
      <EditorArea />
      <Parameters />
    </div>
  );
}

// 用于访问 PanelContext 以控制 CodePreviewModal 的显示
function CodePreviewModalWrapper() {
  const { showCodePreview } = usePanel();
  return showCodePreview ? <CodePreviewModal /> : null;
}