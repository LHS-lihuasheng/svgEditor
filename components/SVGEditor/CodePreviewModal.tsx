/**
 * @description 代码预览模态框组件
 * 用于显示生成的SVG代码，并提供复制功能
 */
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { generateCode } from "@/utils/code-generator";
import { usePanel } from '@/contexts/PanelContext';
import type { BaseComponent } from '@/types/core';

interface CodePreviewModalProps {
  components: BaseComponent[];
}

export function CodePreviewModal({ components }: CodePreviewModalProps) {
  const { setShowCodePreview } = usePanel();

  // 处理点击背景关闭模态框
  const handleBackdropClick = () => {
    setShowCodePreview(false);
  };

  // 阻止卡片点击事件冒泡
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 处理复制代码
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCode(components))
      .then(() => alert("代码已复制到剪贴板"))
      .catch(err => console.error("复制失败:", err));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
      onClick={handleBackdropClick}
    >
      <Card className="max-w-4xl w-full" onClick={handleCardClick}>
        <CardHeader>
          <CardTitle>完整代码预览</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[70vh]">
            <pre className="p-4 bg-gray-50 rounded-lg">
              <code className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                {generateCode(components)}
              </code>
            </pre>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={handleCopyCode}
          >
            复制代码
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCodePreview(false)}
          >
            关闭
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 