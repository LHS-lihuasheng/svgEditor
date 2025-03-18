/**
 * @description 代码预览模态框组件
 * 用于显示生成的SVG代码，并提供复制功能
 */
import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { usePanel } from '@/contexts/PanelContext';
import { useCode } from '@/contexts/CodeContext'

export function CodePreviewModal() {
  const { setShowCodePreview } = usePanel();
  const { code } = useCode()

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    // // 编辑器加载完成后立即自动格式化
    // editor.getAction('editor.action.formatDocument')?.run();
    // 添加淡入动画
    editor.getDomNode()?.style.setProperty('opacity', '0');
    editor.getDomNode()?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    });
  };

  const handleBackdropClick = () => {
    setShowCodePreview(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => alert("代码已复制到剪贴板"))
      .catch(err => console.error("复制失败:", err))
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Card className="max-w-5xl w-[95%] rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">完整代码预览</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="h-[70vh]  rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="html"
              defaultValue={code}
              onMount={handleEditorDidMount}
              options={{
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                wordWrap: 'on',
                lineNumbersMinChars: 3,
                padding: { top: 12, bottom: 12 },
              }}
              theme="vs"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 px-6 py-4 bg-gray-50/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}
          >
            格式化
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-4 bg-blue-50 hover:bg-blue-100 text-blue-600"
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