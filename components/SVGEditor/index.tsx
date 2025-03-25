"use client"

import React from 'react';
import { SideBarMenu } from "./sideBarMenu";
import { EditorArea } from "./EditorArea";
import { Parameters } from "./Parameters/index";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CodePreviewModal } from "./CodePreviewModal";
import { PanelProvider } from '@/contexts/PanelContext';
import { EditorProvider } from '@/contexts/EditorContext';
import { usePanel } from '@/contexts/PanelContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CodeProvider } from '@/contexts/CodeContext';
import { AssetProvider } from "@/contexts/AssetContext"

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
                <SVGEditor />
              </TooltipProvider>
            </CodeProvider>
          </PanelProvider>
        </EditorProvider>
      </AssetProvider>
    </DndProvider>
  );
}

/**
 * @description SVG编辑器的主要组件，处理编辑器的核心功能
 * @returns {JSX.Element} SVG编辑器的用户界面
 */
function SVGEditor() {
  const { showCodePreview } = usePanel();

  return (
    <div className="h-full flex bg-gray-50">
      {/* 左侧工具栏 */}
      <SideBarMenu />

      {/* 中间编辑区域 */}
      <EditorArea />

      {/* 右侧参数面板 */}
      <Parameters />

      {/* 代码预览模态框 */}
      {showCodePreview && (
        <CodePreviewModal />
      )}
    </div>
  );
}